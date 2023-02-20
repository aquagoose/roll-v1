const Discord = require('discord.js'); // Import discord.js
const fs = require('fs');
const client = new Discord.Client(); // Create the client
client.commands = new Discord.Collection();
client.weblink = 'https://rollbot.net';
client.shortlink = 'rollbot.net';
const { token } = require('./config.json'); // Get the token.
const dprefix = require('./config.json')['default-prefix'];
const jsonWriter = require('./stuff/jsonWriter');
const rollBASIC = require('./stuff/rollBASIC');
const swearfilter = require('./stuff/swearfilter');
const utils = require('./stuff/utils');
var rollingnumber = 0; // Used for the rolling presence.

function getFiles(folder) { // This is a mess but it gets all files and searches through any subdirectories in a foler.
    var getEverything = fs.readdirSync(folder);
    for (file in getEverything) {
        getEverything[file] = `${folder}/${getEverything[file]}`;
    }
    for (const file of getEverything) {
        if (fs.existsSync(`${file}`) && fs.lstatSync(`${file}`).isDirectory()) getEverything.push(getFiles(`${file}`));
        //if (fs.existsSync(file) && fs.lstatSync(file).isDirectory()) getEverything.push(getFiles(file));
    }
    getEverything = [].concat.apply([],getEverything);
    getEverything = getEverything.filter(contents => contents.endsWith('.js'));
    return getEverything;
}

const getCommands = getFiles('./commands');

var fileCount = 0; // Number of files that have been counted.
for (const file of getCommands) {
    fileCount++;
    console.log(`Loading ${file}... (${fileCount}/${getCommands.length})`);
    const command = require(file); // Load the file
    client.commands.set(command.name, command); // Set the file as a command.
    console.log(`File ${file} loaded.`);
}

client.on('ready', () => {
    console.log('Ready!');
    rollingPresence();
    setInterval(rollingPresence, 30000);
    setInterval(function(){ utils.unmuteMembers(client) }, 60000);
});

//process.on('unhandledRejection', err => {
  //  console.error(`Error! Code ${err.code}\n${err.message}`);
//});

client.on('guildCreate', guild => { // This gets sent whenever the bot is added to a server.
    if(!guild.systemChannel) return;
    guild.systemChannel.send({embed: {
        title: `${client.user.username} - Thank you!`,
        description: `Hi! Thank you for adding me to ${guild.name}!\nIf you need some help setting me up, [please click here](${client.weblink}/get-started/) to get started! Here's some stuff you can/should do first:`,
        color: 0xfcba03,
        thumbnail: {url:client.user.displayAvatarURL()},
        fields: [
            {
                name: `Change the bot prefix`,
                value: `Type \`${dprefix}config prefix <prefix>\` to set my prefix!`,
                inline: true
            },
            {
                name: `Set up the welcome system`,
                value: `Type \`${dprefix}ws help\` to get started!`,
                inline: true
            },
            {
                name: `Enable the word filter`,
                value: `Type \`${dprefix}filter help\` to get started!`,
                inline: true
            }
        ],
        footer: {text: `From ${client.user.username} to you, thank you!`}
    }});
});

client.on('guildMemberAdd', member => { // Runs whenever a member is added to the server
    const serverData = jsonWriter.readServerData('./data/server-config.json', member.guild);
    if(!serverData) return; // If the server does not exist then return
    if(!serverData['ws']) return; // If there is no welcomesystem then return
    if(!serverData['ws']['channel']) return; // If the channel has not been set up then return
    if(!serverData['ws']['enabled']) return; // If enabled is false then return
    if(!serverData['ws']['wm']) return; // If wm is set to false  t h e n  r e t u r n
    var welcomeMessage = jsonWriter.readServerData('./data/welcomesystem.json', member.guild)['wm']; // Get the welcome message
    const channel = member.guild.channels.cache.get(serverData['ws']['channel']); // Find the channel
    if(!channel) return; // If it cannot find the channel (e.g. if it has been deleted) stop execution.
    const replaceList = [['{member}', member], ['{membernick}', member.displayName], ['{guildname}', member.guild.name]]; // This is a list of tags that it looks for and replaces with the correct data.
    for(const item of replaceList) {
        welcomeMessage = welcomeMessage.replace(new RegExp(item[0], 'gi'), item[1]); // Replace all instances of the tag with the correct one.
    }
    setTimeout(function() { channel.send(welcomeMessage) }, 500); // Send the message after 500ms, to allow some time for the member to load in the server, so they actually see the message.
});

client.on('guildMemberRemove', member => { // This works exactly the same as above.
    const serverData = jsonWriter.readServerData('./data/server-config.json', member.guild);
    if(!serverData) return;
    if(!serverData['ws']) return;
    if(!serverData['ws']['channel']) return;
    if(!serverData['ws']['enabled']) return;
    if(!serverData['ws']['lm']) return;
    var leaveMessage = jsonWriter.readServerData('./data/welcomesystem.json', member.guild)['lm'];
    const channel = member.guild.channels.cache.get(serverData['ws']['channel']);
    if(!channel) return;
    const replaceList = [['{member}', member], ['{membernick}', member.displayName], ['{guildname}', member.guild.name]];
    for(const item of replaceList) {
        leaveMessage = leaveMessage.replace(new RegExp(item[0], 'gi'), item[1]);
    }
    setTimeout(function() { channel.send(leaveMessage) }, 500);
});

/*client.on('messageUpdate', msg => {
    if(msg.author.bot) return;
    swearfilter.swearFilter(msg);
    const serverData = jsonWriter.readServerData('./data/server-config.json', msg.guild);
    if(!serverData) return;
    if(!serverData['logchannel']) return;
    const channel = msg.guild.channels.cache.get(serverData['logchannel']);
    if(!channel) return;
    channel.send({embed: {
        title: "Message Edited",
        url: msg.url,
        author: {
            name: msg.member.displayName,
            icon_url: msg.author.displayAvatarURL()
        },
        fields: [
            {
                name: `Author ID`,
                value: `${msg.member.id}`
            },
            {
                name: `Original message`,
                value: `${msg.content}`
            },
            {
                name: `Edited message`,
                value: `${msg.reactions.message.content}`
            }
        ]
    }});
});

client.on('messageDelete',  => {
    console.log(msg);
    if(msg.author.bot) return;
    const serverData = jsonWriter.readServerData('./data/server-config.json', msg.guild);
    if(!serverData) return;
    if(!serverData['logchannel']) return;
    const channel = msg.guild.channels.cache.get(serverData['logchannel']);
    if(!channel) return;
    channel.send({embed: {
        title: "Message Deleted",
        author: {
            name: msg.member.displayName,
            icon_url: msg.author.displayAvatarURL()
        },
        fields: [
            {
                name: `Author ID`,
                value: `${msg.member.id}`
            },
            {
                name: `Original message`,
                value: `${msg.content}`
            },
            {
                name: `Edited message`,
                value: `${msg.reactions.message.content}`
            }
        ]
    }});
});*/

client.on('message', msg => {
    if(msg.guild == null || msg.author.bot) return;
    const server = msg.guild.id; // Get the server ID
    const serverConfig = JSON.parse(fs.readFileSync('./data/server-config.json')); // Load the server config data.
    if(serverConfig[server] && serverConfig[server]['prefix']) msg.guild.prefix = serverConfig[server]['prefix']; // If the server exists in the data and there is a prefix, set the guild prefix to this.
    else msg.guild.prefix = JSON.parse(fs.readFileSync('./config.json'))['default-prefix']; // Else, set it to the default prefix in the config file.
    if(!msg.content.startsWith(msg.guild.prefix)) return swearfilter.swearFilter(msg); // If the message does not start with the prefix, return.

    const args = msg.content.slice(msg.guild.prefix.length).split(" "); // Split the prefix, and split every space, to get the message arguments
    if(args[0] == '') args.shift();
    const commandName = args.shift().toLowerCase(); // Remove and return the command name form the argument list.
    
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)); // Find the command, including aliases.

    const customCommands = jsonWriter.readServerData('./data/custom-commands.json', msg.guild);
    if(customCommands) {
        if(customCommands[commandName]) return rollBASIC.executeCode(msg, customCommands[commandName]['code'], true);
    }

    if(!command) {
        swearfilter.swearFilter(msg);
        return utils.sendEmbeddedResponse(msg, true, false, // If the command cannot be found...
        `I can't find \`${msg.guild.prefix}${commandName}\`. You can type \`${msg.guild.prefix}help\` to get a list of my commands.`,
        `${msg.guild.prefix}${commandName} - Not Found`,
        0xFF0000);
    }

    if(command.disabled) {
        swearfilter.swearFilter(msg);
        return utils.sendEmbeddedResponse(msg, true, false, `\`${msg.guild.prefix}${command.name}\` has been disabled bot-wide. If you believe this to be an error, please join our discord server [here](https://discord.gg/jyVAKU9) and report it.`, `${msg.guild.prefix}${command.name} - Disabled bot-wide`, 0xFF0000);
    }
    if(command.requireperms) {
        if(command.requireperms == 'developer') {
            if(msg.member.id != '276384253166747649') {
                return utils.sendEmbeddedResponse(msg, true, false,
                    `You don't have the right permissions to use \`${msg.guild.prefix}${command.name}\`. You need the \`${command.requireperms.split("_").join(" ")}\` permission.`,
                    `${msg.guild.prefix}${command.name} - Missing Permissions`,
                    0xFF0000);
            }
        }
        if(!msg.member.permissions.has(command.requireperms.toUpperCase().split(" ").join("_"))) {
            swearfilter.swearFilter(msg);
            return utils.sendEmbeddedResponse(msg, true, false,
                `You don't have the right permissions to use \`${msg.guild.prefix}${command.name}\`. You need the \`${command.requireperms.split("_").join(" ")}\` permission.`,
                `${msg.guild.prefix}${command.name} - Missing Permissions`,
                0xFF0000);
        }
    }

    if(utils.isServerDisabled(command, msg.guild)){
        swearfilter.swearFilter(msg);
        return msg.channel.send({embed: { // Checks to see if the command has been server disabled.
            title: `${msg.guild.prefix}${commandName} - Server disabled`,
            description: `\`${msg.guild.prefix}${commandName}\` has been disabled on this server.`,
            color: 0xFF0000
        }});
    }
    
    //return msg.reply(`I can't find that command. You can type \`${msg.guild.prefix}help\` to get a list of my commands.`);
    if(!args.length && command.args) { // Checks to see if the command requires arguments.
        swearfilter.swearFilter(msg);
        let descr = command.description.replace(new RegExp('{prefix}', 'gi'), msg.guild.prefix);
        descr = descr.replace(new RegExp('{cmdName}', 'gi'), command.name);
        return msg.channel.send({embed: {
            title: `${msg.guild.prefix}${command.name}`,
            description: `This command requires just a bit more info from you. Here's a page from the help book.`,
            color: 0xFF0000,
            fields: [
                {
                    name: `\`${msg.guild.prefix}${command.name}\``,
                    value: descr
                }
            ]
        }});
    }

    try {
        command.execute(msg, args);
    }
    catch (err) {
        console.error(err);
        utils.sendEmbeddedResponse(msg, true, false, `That command encountered an error. To report it, you can join our discord server [!!HERE!!](https://discord.gg/jyVAKU9), and report this error (Please copy **__exactly as written__**):`, `${msg.guild.prefix}${command.name} - Error`, 0xFF0000, [{name:`Command ${command.name} (Command name ${commandName}) encountered an error!`,value:err}]);
    }
});

function rollingPresence() {
    rollingnumber++;
    switch(rollingnumber) {
        case 1:
            client.user.setActivity(`@${client.user.username} | ${dprefix}help`, {type: 'PLAYING'});
            break;
        case 2:
            client.user.setActivity(`${client.shortlink}`, {type: 'PLAYING'});
            break;
        case 3:
            client.user.setActivity(`${client.guilds.cache.size} servers`, {type: 'WATCHING'});
            break;
        case 4:
            client.user.setActivity(`${client.channels.cache.size} channels`, {type: 'WATCHING'});
            break;
        default:
            rollingnumber = 0;
            rollingPresence();
            break;
    }
}

client.login(token); // Login the bot.
