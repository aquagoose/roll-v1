const jsonWriter = require("../../stuff/jsonWriter");
const utils = require("../../stuff/utils");

module.exports = {
    name: 'setmuterole',
    description: 'Set the mute role for this server. Please note, to use the mute & unmute command, you **do not** need to set this up. This is only if you want a specific role added to the user when muted.',
    args: true,
    usage: '<role>',
    requireperms: 'administrator',
    category: 'setup',
    execute(msg, args) {
        var role; // Self explanatory if you've seen any of my other code
        if(msg.mentions.roles.first()) role = msg.mentions.roles.first();
        else if(msg.guild.roles.cache.find(r => r.name === args[0])) role = msg.guild.roles.cache.find(r => r.name === args[0]);
        else if(msg.guild.roles.cache.find(r => r.id === args[0])) role = msg.guild.roles.cache.find(r => r.id === args[0]);
        else return utils.sendEmbeddedResponse(msg, false, true, `I can't find that role!`, null, 0xFF0000);
        jsonWriter.writeServerData('./data/server-config.json', msg.guild, {"muterole":role.id}); // Since the writeServerData doesn't require a server to exist if you're only writing single pieces of data like this, this works just fine.
        utils.sendEmbeddedResponse(msg, false, true, `\`${role.name}\` has been set as the muted role for this server!`, null, 0x00FF00);
    }
}