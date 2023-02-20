const jsonWriter = require('../../stuff/jsonWriter');
const utils = require('../../stuff/utils');

module.exports = {
    name: 'mute',
    description: 'Permanently mute a member.',
    args: true,
    usage: '<member> [reason]',
    requireperms: 'administrator',
    category: 'moderation',
    execute(msg, args) {
        var mbr; // The member that will be muted.
        if(msg.mentions.members.first()) mbr = msg.mentions.members.first(); // Checks first for a mention
        else if(msg.guild.members.cache.find(m => m.id === args[0])) mbr = msg.guild.members.cache.find(m => m.id === args[0]); // Then for the member ID.
        else return utils.sendEmbeddedResponse(msg, false, true, `I couldn't find that user!`, null, 0xFF0000); // Otherwise, send this.
        if(mbr == msg.member) return utils.sendEmbeddedResponse(msg, false, true, `You can't mute yourself!`, null, 0xFF0000);
        else if (mbr.user.bot) return utils.sendEmbeddedResponse(msg, false, true, `You can't mute bots!`, null, 0xFF0000);
        var tempdata = jsonWriter.findServerInList('./data/tempdata.json', msg.guild); // Look for the server temp data.
        if(tempdata) { if(tempdata['mutedusers']) { if(tempdata['mutedusers'][mbr.id]) return utils.sendEmbeddedResponse(msg, false, true, `That user is already muted!`, null, 0xFF0000); }} // If the user is already muted, why mute them again?
        if(tempdata) { if(tempdata['tempmutedusers']) { if(tempdata['tempmutedusers'][mbr.id]) return utils.sendEmbeddedResponse(msg, false, true, `That user is already muted!`, null, 0xFF0000); }} // If the user is already muted, why mute them again?
        const serverConfig = jsonWriter.readServerData('./data/server-config.json', msg.guild); // And also get the server config to look for the mute role
        if(serverConfig) {
            if(serverConfig['muterole']) var muterole = serverConfig['muterole']; // If there is a mute role, set the mute role to it.
        }
        const roles = mbr.roles.cache.map(r => r.id); // Get a list of the member's role IDs
        const findRole = msg.guild.roles.cache.get(muterole); // Find the role in the server, only used to verify that it exists.
        if(muterole && !findRole) { utils.sendEmbeddedResponse(msg, false, true, `I've removed the user's roles, but I can't find the muted role you have set! If you have deleted this role, please either disable the mute role or set it to a different role.`, null, 0xFF0000); } // Otherwise, do this.
        mbr.roles.set([muterole]).then(() => {
            if(!tempdata) { jsonWriter.createListServer('./data/tempdata.json', msg.guild); tempdata = {}}; // If the server does not exist, create it.
            if(!tempdata['mutedusers']) tempdata['mutedusers'] = {}; // If mutedusers does not exist, create it.
            tempdata['mutedusers'][mbr.id] = roles; // Store the member's roles here.
            jsonWriter.writeListData('./data/tempdata.json', msg.guild, tempdata);
            if(args[1]) var reason = args.splice(1, args.length).join(" ");
            else var reason = "No reason was given.";
            utils.sendEmbeddedResponse(msg, false, true, `${mbr} (ID: ${mbr.id}) has been muted for: ${reason}`, null, 0x00FF00);
            mbr.send(`You have been muted on **${msg.guild.name}** by ${msg.member} for: ${reason}`).catch(err => utils.sendEmbeddedResponse(msg, false, true, `We tried to DM the user about their kick, but got this error: \`${err}\``));
        }).catch(err => { return utils.sendEmbeddedResponse(msg, false, true, `I tried to mute the user, but got this error: \`${err}\`. Please make sure my role is above all other roles on the server in the role list, or I cannot perform certain commands correctly!`, null, 0xFF0000);}); // Set the member's roles to the mute role. If muterole is null or undefined, no roles will be set.
    }
}