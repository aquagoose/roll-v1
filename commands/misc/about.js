const Discord = require('discord.js');

module.exports = {
    name: 'about',
    description: 'Gives some useful links, if you want to contact the developer for example.',
    category: 'misc',
    execute (msg) {
        var embed = new Discord.MessageEmbed()
        .setTitle('About Roll')
        .setColor('#fcba03')
        .setDescription(`Thank you for using Roll! :)\nDeveloped by Ollie Robinson.\n\nTo find the documentation, please visit\n${msg.client.weblink}\nYou can also join our support discord server at\nhttps://discord.gg/jyVAKU9\nYou can add me to your server at\nhttps://bit.ly/addroll\nSupport me on my patreon at\n(LINK WIP)`)
        .setThumbnail(msg.client.user.displayAvatarURL());
        msg.channel.send(embed);
    }
}