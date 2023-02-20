const Discord = require('discord.js');
const jsonWriter = require('../../stuff/jsonWriter');
const fs = require('fs');

module.exports = {
    name: 'welcomesystem',
    description: 'Manage the welcome system, messages that are sent when members join & leave your server. Type `{prefix}welcomesystem help` to get a list of commands.',
    args: true,
    usage: '<option> [other bits]',
    aliases: ['ws'],
    execute(msg, args) {
        const option = args[0].toLowerCase();
        switch(option) {
            case 'welcomemessage':
                var wmsetting = {};
                if(!args[1]) return msg.channel.send(`:x: ${msg.member}, you need to provide a message.`);
                const wmessage = args.splice(1, args.length).join(" ");
                if(wmessage.length > 1800) return msg.channel.send(`:x: Sorry, but the welcome message length cannot be longer than 1800 characters. This is to allow the bot some leeway to display your message.`);
                jsonWriter.writeServerData('./data/welcomesystem.json', msg.guild, {"wm":wmessage});
                if(!jsonWriter.readServerData('./data/server-config.json', msg.guild)) jsonWriter.createServer('./data/server-config.json', msg.guild);
                wmsetting = jsonWriter.readServerData('./data/server-config.json', msg.guild)['ws'];
                if(!jsonWriter.readServerData('./data/server-config.json', msg.guild)['ws']) { wmsetting['enabled'] = true; wmsetting['wm'] = true; }
                else if(jsonWriter.readServerData('./data/server-config.json', msg.guild)['ws']['wm'] == undefined) wmsetting['wm'] = true;
                jsonWriter.writeServerData('./data/server-config.json', msg.guild, {"ws":wmsetting});
                msg.channel.send(`:white_check_mark: The welcome message for this server has been set to:\n\n${wmessage}`);
                break;
            case 'leavemessage':
                if(!args[1]) return msg.channel.send(`:x: ${msg.member}, you need to provide a message.`);
                const lmessage = args.splice(1, args.length).join(" ");
                if(lmessage.length > 1800) return msg.channel.send(`:x: Sorry, but the leave message length cannot be longer than 1800 characters. This is to allow the bot some leeway to display your message.`);
                jsonWriter.writeServerData('./data/welcomesystem.json', msg.guild, {"lm":lmessage});
                if(!jsonWriter.readServerData('./data/server-config.json', msg.guild)) jsonWriter.createServer('./data/server-config.json', msg.guild);
                if(!jsonWriter.readServerData('./data/server-config.json', msg.guild)['ws']) jsonWriter.writeServerData('./data/server-config.json', msg.guild, {"ws":{"enabled":true, "lm":true}});
                msg.channel.send(`:white_check_mark: The leave message for this server has been set to:\n\n${lmessage}`);
                break;
        }
    }
}