const utils = require("../../stuff/utils");
const jsonWriter = require("../../stuff/jsonWriter");

module.exports = {
    name: 'approve',
    description: 'Approve any suggestion.',
    args: true,
    usage: '<suggestion id> [reason]',
    requireperms: 'administrator',
    category: 'suggest',
    aliases: ['accept'],
    async execute(msg, args) { // TODO: Error checking
        const serverData = jsonWriter.readServerData('./data/server-config.json', msg.guild); // Get the server data, the usual check to see if the suggestions exist etcetcetcetc......... (alhtough this command can still be used if suggestions are disabled)
        if(!serverData) return utils.sendEmbeddedResponse(msg, false, false, `The suggestion system has not been set up for this server!`, null, 0xFF0000);
        if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, false, `The suggestion system has not been set up for this server!`, null, 0xFF0000);
        var suggestions = jsonWriter.readServerData('./data/suggestions.json', msg.guild); // Get the suggestions
        const id = args[0].toUpperCase(); // Get the ID
        const reason = args.splice(1, args.length).join(" "); // Get the reason
        if(!suggestions[id]) return utils.sendEmbeddedResponse(msg, false, true, `No suggestion of ID \`${id}\` exists!`, null, 0xFF0000).then(message => { // If the ID cannot be found.....
            msg.delete({timeout:5000});
            message.delete({timeout:5000});
        });
        const mesg = await msg.channel.messages.fetch(suggestions[id]['msgID']).catch(err => { utils.sendEmbeddedResponse(msg, false, true, `Please run this command in the same channel that the suggestion is located.`, null, 0xFF0000); return;}); // This doesn't work properly
        var embed = { // Create the embed
            title: `Approved Suggestion`,
            color: 0x00FF00,
            description: suggestions[id]['text'],
            author: {
                name: suggestions[id]['authorname'],
                icon_url: suggestions[id]['authoravatar']
            },
            timestamp: suggestions[id]['timesent'],
            footer: {text:`Suggestion ID: ${id} | Submitted:`}
        };
        if(reason) embed['fields'] = [ // If there is a reason, add this to the embed
            {
                name: `${msg.member.displayName} said...`,
                value: reason
            }
        ];
        const channel = msg.guild.channels.cache.get(serverData['suggestions']['approvedchannel']);
        if(!channel) return utils.sendEmbeddedResponse(msg, false, true, `I can't find the channel that approved suggestions should get sent to. Please make sure I have an available channel to send approved suggestions to.`, null, 0xFF0000); // If the channel cannot be found...
        mesg.delete(); // Delete the original embed
        channel.send({embed: embed}).then(message => { // Then resend it to the new channel
            msg.react('✅');
            msg.delete({timeout: 5000});
            suggestions[id]['msgID'] = message.id;
            jsonWriter.writeServerData('./data/suggestions.json', msg.guild, suggestions);
            if(serverData['suggestions']['dm']) {
                const getMember = msg.guild.members.cache.get(suggestions[id]['authorID']);
                if(getMember) {
                    embed['title'] = "Your suggestion was approved!";
                    getMember.send({embed: embed});
                }
            }
        });
    }
}