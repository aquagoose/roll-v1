const Discord = require('discord.js');
const fs = require('fs');
const utils = require('../stuff/utils');

module.exports = {
    name: 'help',
    description: 'Shows roll\'s commands and explains a bit about them.',
    category: 'misc',
    usage: '[category] [page number]',
    aliases: ['h', 'hlp'],
    execute(msg, args) {
        const { commands } = msg.client; // Get the list of commands from the client
        const embed = new Discord.MessageEmbed().setColor('#fcba03').setTitle(`${msg.client.user.username} - Command Help`); // Create an embed
        const config = JSON.parse(fs.readFileSync('./data/server-config.json')); // Get the server config
        const prefix = msg.guild.prefix;
        const cmds = commands.map(command => command); // Command list
        const categories = [
            [':smile: Fun & Games', 'fun', 0],
            //[':camera: Images & Memes', 'image', 0], // TODO: Once the bot works, add back in the image commands.
            [':bell: Moderation', 'moderation', 1],
            [':scroll: Suggestions', 'suggest', 0],
            [':gear: Bot Setup', 'setup', 2],
            [':cheese: Miscellaneous', 'misc', 0],
            //['!! DEVELOPER ONLY !!', 'dev', 3]
        ]; // 0 - Everyone, 1 - Moderator, 2 - Administrator, 3 - Developer
        if(!args.length) {
            //embed.setDescription(`Prefix: ${prefix}\nWhen using commands, don't type the <> or [] brackets.`);
            embed.setDescription(`Prefix ${prefix}\nPLEASE NOTE!!! roll v2 is currently in development. A lot of these commands will change. For more info, please visit https://rollbot.net/v2/`);
	    var numOfCats = 0;
            for (cat of categories) { // Get the categories
                if (cat[2] == 1 && !msg.member.hasPermission('ADMINISTRATOR')); // Check permissions, if the user does not have the specified permission do not add the field
                else if (cat[2] == 2 && !msg.member.hasPermission('ADMINISTRATOR'));
                else if (cat[2] == 3 && msg.member.id != '276384253166747649');
                else { embed.addField(cat[0], `\`${prefix}help ${cat[1]}\``, true); numOfCats++; }
            }
            embed.setFooter(`<> = Required arguments | [] = Optional arguments\n${cmds.length} commands over ${categories.length} categories (${numOfCats} viewable)`);
        }
        else {
            const cat = args[0].toLowerCase(); // Get the category
            if(!categories.some(row => row[1] == cat)) embed.setDescription(`:x: That category cannot be found!`); // Same as above, however sets the description to 'no category' instead
            else if(categories.some(row => row[1] == cat && row[2] == 1) && (!msg.member.hasPermission('ADMINISTRATOR'))) embed.setDescription(`:x: That category cannot be found!`);
            else if(categories.some(row => row[1] == cat && row[2] == 2) && (!msg.member.hasPermission('ADMINISTRATOR'))) embed.setDescription(`:x: That category cannot be found!`);
            else if(categories.some(row => row[1] == cat && row[2] == 3) && (msg.member.id != '276384253166747649')) embed.setDescription(`:x: That category cannot be found!`);
            else {
                categories.some(row => { if (row[1] == cat) embed.setDescription(`${row[0]} commands`)}); // Set the description
                if(args[1]) var pageNumber = args[1];
                else var pageNumber = 1;
                var numOfCommands = 0; // Calculate the number of commands in the category
                for (cmd of cmds) { // Run through the list of commands
                    if(cmd.category == cat) {
                        if(cmd.disabled);
                        else if (utils.isServerDisabled(cmd, msg.guild));
                        else {
                            numOfCommands++;
                            if(numOfCommands > ((pageNumber-1)*8) && numOfCommands <= (pageNumber*8)) { // Calculate which commands to display
                                var usage = '';
                                if(cmd.usage) usage += ` ${cmd.usage}`; // Get the command usage
                                var alias = '';
                                if(cmd.aliases) alias += `\n- You can also use \`${cmd.aliases.join(', ')}\` to access this command.`; // Get the command aliases
                                let descr = cmd.description.replace(new RegExp('{prefix}', 'gi'), prefix);
                                descr = descr.replace(new RegExp('{cmdName}', 'gi'), cmd.name);
                                embed.addField(`\`${prefix}${cmd.name}${usage}\``, `${descr}${alias}`);
                            }
                            var numOfPages = Math.ceil(numOfCommands/8); // Calculate the number of pages
                        }
                    }
                }
                if (numOfCommands == 0) embed.setDescription(`:x: There are no commands in this category.`);
                else if(pageNumber > numOfPages || pageNumber < 1) embed.setDescription(`:x: That is not a valid page number`);
                else embed.setFooter(`There are ${numOfCommands} commands in this category. Page ${pageNumber} of ${numOfPages}`);
            }
        }
        msg.channel.send(embed);
    }
}
