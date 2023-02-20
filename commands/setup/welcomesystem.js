const fs = require('fs');
const jsonWriter = require('../../stuff/jsonWriter');
const utils = require('../../stuff/utils');

module.exports = {
    name: 'welcomesystem',
    description: `Manage the welcome system. Messages that are sent when a member joins/leaves your server. Type \`{prefix}{cmdName} help\` to get a list of commands.`,
    requireperms: 'administrator',
    arguments: true,
    usage: '<setting> [setting arguments]',
    aliases: ['ws'],
    category: 'setup',
    execute(msg, args) {
        const option = args[0].toLowerCase();
        var serverConfig = jsonWriter.readServerData('./data/server-config.json', msg.guild);
        var serverWelcomeConfig = jsonWriter.readServerData('./data/welcomesystem.json', msg.guild);
        switch(option) {
            case 'help':
                utils.sendEmbeddedResponse(msg, true, false,
                    null, `${msg.guild.prefix}${this.name} - Help`, null, [
                        {
                            name: `\`${msg.guild.prefix}${this.name} channel <channel>\``,
                            value: `Set the channel that the welcome and leave messages will get sent to. **YOU MUST SET THIS BEFORE YOU CAN USE OTHER OPTIONS!!!**`
                        },
                        {
                            name: `\`${msg.guild.prefix}${this.name} welcomemessage <message>\``,
                            value: `Set the message that will get sent whenever a member joins your server.`
                        },
                        {
                            name: `\`${msg.guild.prefix}${this.name} leavemessage <message>\``,
                            value: `Set the message that will get sent whenever a member leaves your server.`
                        }
                    ]);
                break;
            case 'welcomemessage':
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `I can't send blank messages!`, null, 0xFF0000);
                //if(!serverConfig) { jsonWriter.createServer('./data/server-config.json', msg.guild); serverConfig = {}; } // If the server does not exist, create it.
                if(!serverConfig) return utils.sendEmbeddedResponse(msg, false, true, `Please set the welcome channel first!`, null, 0xFF0000);
                if(!serverConfig['ws']) return utils.sendEmbeddedResponse(msg, false, true, `Please set the welcome channel first!`, null, 0xFF0000); // Makes sure that a message cannot be set without a channel.
                if(!serverConfig['ws']['channel']) return utils.sendEmbeddedResponse(msg, false, true, `Please set the welcome channel first!`, null, 0xFF0000); // This is just to be sure.
                if(!serverWelcomeConfig) { jsonWriter.createServer('./data/welcomesystem.json', msg.guild); serverWelcomeConfig = {}; } // If the server does not exist in the welcomesystem.json file, create it.
                /*if(args[1].toLowerCase() == 'embed') {
                    TODO: Implement embed welcome messages.
                }*/
                const wmessage = args.splice(1, args.length).join(" "); // Store the message.
                jsonWriter.writeServerData('./data/welcomesystem.json', msg.guild, {"wm":wmessage}); // Store the message in the welcomesystem json
                //if(!serverConfig['ws']) serverConfig['ws'] = {"enabled":true}; // If there is no welcomesystem in the config file, create it and set enabled to true.
                //if(!serverConfig['ws']) serverConfig['ws'] = {};
                if(serverConfig['ws']['enabled'] == undefined) serverConfig['ws']['enabled'] = true;
                if(serverConfig['ws']['wm'] == undefined) serverConfig['ws']['wm'] = true; // If there is no value for wm in the config, create it and set it to true. Else leave it alone.
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverConfig); // Write the server config data to disk.
                utils.sendEmbeddedResponse(msg, false, true, `The welcome message for this server has been set!`, null, 0x00FF00);
                break;
            case 'leavemessage': // This works exactly the same as the code above, just using 'lm' instead of 'wm'.
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `I can't send blank messages!`, null, 0xFF0000);
                //if(!serverConfig) { jsonWriter.createServer('./data/server-config.json', msg.guild); serverConfig = {}; }
                if(!serverConfig) return utils.sendEmbeddedResponse(msg, false, true, `Please set the welcome channel first!`, null, 0xFF0000);
                if(!serverConfig['ws']) return utils.sendEmbeddedResponse(msg, false, true, `Please set the welcome channel first!`, null, 0xFF0000);
                if(!serverConfig['ws']['channel']) return utils.sendEmbeddedResponse(msg, false, true, `Please set the welcome channel first!`, null, 0xFF0000);
                if(!serverWelcomeConfig) { jsonWriter.createServer('./data/welcomesystem.json', msg.guild); serverWelcomeConfig = {}; }
                const lmessage = args.splice(1, args.length).join(" ");
                jsonWriter.writeServerData('./data/welcomesystem.json', msg.guild, {"lm":lmessage});
                //if(!serverConfig['ws']) serverConfig['ws'] = {};
                if(serverConfig['ws']['enabled'] == undefined) serverConfig['ws']['enabled'] = true;
                if(serverConfig['ws']['lm'] == undefined) serverConfig['ws']['lm'] = true;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverConfig);
                utils.sendEmbeddedResponse(msg, false, true, `The leave message for this server has been set!`, null, 0x00FF00);
                break;
            case 'channel': // Works similar to the above.
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a channel!`, null, 0xFF0000);
                if(!serverConfig) { jsonWriter.createServer('./data/server-config.json', msg.guild); serverConfig = {}; }
                var channel;
                if(msg.mentions.channels.first()) channel = msg.mentions.channels.first().id; // Looks through the channel first by mention
                else if (msg.guild.channels.cache.find(c => c.name === args[1])) channel = msg.guild.channels.cache.find(c => c.name === args[1]).id; // Then by name
                else if(msg.guild.channels.cache.find(c => c.id === args[1])) channel = msg.guild.channels.cache.find(c => c.id === args[1]).id; // Then by ID
                else return utils.sendEmbeddedResponse(msg, false, true, `I couldn't find that channel!`, null, 0xFF0000); // Otherwise, say you couldn't find it!
                if(!serverConfig['ws']) serverConfig['ws'] = {}; // If there is no welcomesystem, create it.
                serverConfig['ws']['channel'] = channel; // Set the channel to the channel. English 100.
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, serverConfig);
                utils.sendEmbeddedResponse(msg, false, true, `The welcome channel for this server has been set as <#${channel}>!`, null, 0x00FF00);
                break;
        }
    }
}