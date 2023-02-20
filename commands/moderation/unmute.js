const jsonWriter = require("../../stuff/jsonWriter");
const utils = require("../../stuff/utils");

module.exports = {
    name: 'unmute',
    description: 'Unmute a muted user. If you provide a reason for the unmute, a DM will be sent to the user. If you don\'t, no message will be sent.',
    args: true,
    usage: '<member> [reason]',
    requireperms: 'administrator',
    category: 'moderation',
    execute(msg, args) {
        var mbr; // Stores the member.
        var tempdata = jsonWriter.findServerInList('./data/tempdata.json', msg.guild); // Get the server data from the list.
        if(!tempdata) return utils.sendEmbeddedResponse(msg, false, true, `That user has not been muted!`, null, 0xFF0000); // If the server does not exist, return this.
        if(!tempdata['mutedusers']) return utils.sendEmbeddedResponse(msg, false, true, `That user has not been muted!`, null, 0xFF0000); // If the mutedusers does not exist, return this.
        if(msg.mentions.members.first()) mbr = msg.mentions.members.first(); // First check if the user has been mentioned.
        else if(msg.guild.members.cache.find(m => m.id === args[0])) mbr = msg.guild.members.cache.find(m => m.id === args[0]); // Otherwise check for an ID.
        else return utils.sendEmbeddedResponse(msg, false, true, `I can't find that user!`, null, 0xFF0000); // Otherwise return this.
        if(!tempdata['tempmutedusers']) tempdata['tempmutedusers'] = {};
        if(!tempdata['mutedusers'][mbr.id] && !tempdata['tempmutedusers'][mbr.id]) return utils.sendEmbeddedResponse(msg, false, true, `That user has not been muted!`, null, 0xFF0000); // If the member does not exist, return the same message that has probably been written 5 times now aaaaaaaaaaaaaaaaa
        if(tempdata['tempmutedusers'][mbr.id]) {
            mbr.roles.set(tempdata['tempmutedusers'][mbr.id]['roles']).then(m => { // Set the member their previously assigned roles.
                if(args[1]) {
                    var reason = args.splice(1, args.length).join(" ");
                    utils.sendEmbeddedResponse(msg, false, true, `${m}'s tempmute has been lifted, with the reason: ${reason}`, null, 0x00FF00);
                    m.send(`Your tempmute on **${msg.guild.name}** has been lifted, with the reason: ${reason}`).catch(err => utils.sendEmbeddedResponse(msg, false, true, `We tried to DM the user about their kick, but got this error: \`${err}\``));
                }
                else utils.sendEmbeddedResponse(msg, false, true, `${m}'s tempmute has been lifted! (A DM has not been sent to them, as no reason was given.)`, null, 0x00FF00);
                delete tempdata['tempmutedusers'][mbr.id]; // Delete them out of the list, then write the data
                jsonWriter.writeListData('./data/tempdata.json', msg.guild, tempdata);
            })//.catch(err => { return utils.sendEmbeddedResponse(msg, false, true, `I tried to unmute the user, but got this error: \`${err}\`. Please make sure my role is above all other roles on the server in the role list, or I cannot perform certain commands correctly!`, null, 0xFF0000);}); // If the bot does not have permissions to do this, send this message.
        }
        else {
            mbr.roles.set(tempdata['mutedusers'][mbr.id]).then(m => { // Set the member their previously assigned roles.
                if(args[1]) {
                    var reason = args.splice(1, args.length).join(" ");
                    utils.sendEmbeddedResponse(msg, false, true, `${m} has been unmuted, with the reason: ${reason}`, null, 0x00FF00);
                    m.send(`You have been unmuted from **${msg.guild.name}**, with the reason: ${reason}`).catch(err => utils.sendEmbeddedResponse(msg, false, true, `We tried to DM the user about their kick, but got this error: \`${err}\``));
                }
                else utils.sendEmbeddedResponse(msg, false, true, `${m} has been unmuted! (A DM has not been sent to them, as no reason was given.)`, null, 0x00FF00);
                delete tempdata['mutedusers'][mbr.id]; // Delete them out of the list, then write the data
                jsonWriter.writeListData('./data/tempdata.json', msg.guild, tempdata);
            }).catch(err => { return utils.sendEmbeddedResponse(msg, false, true, `I tried to unmute the user, but got this error: \`${err}\`. Please make sure my role is above all other roles on the server in the role list, or I cannot perform certain commands correctly!`, null, 0xFF0000);}); // If the bot does not have permissions to do this, send this message.
        }
    }
}