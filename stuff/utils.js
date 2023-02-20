const fs = require('fs');
const Discord = require('discord.js');
const jsonWriter = require('./jsonWriter');

module.exports = {
    isInMessageCollector: new Set(),
    isServerDisabled(command, server) {
        const serverConfig = jsonWriter.readServerData('./data/server-config.json', server); // Fetch the server data
        if(!serverConfig) return false; // If there is no server config, return false.
        if (!serverConfig['disabledcommands']) return false; // If there are no disabled commands, return false.
            if(serverConfig['disabledcommands'].indexOf(command.name) > -1) { // Otherwise, if it exists in the list, return true.
                return true;
            }
            else return false;
    },

    sendEmbeddedResponse(context, force, mention, description, title, color, fields, footer) {
        const serverInfo = jsonWriter.readServerData('./data/server-config.json', context.guild); // Read the server data for the server.
        if(!serverInfo) {
            if(!color) color = this.generateHexColor(); // Generate a random color if no color is defined.
            const embed = {
                title: title,
                description: description,
                color: color,
                fields: fields,
                footer: {text: footer}
            }
            return context.channel.send({embed: embed});
        }
        if(serverInfo['disableembedresponse'] && !force) { // If disable embed response is enabled and force is not true, then send a message not as an embed.
            var getDesc = description; // Allows the description to be modified.
            var txt = ""; // The string that will be what the bot sends.
            if(color == 0xFF0000) txt += ':x: '; // If the color is red or green, then use the :x: or :white_check_mark: respectively.
            else if (color == 0x00FF00) txt += ':white_check_mark: ';
            if(serverInfo['mentionauthor'] && mention) { txt += `${context.member}, `; getDesc = getDesc[0].toLowerCase() + getDesc.slice(1); } // If the the mention author setting is enabled, add it to the message, and then convert the first letter of the description and make it lowercase.
            txt += getDesc;
            context.channel.send(txt);
        }
        else {
            if(!color) color = this.generateHexColor(); // Generate a random color if no color is defined.
            const embed = {
                title: title,
                description: description,
                color: color,
                fields: fields,
                footer: {text: footer}
            }
            if(serverInfo['mentionauthor'] && mention) return context.channel.send(context.member, {embed: embed});
            else return context.channel.send({embed: embed})
        }
    },

    generateString(num) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var finalStr = "";
        for(var i=0;i<num;i++) {
            finalStr += chars[Math.floor(Math.random() * chars.length)];
        }
        return finalStr;
    },

    generateHexColor() {
        const chars = '0123456789ABCDEF';
        var finalStr = "";
        for(var i=0;i<3;i++) {
            var col = chars[Math.floor(Math.random() * chars.length)];
            //finalStr += chars[Math.floor(Math.random() * chars.length)];
            finalStr += col + col;
        }
        return finalStr;
    },

    unmuteMembers(client) {
        const tempData = JSON.parse(fs.readFileSync('./data/tempdata.json')); // Get the tempdata
        var serverID;
        for(const server of tempData) { // For every server in the temp data
            for(var key in server) serverID = key; // Get the server ID which is the key
            if(server[serverID]['tempmutedusers']) { // If the server contains temp muted members, then run
                const getServer = client.guilds.cache.get(serverID); // Get the server
                for(var key in server[serverID]['tempmutedusers']) { // Then get the key of the member
                    const mbr = getServer.members.cache.get(key); // Get the member from the server
                    if(mbr) { // If the member is found......
                        const time = new Date().getTime(); // Get the current time
                        if(time >= server[getServer.id]['tempmutedusers'][mbr.id]['unmutetime']) { // If the current time is greater than the muted time for the user......
                            mbr.roles.set(server[getServer.id]['tempmutedusers'][mbr.id]['roles']).then(() => { // Set their roles to the role list
                                if(!server[getServer.id]['tempmutedusers'][mbr.id]['nodm']) mbr.send(`You are no longer muted on **${getServer.name}**.`); // If nodm is not true (confusing, right) then message the user.
                                delete server[getServer.id]['tempmutedusers'][mbr.id]; // Delete them out of the list, then write the data
                                jsonWriter.writeListData('./data/tempdata.json', getServer, server[getServer.id]);
                            });
                        }
                    }
                }
            }
        }
    }
}