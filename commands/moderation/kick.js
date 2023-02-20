const utils = require("../../stuff/utils");

module.exports = {
    name: 'kick',
    description: 'Kick any member.',
    args: true,
    usage: '<member> [reason]',
    category: 'moderation',
    requireperms: 'kick members',
    execute(msg, args) {
        var memberToKick; // Get the member that will be kicked.
        if(msg.mentions.members.first()) memberToKick = msg.mentions.members.first(); // First, check to see if a member was mentioned
        else if (msg.guild.members.cache.find(m => m.id === args[0])) memberToKick = msg.guild.members.cache.find(m => m.id === args[0]); // Otherwise, check for ID.
        else return utils.sendEmbeddedResponse(msg, false, true, `I can't find that member!`, null, 0xFF0000); // Otherwise, return this.
        if (args[1]) var reason = args.splice(1, args.length).join(" "); // If a reason is given, set the reason to it.
        else var reason = "No reason was given"; // Otherwise set the reason to this.
        if(!msg.guild.me.hasPermission('KICK_MEMBERS')) return utils.sendEmbeddedResponse(msg, false, true, `I don't have permissions to kick members! Please make sure I have the \`administrator\` permission so I can work properly!`, null, 0xFF0000); // Checks to see if the bot has permissions to kick users.
        else memberToKick.kick(`By ${msg.member.username} for: ${reason}`).then(mbr => { // Kick the member, and display in the audit log who did it and for what reason.
            utils.sendEmbeddedResponse(msg, false, true, `${mbr} was kicked for: ${reason}`, null, 0x00FF00); // Send the confirmation message to the channel
            mbr.send(`You have been kicked from **${msg.guild.name}** by ${msg.member} for: ${reason}`).catch(err => utils.sendEmbeddedResponse(msg, false, true, `We tried to DM the user about their kick, but got this error: \`${err}\``)); // Send a DM to the member, if it errors, then send this message to the channel.
        }).catch(err => utils.sendEmbeddedResponse(msg, false, true, `An error occured when trying to kick that member. \`${err}\``, null, 0xFF0000)); // If there is an unknown error, send this
    }
}