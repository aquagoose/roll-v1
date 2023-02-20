const jsonWriter = require("../../stuff/jsonWriter");
const utils = require("../../stuff/utils");
const fs = require('fs');

module.exports = {
    name: 'filter',
    description: 'Manage the word filter for your server.',
    args: true,
    usage: '<option> [option arguments]',
    requireperms: 'administrator',
    category: 'moderation',
    execute(msg, args) {
        const option = args[0].toLowerCase();
        var serverData = jsonWriter.readServerData('./data/server-config.json', msg.guild);
        switch(option) {
            case 'help':
                utils.sendEmbeddedResponse(msg, true, false, null, `${this.name} - Help`, null, [
                    {
                        name: `\`${msg.guild.prefix}${this.name} <enable/disable>\``,
                        value: `Enable or disable the word filter for your server. If this is your first time enabling the filter, by default, all channels will be filtered, and the type will be \`1\`.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} type <1/2/3>\``,
                        value: `Set the filter type. They are:\n\`1\` - Delete the message, and resend it, but with the words censored.\n\`2\` - Delete the message, and notify the member that some words in their message are blocked.\n\`3\` - Just delete the message.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} ignorechannel\``,
                        value: `Tell the word filter to ignore the current channel, and it will not be filtered.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} addchannel\``,
                        value: `Tell the word filter to filter the current channel, if it has been ignored.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} removeword <word>\``,
                        value: `Prevent the word from tripping the filter.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} addword <word>\``,
                        value: `Add a word into the filter.`
                    },
                ]);
                break;
            case 'enable':
                if(!serverData) { jsonWriter.createServer('./data/server-config.json', msg.guild); serverData = {}; } // If the server doesn't exist, create it.
                if(!serverData['filter']) serverData['filter'] = {}; // If the filter doesn't exist, create it.
                if(serverData['filter']['enabled']) return utils.sendEmbeddedResponse(msg, false, true, `The word filter is already enabled for this server!`, null, 0xFF0000); // If it's enabled already, send this
                serverData['filter']['enabled'] = true; // Otherwise, set the enabled status to true
                if(!serverData['filter']['type']) serverData['filter']['type'] = "1"; // Set the type to 1 as a default
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `The word filter has been enabled for this server!`, null, 0x00FF00);
                break;
            case 'disable': // This works similarly to the above, however doesn't create the server if it doesn't exist.
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `The word filter has not been enabled!`, null, 0xFF0000);
                if(!serverData['filter']) return utils.sendEmbeddedResponse(msg, false, true, `The word filter has not been enabled!`, null, 0xFF0000);
                if(!serverData['filter']['enabled']) return utils.sendEmbeddedResponse(msg, false, true, `The word filter has not been enabled!`, null, 0xFF0000);
                serverData['filter']['enabled'] = false;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `The word filter has been disabled for this server!`, null, 0x00FF00);
                break;
            case 'ignorechannel':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']['enabled']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                var channel = msg.channel.id; // Gets the channel ID;
                var ignoredList = serverData['filter']['ignoredchannels'];
                if(!ignoredList) ignoredList = []; // If the ignoredchannels list doesn't exist, create it
                if(ignoredList.indexOf(channel) != -1) return utils.sendEmbeddedResponse(msg, false, true, `You have already ignored this channel!`, null, 0xFF0000); // If the channel already exists in the list, send this
                ignoredList.push(channel); // Otherwise add it to the list
                serverData['filter']['ignoredchannels'] = ignoredList; // Then set the serverdata to this
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `<#${channel}> will no longer be filtered by the word filter.`, null, 0x00FF00);
                break;
            case 'addchannel': // This works similarly to above.
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']['enabled']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                var channel = msg.channel.id;
                var ignoredList = serverData['filter']['ignoredchannels'];
                if(!ignoredList) return utils.sendEmbeddedResponse(msg, false, true, `This channel is not being ignored!`, null, 0xFF0000);
                if(ignoredList.indexOf(channel) == -1) return utils.sendEmbeddedResponse(msg, false, true, `This channel is not being ignored!`, null, 0xFF0000);
                ignoredList.splice(ignoredList.indexOf(channel), 1);
                serverData['filter']['ignoredchannels'] = ignoredList;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `<#${channel}> will now be filtered by the word filter.`, null, 0x00FF00);
                break;
            case 'type':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']['enabled']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a type!`, null, 0xFF0000);
                var type;
                type = parseInt(args[1]);
                if(isNaN(type)) return utils.sendEmbeddedResponse(msg, false, true, `Please provide the type as a **number**!`, null, 0xFF0000); // If the type is not a number, send this
                if(type > 3 || type < 1) return utils.sendEmbeddedResponse(msg, false, true, `Type must be 1, 2, or 3.`, null, 0xFF0000); // Makes sure that the type is in range
                serverData['filter']['type'] = type.toString();
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `Filter type has been set to ${type}!`, null, 0x00FF00);
                break;
            case 'removeword':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']['enabled']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a word to ignore!`, null, 0xFF0000);
                var swears = JSON.parse(fs.readFileSync('./stuff/swears.json')); // Get the swear list
                var ignoredWords = serverData['filter']['removedwords']; // Get the ignore words list
                var addedWords = serverData['filter']['addedwords']; // Get the added words list
                if(!ignoredWords) ignoredWords = []; // If the lists don't exist, create them
                if(!addedWords) addedWords = [];
                if(ignoredWords.indexOf(args[1].toLowerCase()) != -1) return utils.sendEmbeddedResponse(msg, false, true, `You have already removed this word!`, null, 0xFF0000); // If the word already exists, send this
                if(swears.indexOf(args[1].toLowerCase()) == -1 && addedWords.indexOf(args[1].toLowerCase()) == -1) return utils.sendEmbeddedResponse(msg, false, true, `This word is not being filtered!`, null, 0xFF0000); // Checks to see if the word is in either of the lists, if it is not, send this.
                if(addedWords.indexOf(args[1].toLowerCase()) != -1) addedWords.splice(addedWords.indexOf(args[1].toLowerCase()), 1); // If the word is in the added words list, remove it from that list.
                else ignoredWords.push(args[1].toLowerCase()); // Otherwise, add it to the list
                serverData['filter']['removedwords'] = ignoredWords; // Set the values
                serverData['filter']['addedwords'] = addedWords;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `\`${args[1].toLowerCase()}\` will no longer be filtered by the word filter!`, null, 0x00FF00);
                break;
            case 'addword': // This works the same as above, just with some values changed
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!serverData['filter']['enabled']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable the word filter before you can perform this action!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a word to add!`, null, 0xFF0000);
                var swears = JSON.parse(fs.readFileSync('./stuff/swears.json'));
                var addedWords = serverData['filter']['addedwords'];
                var ignoredWords = serverData['filter']['removedwords'];
                if(!addedWords) addedWords = [];
                if(!ignoredWords) ignoredWords = [];
                if(addedWords.indexOf(args[1].toLowerCase()) != -1) return utils.sendEmbeddedResponse(msg, false, true, `You have already added this word!`, null, 0xFF0000);
                if(swears.indexOf(args[1].toLowerCase()) != -1 && ignoredWords.indexOf(args[1].toLowerCase()) == -1) return utils.sendEmbeddedResponse(msg, false, true, `This word is being filtered!`, null, 0xFF0000);
                if(ignoredWords.indexOf(args[1].toLowerCase()) != -1) ignoredWords.splice(ignoredWords.indexOf(args[1].toLowerCase()), 1);
                else addedWords.push(args[1].toLowerCase());
                serverData['filter']['addedwords'] = addedWords;
                serverData['filter']['removedwords'] = ignoredWords;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `\`${args[1].toLowerCase()}\` will now be filtered by the word filter!`, null, 0x00FF00);
                break;
            default:
                utils.sendEmbeddedResponse(msg, false, true, `That's not a valid setting. Type \`${msg.guild.prefix}${this.name} help\` to get a list of commands.`, null, 0xFF0000);
                break;
        }
    }
}