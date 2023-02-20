const utils = require("../../stuff/utils")

module.exports = {
    name: 'unban',
    description: 'Unban any banned user on this server. If you provide a reason for the unban, a DM will be sent to the user. If you don\'t, no message will be sent.',
    args: true,
    usage: '<member ID> [reason]',
    category: 'moderation',
    requireperms: 'ban members',
    execute(msg, args) {
        if(args[1]) {
            var reason = args.splice(1, args.length).join(" ");
            msg.guild.members.unban(args[0], reason).then(mbr => {
                utils.sendEmbeddedResponse(msg, false, true, `${mbr} was unbanned from this server, with the reason: ${reason}`, null, 0x00FF00);
                mbr.send(`You have been unbanned from **${msg.guild.name}**, with the reason: ${reason}`);
            }).catch(err => utils.sendEmbeddedResponse(msg, false, true, `I can't find that user!`, null, 0xFF0000));
        }
        else {
            msg.guild.members.unban(args[0]).then(mbr => {
                utils.sendEmbeddedResponse(msg, false, true, `${mbr} was unbanned from this server! (A DM has not been sent to them, as no reason was given.)`, null, 0x00FF00);
            }).catch(err => utils.sendEmbeddedResponse(msg, false, true, `I can't find that user!`, null, 0xFF0000));
        }
    }
}