module.exports = {
    name: "sendembed",
    description: "Sends an embed message to the current channel.\nNeed help sending an embed? Use our guide: http://www.ollierobinson.co.uk/roll/sending-an-embed-message/",
    args: true,
    usage: "<embed-JSON>",
    requireperms: "administrator",
    premium: true,
    category: 'moderation',
    execute(msg,args) {
        //const jsonthing = args.join(' ');
        //console.log(jsonthing);
        try {
            var test = JSON.parse(args.join(' '));
            msg.delete();
            msg.channel.send({ embed: test }).catch(err => msg.channel.send(`:x: ${msg.member}, I can't send a blank embed. Please write some JSON!`));
        }
        catch (error) {
            msg.channel.send(`:x: ${msg.member}, that's not valid embed JSON. The error is: \`${error}\`\nNeed help sending an embed? Use our guide: http://www.ollierobinson.co.uk/roll/sending-an-embed-message/`)
        }
    }
} // TODO: Create a new version