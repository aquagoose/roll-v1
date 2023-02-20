module.exports = {
    name: "hello",
    description: "Says hi.",
    aliases: ['hi'],
    category: 'fun',
    execute(msg) {
        msg.channel.send(`Hi ${msg.member}!`);
    }
}