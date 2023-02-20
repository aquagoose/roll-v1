const jsonWriter = require("../../stuff/jsonWriter");
const utils = require("../../stuff/utils");

module.exports = {
    name: 'suggestion',
    description: 'Manage the suggestion system for your server. Type `{prefix}{cmdName} help` to get a list of commands.',
    args: true,
    usage: '<option> [option arguments]',
    requireperms: 'administrator',
    category: 'setup',
    aliases: ['suggestions'],
    execute(msg, args) { // TODO: Suggestion status, and custom emojis, extra checking to make sure you don't re-enable already enabled features etc.
        const option = args[0].toLowerCase();
        var serverData = jsonWriter.readServerData('./data/server-config.json', msg.guild);
        switch(option) {
            case 'help':
                utils.sendEmbeddedResponse(msg, true, false, null, `${this.name} - Help`, null, [
                    {
                        name: `\`${msg.guild.prefix}${this.name} newchannel <channel>\``,
                        value: `Where new suggestions will be sent.`
                    },
                    {
                        name: `---Things below this line are optional---`,
                        value: `Once you've set up the new suggestions channel, by default, all channels will be set to the new suggestions channel.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} submitchannel <channel>\``,
                        value: `Where members must submit new suggestions.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} approvedchannel <channel>\``,
                        value: `Where approved suggestions will be sent.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} potentialchannel <channel>\``,
                        value: `Where potential suggestions will be sent.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} deniedchannel <channel>\``,
                        value: `Where denied suggestions will be sent.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} inconclusivechannel <channel>\``,
                        value: `Where inconclusive suggestions will be sent.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} <enable/disable>\``,
                        value: `Enable or disable the suggestion system.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} voting <on/off>\``,
                        value: `If enabled, a set of reactions (votes) will get added to any new suggestion. By default:\n:white_check_mark: is for yes\n:x: is for no\n:grey_question: is for maybe`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} dm <enable/disable>\``,
                        value: `If enabled, the member will get DMed when you manage their suggestion.`
                    },
                ]);
                break;
            case 'newchannel': // This must be set.
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a channel!`, null, 0xFF0000); // Checks to see if they sent a channel
                var channel; // The usual get channel nonsense
                if(msg.mentions.channels.first()) channel = msg.mentions.channels.first();
                else if (msg.guild.channels.cache.find(c => c.name === args[1])) channel = msg.guild.channels.cache.find(c => c.name === args[1]);
                else if (msg.guild.channels.cache.find(c => c.id === args[1])) channel = msg.guild.channels.cache.find(c => c.id === args[1]);
                else return utils.sendEmbeddedResponse(msg, false, true, `I can't find that channel!`, null, 0xFF0000);
                if(!serverData) { jsonWriter.createServer('./data/server-config.json', msg.guild); serverData = {}; } // The usual create server nonsense. If you're confused please look at ANY other file
                if(!serverData['suggestions']) serverData['suggestions'] = {};
                serverData['suggestions']['newchannel'] = channel.id; // This code sets all the channels to equal the current channel ID, if not set already.
                if(!serverData['suggestions']['submitchannel']) serverData['suggestions']['submitchannel'] = channel.id;
                if(!serverData['suggestions']['approvedchannel']) serverData['suggestions']['approvedchannel'] = channel.id;
                if(!serverData['suggestions']['potentialchannel']) serverData['suggestions']['potentialchannel'] = channel.id;
                if(!serverData['suggestions']['deniedchannel']) serverData['suggestions']['deniedchannel'] = channel.id;
                if(!serverData['suggestions']['inconclusivechannel']) serverData['suggestions']['inconclusivechannel'] = channel.id;
                if(serverData['suggestions']['enabled'] != true || serverData['suggestions']['enabled'] != false) serverData['suggestions']['enabled'] = true;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `<#${channel.id}> has been set as the **new suggestions** channel!`, null, 0x00FF00);
                break;
            case 'submitchannel': // TODO: Comment this
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a channel!`, null, 0xFF0000);
                var channel;
                if(msg.mentions.channels.first()) channel = msg.mentions.channels.first();
                else if (msg.guild.channels.cache.find(c => c.name === args[1])) channel = msg.guild.channels.cache.find(c => c.name === args[1]);
                else if (msg.guild.channels.cache.find(c => c.id === args[1])) channel = msg.guild.channels.cache.find(c => c.id === args[1]);
                else return utils.sendEmbeddedResponse(msg, false, true, `I can't find that channel!`, null, 0xFF0000);
                serverData['suggestions']['submitchannel'] = channel.id;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `<#${channel.id}> has been set as the **submit suggestions** channel!`, null, 0x00FF00);
                break;
            case 'approvedchannel':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a channel!`, null, 0xFF0000);
                var channel;
                if(msg.mentions.channels.first()) channel = msg.mentions.channels.first();
                else if (msg.guild.channels.cache.find(c => c.name === args[1])) channel = msg.guild.channels.cache.find(c => c.name === args[1]);
                else if (msg.guild.channels.cache.find(c => c.id === args[1])) channel = msg.guild.channels.cache.find(c => c.id === args[1]);
                else return utils.sendEmbeddedResponse(msg, false, true, `I can't find that channel!`, null, 0xFF0000);
                serverData['suggestions']['approvedchannel'] = channel.id;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `<#${channel.id}> has been set as the **approved suggestions** channel!`, null, 0x00FF00);
                break;
            case 'potentialchannel':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a channel!`, null, 0xFF0000);
                var channel;
                if(msg.mentions.channels.first()) channel = msg.mentions.channels.first();
                else if (msg.guild.channels.cache.find(c => c.name === args[1])) channel = msg.guild.channels.cache.find(c => c.name === args[1]);
                else if (msg.guild.channels.cache.find(c => c.id === args[1])) channel = msg.guild.channels.cache.find(c => c.id === args[1]);
                else return utils.sendEmbeddedResponse(msg, false, true, `I can't find that channel!`, null, 0xFF0000);
                serverData['suggestions']['potentialchannel'] = channel.id;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `<#${channel.id}> has been set as the **potential suggestions** channel!`, null, 0x00FF00);
                break;
            case 'deniedchannel':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a channel!`, null, 0xFF0000);
                var channel;
                if(msg.mentions.channels.first()) channel = msg.mentions.channels.first();
                else if (msg.guild.channels.cache.find(c => c.name === args[1])) channel = msg.guild.channels.cache.find(c => c.name === args[1]);
                else if (msg.guild.channels.cache.find(c => c.id === args[1])) channel = msg.guild.channels.cache.find(c => c.id === args[1]);
                else return utils.sendEmbeddedResponse(msg, false, true, `I can't find that channel!`, null, 0xFF0000);
                serverData['suggestions']['deniedchannel'] = channel.id;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `<#${channel.id}> has been set as the **denied suggestions** channel!`, null, 0x00FF00);
                break;
            case 'inconclusivechannel':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set a channel for **new suggestions** first!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a channel!`, null, 0xFF0000);
                var channel;
                if(msg.mentions.channels.first()) channel = msg.mentions.channels.first();
                else if (msg.guild.channels.cache.find(c => c.name === args[1])) channel = msg.guild.channels.cache.find(c => c.name === args[1]);
                else if (msg.guild.channels.cache.find(c => c.id === args[1])) channel = msg.guild.channels.cache.find(c => c.id === args[1]);
                else return utils.sendEmbeddedResponse(msg, false, true, `I can't find that channel!`, null, 0xFF0000);
                serverData['suggestions']['inconclusivechannel'] = channel.id;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `<#${channel.id}> has been set as the **inconclusive suggestions** channel!`, null, 0x00FF00);
                break;
            case 'enable':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(serverData['suggestions']['enabled']) return utils.sendEmbeddedResponse(msg, false, true, `The suggestion system has already been enabled!`, null, 0xFF0000);
                serverData['suggestions']['enabled'] = true;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `The suggestion system has been enabled!`, null, 0x00FF00);
                break;
            case 'disable':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']['enabled']) return utils.sendEmbeddedResponse(msg, false, true, `The suggestion system has already been disabled!`, null, 0xFF0000);
                serverData['suggestions']['enabled'] = false;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `The suggestion system has been disabled!`, null, 0x00FF00);
                break;
            case 'voting': // TODO: Change emojis
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please choose either \`enable\` or \`disable\`!`, null, 0xFF0000);
                if(args[1].toLowerCase() != "enable" && args[1].toLowerCase() != "disable") return utils.sendEmbeddedResponse(msg, false, true, `Please choose either \`enable\` or \`disable\`!`, null, 0xFF0000);
                const defaultYes = "✅";
                const defaultNo = "❌";
                const defaultMaybe = "❔";
                if(args[1].toLowerCase() == "enable") {
                    serverData['suggestions']['voting'] = true;
                    if(!serverData['suggestions']['emojis']) serverData['suggestions']['emojis'] = {"yes":defaultYes,"no":defaultNo,"maybe":defaultMaybe};
                }
                else serverData['suggestions']['voting'] = false;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `Suggestion voting has been \`${args[1].toLowerCase()}d\`!`, null, 0x00FF00);
                break;
            case 'dm':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please choose either \`enable\` or \`disable\`!`, null, 0xFF0000);
                if(args[1].toLowerCase() != "enable" && args[1].toLowerCase() != "disable") return utils.sendEmbeddedResponse(msg, false, true, `Please choose either \`enable\` or \`disable\`!`, null, 0xFF0000);
                if(args[1].toLowerCase() == "enable") serverData['suggestions']['dm'] = true;
                else serverData['suggestions']['dm'] = false;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                utils.sendEmbeddedResponse(msg, false, true, `Suggestion DMing has been \`${args[1].toLowerCase()}d\`!`, null, 0x00FF00);
                break;
            case 'emoji':
                if(!serverData) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']['newchannel']) return utils.sendEmbeddedResponse(msg, false, true, `You must set up the suggestion system before you can do this!`, null, 0xFF0000);
                if(!serverData['suggestions']['emojis']) return utils.sendEmbeddedResponse(msg, false, true, `You must enable suggestion voting before you can do this!`, null, 0xFF0000);
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please choose either \`yes\`, \`no\`, or \`maybe\`.`, null, 0xFF0000);
                if(args[1].toLowerCase() != "yes" && args[1].toLowerCase() != "no" && args[1].toLowerCase() != "maybe") return utils.sendEmbeddedResponse(msg, false, true, `Please choose either \`yes\`, \`no\`, or \`maybe\`.`, null, 0xFF0000);
                if(!args[2]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide an emoji!`, null, 0xFF0000);
                const getEmoji = msg.guild.emojis.resolveIdentifier(args[2]);
                msg.react(getEmoji).then(emoji => {
                    msg.reactions.removeAll();
                    serverData['suggestions']['emojis'][args[1].toLowerCase()] = getEmoji;
                    jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverData);
                    utils.sendEmbeddedResponse(msg, false, true, `\`${args[1].toLowerCase()}\` votes will now be ${emoji.emoji}!`, null, 0x00FF00);
                }).catch(err => {
                    utils.sendEmbeddedResponse(msg, false, true, `I can't use that emoji. Here's the error, if you're interested: \`${err}\``, null, 0xFF0000);
                });
                break;
        }
    }
}