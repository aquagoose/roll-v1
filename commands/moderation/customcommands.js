const jsonWriter = require("../../stuff/jsonWriter");
const rollBASIC = require("../../stuff/rollBASIC");
const utils = require("../../stuff/utils");

module.exports = {
    name: 'command',
    description: 'Manage custom commands for your server. Type `{prefix}{cmdName} help` to get a list of commands.',
    requireperms: 'administator',
    args: true,
    usage: '<option> [option arguments]',
    aliases: ['commandeditor'],
    async execute(msg, args) {
        const option = args[0].toLowerCase();
        var customCommands = jsonWriter.readServerData('./data/custom-commands.json', msg.guild);
        switch(option) {
            case 'help':
                utils.sendEmbeddedResponse(msg, true, false, null, `${this.name} - Help`, null, [
                    {
                        name: `\`${msg.guild.prefix}${this.name} create <command name>\``,
                        value: `Create a command with the chosen name.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} setcode <command name> <code>\``,
                        value: `Sets the code for your command. Uses rollBASIC syntax. Need help? Visit https://rollbot.net/rollbasic/`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} showcode <command name>\``,
                        value: `Fetch the code for the selected command. Allows for easy editing.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} rename <command name> <new command name>\``,
                        value: `Rename the chosen command to the new command name.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} delete <command name>\``,
                        value: `Delete the chosen command.`
                    },
                    {
                        name: `\`${msg.guild.prefix}${this.name} setdescription <command name> <description>\``,
                        value: `Set the description of the chosen command. This will be displayed in the help menu.`
                    }
                ]);
                break;
            case 'create':
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please choose a command name!`, null, 0xFF0000);
                var cmdName = args[1].toLowerCase();
                if(!customCommands) { jsonWriter.createServer('./data/custom-commands.json', msg.guild); customCommands = {}; }
                customCommands[cmdName] = {};
                jsonWriter.writeServerData('./data/custom-commands.json', msg.guild, customCommands);
                utils.sendEmbeddedResponse(msg, false, true, `Command \`${cmdName}\` created!`, null, 0x00FF00);
                break;
            case 'setcode':
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please choose a command!`, null, 0xFF0000);
                var cmdName = args[1].toLowerCase();
                if(!customCommands) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                if(customCommands[cmdName] == undefined) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                const code = args.splice(2, args.length).join(" ");
                const checkCompile = await rollBASIC.compile(msg, code);
                if(!checkCompile) return;
                customCommands[cmdName]['code'] = code;
                jsonWriter.writeServerData('./data/custom-commands.json', msg.guild, customCommands);
                utils.sendEmbeddedResponse(msg, false, true, `\`${cmdName}\`'s code has been set!`, null, 0x00FF00);
                break;
            case 'showcode':
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please choose a command!`, null, 0xFF0000);
                var cmdName = args[1].toLowerCase();
                if(!customCommands) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                if(customCommands[cmdName] == undefined) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                utils.sendEmbeddedResponse(msg, true, false, customCommands[cmdName]['code'], `Code for ${msg.guild.prefix}${cmdName}`);
                break;
            case 'rename':
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please choose a command!`, null, 0xFF0000);
                if(!args[2]) return utils.sendEmbeddedResponse(msg, false, true, `Please give a command name for the replacement!`, null, 0xFF0000);
                var cmdName = args[1].toLowerCase();
                var replaceName = args[2].toLowerCase();
                if(!customCommands) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                if(customCommands[cmdName] == undefined) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                customCommands[replaceName] = customCommands[cmdName];
                jsonWriter.writeServerData('./data/custom-commands.json', msg.guild, customCommands);
                jsonWriter.deleteServerData('./data/custom-commands.json', msg.guild, cmdName);
                utils.sendEmbeddedResponse(msg, false, true, `\`${cmdName}\` has been renamed to \`${replaceName}\`!`, null, 0x00FF00);
                break;
            case 'delete':
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please choose a command!`, null, 0xFF0000);
                var cmdName = args[1].toLowerCase();
                if(!customCommands) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                if(customCommands[cmdName] == undefined) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                jsonWriter.deleteServerData('./data/custom-commands.json', msg.guild, cmdName);
                utils.sendEmbeddedResponse(msg, false, true, `\`${cmdName}\` has been deleted!`, null, 0x00FF00);
                break;
            case 'setdescription':
                if(!args[1]) return utils.sendEmbeddedResponse(msg, false, true, `Please choose a command!`, null, 0xFF0000);
                var cmdName = args[1].toLowerCase();
                if(!customCommands) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                if(customCommands[cmdName] == undefined) return utils.sendEmbeddedResponse(msg, false, true, `I can't find \`${cmdName}\`. You can create it by typing \`${msg.guild.prefix}${this.name} create ${cmdName}\``);
                if(!args[2]) return utils.sendEmbeddedResponse(msg, false, true, `Please provide a description!`, null, 0xFF0000);
                var description = args.splice(2, args.length).join(" ");
                if(description == "delete") customCommands[cmdName]['description'] = undefined;
                else customCommands[cmdName]['description'] = description;
                jsonWriter.writeServerData('./data/custom-commands.json', msg.guild, customCommands);
                utils.sendEmbeddedResponse(msg, false, true, `\`${cmdName}\`'s description has been ${(description == "delete") ? `deleted!` : `set to \`${description}\``}`, null, 0x00FF00);
                break;
            default:
                utils.sendEmbeddedResponse(msg, false, true, `Please provide an option! You can type \`${msg.guild.prefix}${this.name} help\` to get a list of commands.`, null, 0xFF0000);
                break;
        }
    }
}