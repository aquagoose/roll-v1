const Discord = require('discord.js');
const fs = require('fs');
const jsonWriter = require('./jsonWriter');
const utils = require('./utils');

module.exports = {
    checkSwear(msg) { // This function checks if a message contains a swear word
        const serverData = jsonWriter.readServerData('./data/server-config.json', msg.guild);
        if(!serverData) return false;
        if(!serverData['filter']) return false;
        if(!serverData['filter']['enabled']) return false;
        if(serverData['filter']['ignoredchannels']) {
            if(serverData['filter']['ignoredchannels'].indexOf(msg.channel.id) != -1) return false;
        }
        var swears = JSON.parse(fs.readFileSync('./stuff/swears.json')); // Get the list of swears
        var ignoredList = serverData['filter']['removedwords'];
        if(!ignoredList) ignoredList = [];
        var addedList = serverData['filter']['addedwords'];
        if(addedList) for (word of addedList) swears.push(word);
        var splitMsg = msg.content.toLowerCase().replace(/[^a-z\s]/gi, ''); // Strip out all punctuation
        splitMsg = splitMsg.split(" "); // Split the message.
        if(swears.some(word => splitMsg.indexOf(word) != -1 && ignoredList.indexOf(word) == -1)) return true; // If it finds the index of a swear, return true
        else return false;
    },

    swearFilter(msg) {
        if(!this.checkSwear(msg)) return; // Checks for swears, if there are none, don't waste time.
        const serverData = jsonWriter.readServerData('./data/server-config.json', msg.guild);
        var swears = JSON.parse(fs.readFileSync('./stuff/swears.json')); // Get the swear list (again)
        var splitMsg = msg.content.split(" "); // Split the message
        var addedList = serverData['filter']['addedwords'];
        if(addedList) for (word of addedList) swears.push(word);
        swears.some(word => { // Iterate through the list
            for(var item in splitMsg) { // Get the item
                if (splitMsg[item].replace(/[^a-z\s]/gi, '').toLowerCase() == word) splitMsg[item] = '\\*\\*\\*\\*'; // If it equals word,  c e n s o r  i t
            }
        });
        msg.delete().then(() => {
            if(serverData['filter']['type'] == 1) utils.sendEmbeddedResponse(msg, true, false, `Some words in this message have been blocked in this channel.`, "roll word filter", 0xFF0000, {name: `Censored message`, value: `${msg.member}: ${splitMsg.join(" ")}`}, `${msg.guild.name} - roll word filter is enabled for #${msg.channel.name}`);
            else if(serverData['filter']['type'] == 2) msg.channel.send(`${msg.member}, some words in your message are not allowed in this channel!`);
        });
    }
}