const Discord = require("discord.js");
const utils = require("../../stuff/utils");

module.exports = {
    name: 'clear',
    description: 'Clear up to 100 messages on the current channel, within the last 14 days.',
    args: true,
    usage: '<number of messages>',
    category: 'moderation',
    requireperms: 'manage_messages',
    execute(msg, args) {
        var amount = parseInt(args[0]); // Get the number of messages.
        if(isNaN(amount)) return utils.sendEmbeddedResponse(msg, false, true, `You did not enter a number!`, null, 0xFF0000); // If it's not a number...
        if(amount < 1) return utils.sendEmbeddedResponse(msg, false, true, `Number of messages to delete must be 1 or more!`, null, 0xFF0000); // If they enter less than one...
        if(amount > 100) amount = 100; // The limit is 100 so if it's above 100 set the amount to 100.
        msg.delete().then(() => { // Delete the author's message first.
            msg.channel.messages.fetch({limit: amount}).then(messages => { // Fetch the messages in the channel that are supposed to be deleted.
                const date = new Date().getTime(); // Get the current date in ms
                const getMessages = messages.map(m => m); // Map the fetched messages
                const msgsToDelete = new Discord.Collection(); // Create a collection
                var olderCount = 0; // The number of messages that are older than 14 days.
                for(const mesg of getMessages) {
                    if(date - mesg.createdTimestamp <= 1209600000) msgsToDelete.set(mesg.id, mesg); // This checks to see if the current ms - the created timestamp is greater than 14 days in ms. if it's not, add it to the map
                    else olderCount++; // otherwise, don't add it to the map, but increase the older count
                }
                msg.channel.bulkDelete(msgsToDelete).then(deleted => { // Bulk delete the messages.
                    if(olderCount > 0) utils.sendEmbeddedResponse(msg, false, false, `Deleted ${deleted.size} messages! I couldn't delete ${olderCount} of the ${amount} messages you told me to delete, as they are older than 14 days. Unfortunately you will need to remove these manually.`, null, 0x00FF00).then(mesg => mesg.delete({timeout: 5000}));
                    else utils.sendEmbeddedResponse(msg, false, false, `Deleted ${deleted.size} messages!`, null, 0x00FF00).then(mesg => mesg.delete({timeout: 5000}));
                });
            });
        });
    }
}