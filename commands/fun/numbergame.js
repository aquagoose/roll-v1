const Discord = require('discord.js');
const utils = require('../../stuff/utils');

module.exports = {
    name: 'numbergame',
    description: 'Try and guess my number!',
    usage: '[max number] [number of guesses]',
    category: 'fun',
    execute(msg, args) {
        if(utils.isInMessageCollector.has(msg.member)) return;
        var min = 1; // Minimum number that will be generated
        var max = 50; // Maximum number that will be generated
        var startingGuesses = 5; // Number of starting guesses
        if (args[0]) {
            if(isNaN(args[0])) return utils.sendEmbeddedResponse(msg, false, false, `Max number must be an integer value!`, null, 0xFF0000);
            max = parseInt(args[0]);
        }
        if (args[1]) {
            if(isNaN(args[1])) return utils.sendEmbeddedResponse(msg,false, false, `Number of guesses must be an integer value!`, null, 0xFF0000);
            startingGuesses = parseInt(args[1]);
        }
        var guesses = startingGuesses;
        const randnum = genRand(min, max);
        utils.sendEmbeddedResponse(msg,false, false, `Pick a number between ${min} and ${max}! You have ${guesses} guesses.`);
        const collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { idle: 20000 }); // Create the message collector.
        utils.isInMessageCollector.add(msg.member);
        collector.on('collect', (message) => {
            if(!isNaN(message.content)) {
                checkVals(parseInt(message.content));
            } else utils.sendEmbeddedResponse(msg,false, false, `Your guess must be a number!`);
        });

        collector.on('end', (collected, reason) => {
            utils.isInMessageCollector.delete(msg.member);
            if(reason == "noGuesses") {
                utils.sendEmbeddedResponse(msg,false, false, `Oh dear, you ran out of guesses! My number was ${randnum}.`);
            }
            else if (reason == "won") utils.sendEmbeddedResponse(msg, false, false,`Well done! That took you ${startingGuesses - guesses} guesses.`);
            else utils.sendEmbeddedResponse(msg, false, false, `The number game has uh... timed out..`);
        });

        function checkVals(number) {
            if(guesses-1 <= 0 && number != randnum) collector.stop("noGuesses");
            else {
                if (number == randnum) { guesses--; collector.stop("won"); }
                else if(number > randnum) { guesses--; utils.sendEmbeddedResponse(msg,false, false, `Your number is greater than my number! ${guesses} guesses remain.`); }
                else if (number < randnum) { guesses--; utils.sendEmbeddedResponse(msg,false, false, `Your number is less than my number! ${guesses} guesses remain.`); }
                else utils.sendEmbeddedResponse(msg, false, false,`I don't know what has happened!`);
            }
        }

        function genRand(min, max) {
            return Math.floor(Math.random() * (max - min) * min); // Generate the random number
        }
    }
}