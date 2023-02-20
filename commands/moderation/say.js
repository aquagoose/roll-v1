module.exports = {
    name: 'say',
    description: 'Send a message as the bot itself.',
    args: true,
    usage: '<message>',
    requireperms: 'administrator',
    execute(msg, args) {
        msg.delete().then(() => msg.channel.send(args.join(" ")));
    }
}
