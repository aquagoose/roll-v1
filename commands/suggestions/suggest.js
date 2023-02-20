const jsonWriter = require("../../stuff/jsonWriter");
const utils = require("../../stuff/utils");

module.exports = {
    name: 'suggest',
    description: 'Submit a suggestion.',
    args: true,
    usage: '<text>',
    category: 'suggest',
    aliases: ['submit'],
    execute(msg, args) { // This command actually worked first time oml
        const serverData = jsonWriter.readServerData('./data/server-config.json', msg.guild); // Get the server data
        if(!serverData) return utils.sendEmbeddedResponse(msg, false, false, `The suggestion system has not been enabled for this server!`, null, 0xFF0000); // This code checks to see if the server both exists and that the system is enabled
        if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, false, `The suggestion system has not been enabled for this server!`, null, 0xFF0000);
        if(!serverData['suggestions']['enabled']) return utils.sendEmbeddedResponse(msg, false, false, `The suggestion system has not been enabled for this server!`, null, 0xFF0000);
        if(msg.channel.id != serverData['suggestions']['submitchannel']) return utils.sendEmbeddedResponse(msg, false, true, `Please submit your suggestion in <#${serverData['suggestions']['submitchannel']}>!`, null, 0xFF0000); // Makes sure they submitted the suggestion in the submit channel
        const text = args.join(" "); // The suggestion text
        var suggestions = jsonWriter.readServerData('./data/suggestions.json', msg.guild); // Get a list of suggestions on the server
        if(!suggestions) { jsonWriter.createServer('./data/suggestions.json', msg.guild); suggestions = {}; } // If the suggestions don't exist, create it
        var id = utils.generateString(5); // Generate an ID
        var attempts = 0;
        while(suggestions[id]) { // This code tries to generate a new ID if a suggestion with the ID is found
            attempts++;
            id = utils.generateString(5);
            if(!suggestions[id]) break; // If the attempts is above 5 then call it quits
            if(attempts >= 5) return utils.sendEmbeddedResponse(msg, false, false, `It appears that the max suggestion limit for this server has been reached. Please purge some suggestions, or delete all of them. (NOT YET AVAILABLE)`, null, 0xFF0000);
        }
        const date = new Date();
        const embed = { // Create the embed
            title: 'New Suggestion',
            color: 0x0000FF,
            author: {
                name: msg.member.displayName,
                icon_url: msg.author.displayAvatarURL()
            },
            description: text,
            timestamp: date,
            footer: {text: `Suggestion ID: ${id} | Submitted:`}
        }
        const channel = msg.guild.channels.cache.get(serverData['suggestions']['newchannel']); // Find the channel to send messages to
        if(!channel) return utils.sendEmbeddedResponse(msg, false, true, `I can't find the channel that new suggestions should get sent to. Please make sure I have an available channel to send new suggestions to.`, null, 0xFF0000); // If the channel cannot be found...
        channel.send({embed:embed}).then(message => { // Send the message
            if(serverData['suggestions']['voting']) { // If voting is enabled, then react with the reactions in the right order
                message.react(serverData['suggestions']['emojis']['yes']).then(() => {
                    message.react(serverData['suggestions']['emojis']['no']).then(() => {
                        message.react(serverData['suggestions']['emojis']['maybe']);
                    });
                });
            }
            msg.react('✅'); // React with checkmark on the user's message
            msg.delete({timeout: 5000}); // Delete after 5 seconds
            utils.sendEmbeddedResponse(msg, false, false, `Your suggestion has been submitted!`, null, 0x00FF00).then(mesg => mesg.delete({timeout:5000})); // Sebd this confirmation message
            suggestions[id] = {"msgID":message.id,"text":text,"authorname":msg.member.displayName,"authoravatar":msg.author.displayAvatarURL(),"authorID":msg.member.id,"timesent":date}; // Store allll the data here
            jsonWriter.writeServerData('./data/suggestions.json', msg.guild, suggestions);
        })
    }
}