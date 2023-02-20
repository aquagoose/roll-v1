const jsonWriter = require("../../stuff/jsonWriter");
const utils = require("../../stuff/utils")

module.exports = {
    name: 'tempmute',
    description: 'Temporarily mute a user for the specified length of time. Specify time in m or h (so 5m for 5 minutes). If you don\'t want the user to be notified when they are unmuted, type `--nodm` before your (optional) reason.',
    args: true,
    usage: '<member> <length of time (h/m)> [nodm?] [reason]',
    requireperms: 'administrator',
    category: 'moderation',
    execute(msg, args) {
        if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please specify length of time in minutes(m) or hours(h)!`, null, 0xFF0000); // Makes sure that they time they specify is either in hours or minutes
        var mbr; // The usual "get the member" stuff
        if(msg.mentions.members.first()) mbr = msg.mentions.members.first();
        else if(msg.guild.members.cache.find(m => m.id === args[0])) mbr = msg.guild.members.cache.find(m => m.id === args[0]);
        else return utils.sendEmbeddedResponse(msg, false, true, `I couldn't find that user!`, null, 0xFF0000);
        if(mbr == msg.member) return utils.sendEmbeddedResponse(msg, false, true, `You can't mute yourself!`, null, 0xFF0000);
        else if (mbr.user.bot) return utils.sendEmbeddedResponse(msg, false, true, `You can't mute bots!`, null, 0xFF0000);
        var checkGetTime = args[1].slice(0, args[1].length-1); // Get the time number
        if(isNaN(checkGetTime)) return utils.sendEmbeddedResponse(msg, false, true, `Length of time must be a number!`, null, 0xFF0000); // Check it is a number
        const timeParam = args[1].slice(args[1].length-1, args[1].length).toLowerCase(); // Get the time parameter
        if(timeParam == 'm') getTime = checkGetTime*60000; // This code detects what the time parameter is, and multiplies the time accordingly
        else if(timeParam == 'h') getTime = checkGetTime*3600000;
        else return utils.sendEmbeddedResponse(msg, false, true, `Please specify length of time in minutes(m) or hours(h)!`, null, 0xFF0000);
        var noDm = false;
        var reason;
        if(args[2]) {
            if(args[2].toLowerCase() == '--nodm') { // If the user writes nodm, then don't send them a DM.
                noDm = true;
                reason = args.splice(3, args.length).join(" "); // Change the way it looks for a reason accordingly
            }
            else reason = args.splice(2, args.length).join(" ");
        }
        var tempData = jsonWriter.findServerInList('./data/tempdata.json', msg.guild); // Get the temp data
        if(!tempData) { jsonWriter.createListServer('./data/tempdata.json', msg.guild); tempData = {}; } // If the temp data doesn't exist, create it.
        if(!tempData['tempmutedusers']) tempData['tempmutedusers'] = {}; // If the temp muted doesn't exist, create it.
        if(!tempData['mutedusers']) tempData['mutedusers'] = {}; // If muted users doesn't exist, create it.
        if(tempData['mutedusers'][mbr.id] || tempData['tempmutedusers'][mbr.id]) return utils.sendEmbeddedResponse(msg, false, true, `That user is already muted!`, null, 0xFF0000); // Checks to see if the user is in either of the lists
        const serverData = jsonWriter.readServerData('./data/server-config.json', msg.guild); // Get the server data.
        if(serverData) { if(serverData['muterole']) var muterole = serverData['muterole']; } // If there is a mute role defined, set it.
        const roles = mbr.roles.cache.map(r => r.id); // Get a list of the member's role IDs
        mbr.roles.set([muterole]).then(() => { // Set the user's roles
            const time = new Date().getTime() + getTime; // Get the current time is us and add the getTime to it.
            tempData['tempmutedusers'][mbr.id] = {"roles":roles,"unmutetime":time,"nodm":noDm}; // write this data to the tempData
            jsonWriter.writeListData('./data/tempdata.json', msg.guild, tempData);
            if(!reason) reason = "No reason was given."; // This stuff is fairly self explanatory
            var timeParamLong;
            if(timeParam == 'm') timeParamLong = 'minutes';
            else if(timeParam == 'h') timeParamLong = 'hours';
            else timeParamLong = 'errors (haha, something went wrong, you should probably tell us)';
            utils.sendEmbeddedResponse(msg, false, true, `${mbr} (ID: ${mbr.id}) has been tempmuted for ${checkGetTime} ${timeParamLong} for: ${reason}`, null, 0x00FF00);
            mbr.send(`You have been tempmuted on **${msg.guild.name}** for ${checkGetTime} ${timeParamLong} by ${msg.member} for: ${reason}`).catch(err => utils.sendEmbeddedResponse(msg, false, true, `We tried to DM the user about their kick, but got this error: \`${err}\``));
        });
    }
}