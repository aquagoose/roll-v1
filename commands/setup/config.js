const Discord = require('discord.js');
const jsonWriter = require('../../stuff/jsonWriter');
const fs = require('fs');
const utils = require('../../stuff/utils');

module.exports = {
    name: "config",
    description: `Set up roll. Type \`{prefix}{cmdName} help\` to get a list of what you can do.`,
    category: 'setup',
    args: true,
    requireperms: 'administrator',
    execute(msg, args) { // TODO: make this command more efficient
        const option = args[0].toLowerCase();
        switch(option) {
            case 'help':
                return utils.sendEmbeddedResponse(msg, true, false, null, `${this.name} - Help`, null, [
                        {
                            name: `\`${msg.guild.prefix}${this.name} prefix <prefix>\``,
                            value: `Set the bot prefix. Accepts spaces. Case insensitive. Type \`reset\` to reset the prefix to default.`
                        },
                        {
                            name: `\`${msg.guild.prefix}${this.name} command <command name> <enable/disable>\``,
                            value: `Server enable or disable any command **except** for the ${this.name} command. Please use the command name **only**, you cannot use aliases, however they will also be disabled.`
                        },
                        {
                            name: `\`${msg.guild.prefix}${this.name} embedresponse <enable/disable>\``,
                            value: `Disable the bot's embed response on every message. Some commands (for example the help command) will still show an embed message.`
                        },
                        {
                            name: `\`${msg.guild.prefix}${this.name} mentionauthor <enable/disable>\``,
                            value: `Should the bot mention the message author when performing certain tasks?`
                        },
                    ],
                    `Confused? Go to ${msg.client.weblink}/config-command/ to get all the info you need.`
                );
            case 'prefix': // Change the bot prefix per server
                var prefix = args.splice(1, args.length).join(" "); // Allow spaces in the prefix
                if(prefix == "reset") {
                    jsonWriter.deleteServerData('./data/server-config.json', msg.guild, 'prefix'); // Delete the prefix server data.
                    utils.sendEmbeddedResponse(msg, false, true, `The prefix for this server has been reset!`, null, 0x00FF00);
                }
                else {
                    jsonWriter.writeServerData('./data/server-config.json', msg.guild, {"prefix":prefix}); // Write the prefix to the server data.
                    utils.sendEmbeddedResponse(msg,false, true, `\`${prefix}\` has been set as the server prefix!`, null, 0x00FF00);
                }
                break;
            case 'embedresponse':
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true,`Please choose either \`disable\` or \`enable\`.`, null, 0xFF0000);
                var serverInfo = jsonWriter.readServerData('./data/server-config.json', msg.guild);
                if(!serverInfo) { jsonWriter.createServer('./data/server-config.json', msg.guild); serverInfo = {}; }
                if(args[1].toLowerCase() == 'disable') {
                    if(serverInfo['disableembedresponse']) return utils.sendEmbeddedResponse(msg,false, true, `Embed response has already been disabled!`, null, 0xFF0000);
                    jsonWriter.writeServerData('./data/server-config.json', msg.guild, {"disableembedresponse":true});
                    utils.sendEmbeddedResponse(msg,false, true, `Embed response has been disabled!`, null, 0x00FF00);
                }
                else if(args[1].toLowerCase() == 'enable') {
                    if(!serverInfo['disableembedresponse']) return utils.sendEmbeddedResponse(msg,false, true, `Embed response has already been enabled!`, null, 0xFF0000);
                    jsonWriter.writeServerData('./data/server-config.json', msg.guild, {"disableembedresponse":false});
                    utils.sendEmbeddedResponse(msg,false, true, `Embed response has been enabled!`, null, 0x00FF00);
                }
                else utils.sendEmbeddedResponse(msg,false, true, `Please choose either \`disable\` or \`enable\`.`, null, 0xFF0000);
                break;
            case 'mentionauthor':
                if(!args[1]) return utils.sendEmbeddedResponse(msg,false, true, `Please choose either \`disable\` or \`enable\`.`, null, 0xFF0000);
                var serverInfo = jsonWriter.readServerData('./data/server-config.json', msg.guild);
                if(!serverInfo) { jsonWriter.createServer('./data/server-config.json', msg.guild); serverInfo = {}; }
                if(args[1].toLowerCase() == 'enable') {
                    if(serverInfo['mentionauthor']) return utils.sendEmbeddedResponse(msg,false, true, `Mention author has already been enabled!`, null, 0xFF0000);
                    jsonWriter.writeServerData('./data/server-config.json', msg.guild, {"mentionauthor":true});
                    utils.sendEmbeddedResponse(msg,false, true, `Mention author has been enabled!`, null, 0x00FF00);
                }
                else if(args[1].toLowerCase() == 'disable') {
                    if(!serverInfo['mentionauthor']) return utils.sendEmbeddedResponse(msg,false, true, `Mention author has already been disabled!`, null, 0xFF0000);
                    jsonWriter.writeServerData('./data/server-config.json', msg.guild, {"mentionauthor":false});
                    utils.sendEmbeddedResponse(msg,false, true, `Mention author has been disabled!`, null, 0x00FF00);
                }
                else utils.sendEmbeddedResponse(msg,false, true, `Please choose either \`disable\` or \`enable\`.`, null, 0xFF0000);
                break;
            case 'command':
                if(!args[1]) return utils.sendEmbeddedResponse(msg,false, true, `You did not provide a command to disable or enable.`, null, 0xFF0000); // Make sure that they actually enter a command.
                else var command = args[1].toLowerCase(); // Get the command, and convert it to lowercase, since all commands are lowercase.
                if(!args[2]) return utils.sendEmbeddedResponse(msg,false, true, `Please choose \`disable\` or \`enable\`.`, null, 0xFF0000); // Commands need to be either disabled or enabled. They can't be jeffed. That would be funny, though.
                const cmds = msg.client.commands.map(command => command); // Map the list of commands.
                for (const cmd of cmds) { // Sort through the commands and look for a match. This will only work if jellyfish brain man didn't accidentally name two commands the same. Then it would just pick the first from the list.
                    if(cmd.name == command) {
                        var getJSON = jsonWriter.readServerData('./data/server-config.json', msg.guild); // Read the server data.
                        if(args[2].toLowerCase() == 'disable') {
                            if (command == this.name) return utils.sendEmbeddedResponse(msg,false, true, `You can't disable the ${this.name} command. That would cause you unending pain. *It already has to me.*`, null, 0xFF0000); // If you disable the config command a void will be created.
                            // The following two if statements prep the writeServerData command, if the server does not exist in the config file.
                            if(!getJSON) getJSON = {}; // Creates the server data itself.
                            if(!getJSON['disabledcommands']) getJSON['disabledcommands'] = []; // Then creates the disabledcommands data.
                            if(getJSON['disabledcommands'].indexOf(command) > -1) return utils.sendEmbeddedResponse(msg,false, true, `That command has already been disabled!`, null, 0xFF0000); // Idk why null isn't used when using indexOf, would make things neater.
                            getJSON['disabledcommands'].push(command); // Push it to the list.
                            utils.sendEmbeddedResponse(msg,false, true, `Command \`${msg.guild.prefix}${command}\` disabled!`, null, 0x00FF00);
                        }
                        else if(args[2].toLowerCase() == 'enable') { // This works much the same as disabling.
                            if(command == this.name) return utils.sendEmbeddedResponse(msg,false, true, `How can you enable a command that you can't disable :joy:`);
                            if(!getJSON) return utils.sendEmbeddedResponse(msg,false, true, `That command has already been enabled!`, null, 0xFF0000); // This is the only difference, since there is no point creating nonexistant data, just return this.
                            if(!getJSON['disabledcommands']) return utils.sendEmbeddedResponse(msg,false, true, `That command has already been enabled!`, null, 0xFF0000);
                            if(getJSON['disabledcommands'].indexOf(command) < 0) return utils.sendEmbeddedResponse(msg,false, true, `That command has already been enabled!`, null, 0xFF0000);
                            getJSON['disabledcommands'].splice(getJSON['disabledcommands'].indexOf(command), 1);
                            utils.sendEmbeddedResponse(msg,false, true, `Command \`${msg.guild.prefix}${command}\` enabled!`, null, 0x00FF00);
                        }
                        else return utils.sendEmbeddedResponse(msg,false, true, `You did not provide a command to disable or enable.`, null, 0xFF0000); // If you don't write enable or disable you are a muppet
                        jsonWriter.writeServerData('./data/server-config.json', msg.guild, getJSON); // Write whatever the heck gets made up there.
                        return; // I could break out of the for loop but it's much easier to just return.
                    }
                }
                return utils.sendEmbeddedResponse(msg,false, true, `That command does not exist!`, null, 0xFF0000); // Since if a command is found, the execution will be terminated, this runs if the for loop finishes and no return is given.
            default:
                utils.sendEmbeddedResponse(msg,false, true, `You did not provide a correct setting. Type \`${msg.guild.prefix}${this.name} help\` to get a list of ${this.name} commands.`, null, 0xFF0000);
        }
    }
}