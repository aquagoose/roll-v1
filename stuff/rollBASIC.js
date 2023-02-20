const jsonWriter = require("./jsonWriter");
const utils = require("./utils");
const fs = require('fs');
var tempVars = {}; // Temp variables
let inIf = false;
const { promisify } = require('util');
const delay = promisify(setTimeout);

//const premiumCommands = ['store', 'load'];
const premiumCommands = [];

module.exports = {
    executeCode: function(ctx, code, custom) { // This gets the code and the message context
        if(!code) return ctx.channel.send(`This command is ready to go! Just needs a bit of code to get it started.`)
        const getLines = code.split('\n'); // Splits the message into lines
        //const premiumUsers = JSON.parse(fs.readFileSync('./stuff/premiumusers.json'));
        const premiumUsers = [];
        //if(getLines.length > 30 && premiumUsers.indexOf(ctx.member.id) < 0) return utils.sendEmbeddedResponse(ctx, true, false, `The maximum number of lines for this server is 30! You have ${getLines.length} lines!`, `Whoa there!`, 0xFF0000);
        run(ctx, getLines, premiumUsers, false, custom); // Runs the code
    },

    async compile(ctx, code) {
        if(!code) return "NO_CODE";
        const splitCode = code.split("\n");
        //const premiumUsers = JSON.parse(fs.readFileSync('./stuff/premiumusers.json'));
        const premiumUsers = [];
        //if(splitCode.length > 30 && premiumUsers.indexOf(ctx.member.id) < 0) return utils.sendEmbeddedResponse(ctx, true, false, `The maximum number of lines for this server is 30! You have ${getLines.length} lines!`, `Whoa there!`, 0xFF0000);
        const success = await run(ctx, splitCode, premiumUsers, true);
        return success;
    }
}

function replaceVars(msg, text) { // This function looks for variable references in text and replaces them accordingly.
    const server = msg.guild.id;
    if(typeof text != 'string') text = text.join(" "); // If the list is an array, convert it to a list.
    text = text.split('\\n'); // Since this is always run, take any \n's written in the code and split them to a new line
    text = text.join("\n"); // Then immediately join the text again, but with a new line added instead.
    const splitText = text.split(" "); // Split the text
    for (word of splitText) { // Runs for each word.
        if(word.includes('$')) {
            const getTerm = word.slice(word.indexOf('$')).replace(/[^a-z0-9\s]/gi, ''); // Get the term, and ignore anything except alphanumeric characters.
            // The code here just checks for certain values and replaces them accordingly. If you don't understand this then grow a brain please.
            if(getTerm == 'guildMemberCount') text = text.replace(`$${getTerm}`, msg.guild.members.cache.size);
            else if(getTerm == 'getMessageArgs') text = text.replace(`$${getTerm}`, msg.content.slice(msg.guild.prefix.length).split(" ").splice(1, msg.content.length).join(" ").replace(new RegExp('"', "gi"), '\\"'));
            else if(getTerm.startsWith('getMessageArgs')) text = text.replace(`$${getTerm}`, msg.content.slice(msg.guild.prefix.length).split(" ").splice(parseInt(getTerm.substring(14))+1, msg.content.length).join(" ").replace(new RegExp('"', "gi"), '\\"'));
            else if(getTerm.startsWith('getMessageArgument')) text = text.replace(`$${getTerm}`, msg.content.slice(msg.guild.prefix.length).split(" ")[parseInt(getTerm.substring(18))+1]);
            else if(getTerm == 'null') text = text.replace(`$${getTerm}`, null);
            else if(getTerm == 'undefined') text = text.replace(`$${getTerm}`, undefined);
            else if(getTerm == 'getCommandMessage') text = text.replace(`$${getTerm}`, msg.id);
            else if(getTerm == 'getCommandChannel') text = text.replace(`$${getTerm}`, msg.channel.id);
            else if(getTerm == 'getCommandAuthor') text = text.replace(`$${getTerm}`, msg.member.id);
            else if(getTerm == 'mentionCommandAuthor') text = text.replace(`$${getTerm}`, msg.member);
	    else if (getTerm == 'getCommandAuthorDisplayName') text = text.replace(`$${getTerm}`, msg.member.displayName.replace(new RegExp('"', "gi"), '\\"'));
	    else if (getTerm == 'getCommandAuthorPicture') text = text.replace(`$${getTerm}`, msg.author.displayAvatarURL());
            else if(getTerm.startsWith('rand')) text = text.replace(`$${getTerm}`, Math.floor(Math.random() * (parseInt(getTerm.substring(4))-1)).toString());
            else { // If it does not equal or start with any of these, assume the user wants a variable they have defined and use that instead.
                //if(!tempVars[server][getVarName]) return error(msg, lineno, `Variable error: '${getVarName}' is not defined`);
                if(!tempVars[server][getTerm]) text = text.replace(`$${getTerm}`, undefined); // If the variable isn't set, return undefined (do I actually need this?)
                else text = text.replace(`$${getTerm}`, tempVars[server][getTerm].toString()); // Replaces the text with the variable
            }
        }
    }
    return text; // return text;
}

async function run(msg, lines, premiumUsers, compile, custom) {
    const server = msg.guild.id;
    tempVars[server] = {}; // The list of temp vars.
    var funcs = {}; // I probably don't need this.
    global.lineno = 0; // The current linenumber.

    const functions = { // A list of ALL syntax the command set has
        send(ls) { // Send a message as the bot
            if (ls[0] == '--channel') { // Checks to see if the user wants to send to a specific channel.
                var channel = msg.guild.channels.cache.get(ls[1]);
                if(!channel) error(msg, lineno, `Channel Error: Unable to find channel '${ls[1]}'`);
                var text = ls.splice(2, ls.length).join(" ");
                channel.send(replaceVars(msg, text)).catch(err => { error(err); return; });
            }
            else if(ls[0] == '--member') {
                var member = msg.guild.members.cache.get(ls[1]);
                if(!member) error(msg, lineno, `Channel Error: Unable to find member '${ls[1]}'`);
                var text = ls.splice(2, ls.length).join(" ");
                member.send(replaceVars(msg, text)).catch(err => { error(err); return; });
            }
            else {
                var text = ls.join(" ");
                msg.channel.send(replaceVars(msg, text)).catch(err => { error(err); return; });
            }
        },
        
        variable(ls) { // Define a new variable
            const varName = ls[0];
            const varValue = ls.splice(1, ls.length).join(" ").toString();
            tempVars[server][varName] = replaceVars(msg, varValue);
        },

        async sendembed(ls) { // Send an embed as the bot
            let string = "";
            let channel = msg.channel;
            let storeName = null;
            for (let i = 0; i < ls.length; i++) {
                let word = ls[i];
                if (word.startsWith('--')) {
                    switch(word) {
                        case "--channel":
                            channel = msg.guild.channels.cache.get(replaceVars(msg, ls[i+1]));
                            if(!channel) error(msg, lineno, `Channel Error: Unable to find channel '${ls[i+1]}'`);
                            i++;
                            break;
                        case "--member":
                            channel = msg.guild.members.cache.get(replaceVars(msg, ls[i+1]));
                            if(!channel) error(msg, lineno, `Channel Error: Unable to find member '${ls[i+1]}'`);
                            i++;
                            break;
                        case "--store":
                            storeName = ls[i+1];
                            i++;
                            break;
                    }
                }
                else string += word + " ";
            }

            string = replaceVars(msg, string);
            string = string.replace(new RegExp("\n", "gi"), "\\n");
            //console.log(string);
            await channel.send({embed:JSON.parse(string)}).then(msg => {if (storeName != null) this.variable([storeName, msg.id])});

            /*if (ls[0] == '--channel') { // This works the same as send
                var channel = msg.guild.channels.cache.get(ls[1]);
                if(!channel) error(msg, lineno, `Channel Error: Unable to find channel '${ls[1]}'`);
                var embed = ls.splice(2, ls.length).join(" ");
                embed = replaceVars(msg, embed);
                try {
                    channel.send({embed:JSON.parse(embed)});
                } catch (err) {
                    error(msg, lineno, `LINE ${lineno}: ${err}`);
                }
            }
            else if(ls[0] == '--member') {
                var member = msg.guild.members.cache.get(ls[1]);
                if(!member) error(msg, lineno, `Channel Error: Unable to find member '${ls[1]}'`);
                var embed = ls.splice(2, ls.length).join(" ");
                embed = replaceVars(msg, embed);
                try {
                    member.send({embed:JSON.parse(embed)});
                } catch (err) {
                    error(msg, lineno, `LINE ${lineno}: ${err}`);
                }
            }
            else {
                var embed = ls.join(" ");
                embed = replaceVars(msg, embed);
                try {
                    msg.channel.send({embed:JSON.parse(embed)});
                } catch (err) {
                    error(msg, lineno, `LINE ${lineno}: ${err}`);
                }
            }*/
        },

        async react(ls) {
            let channel = msg.channel;
            if (ls[2]) channel = msg.guild.channels.cache.get(replaceVars(msg, ls[2]));
            const m = await channel.messages.fetch(replaceVars(msg, ls[0]));
            const reaction = ls[1];
            await m.react(reaction);
        },

        if(ls) { // Spicy if statement
            var cond1 = replaceVars(msg, ls[0]); // Get the first condition
            var operator = ls[1]; // Get the  o p e r a t o r
            var cond2 = replaceVars(msg, ls[2]); // Get the second condition
            //const thenCode = ls.splice(3, ls.length);
            const startLine = lineno; // Get the current starting linenumber
            var endLine; // When an endif is detected this value will be set
            for (var a=startLine; a<lines.length; a++) { // Runs for the entire length of the if statement.
                const getIfLn = lines[a];
                if(getIfLn == "endif" || getIfLn.startsWith("else if") || getIfLn == "else") { // If the get if line is endif then set endline to a, and stop.
                    endLine = a;
                    break;
                }
            }
            switch(operator) { // This just checks for operators.
                case  '=':
                    //if(cond1 == cond2) execute(msg, lineno, thenCode.shift(), thenCode, functions);
                    if(cond1 == cond2); // If the condition one is equal to condition two, then don't do anything and let the interpreter continue as normal.
                    else lineno = endLine; // Otherwise, set the current line number to the end of the if statement.
                    break;
                case  '==':
                    if(cond1 == cond2);
                    else lineno = endLine;
                    break;
                case  '!=':
                    if(cond1 != cond2);
                    else lineno = endLine;
                    break;
                case 'contains':
                    if(cond1.toLowerCase().includes(cond2.toLowerCase()));
                    else lineno = endLine;
                    break;
                case 'hasrole':
                    var tempmbr = msg.guild.members.cache.get(cond1);
                    if(tempmbr.roles.cache.find(r => r.id === cond2));
                    else lineno = endLine;
                    break;
                case "nothaverole":
                    var tempmbr = msg.guild.members.cache.get(cond1);
                    if (!tempmbr.roles.cache.find(r => r.id === cond2));
                    else lineno = endLine;
                    break;
            };
        },

        else(ls)
        {
            if (ls.shift() == "if")
                this.if(ls);
        },
        
        endif() {}, // !! BODGE WARNING !!

        async delete(ls) { // Delete the defined message
            if (ls[1]) var message = await msg.guild.channels.cache.get(replaceVars(msg, ls[1])).messages.fetch(replaceVars(msg, ls[0]))
            else var message = await msg.channel.messages.fetch(replaceVars(msg, ls[0])); // Since messages should always have an ID, wait for the bot to fetch it.
            if(message) message.delete(); // Delete the message.
        },

        stop() { // Stop the execution of the command.
            lineno = lineno.length+1; // This is a bodge. It works. I like.
        },

        store(ls) { // Store variable
            const storeVarName = replaceVars(msg, ls[0]);
            const storeValue = replaceVars(msg, ls.splice(1, ls.length).join(" "));
            var storedData = jsonWriter.readServerData('./stuff/storedData.json', msg.guild);
            if(!storedData) { jsonWriter.createServer('./stuff/storedData.json', msg.guild); storedData = {}; }
            storedData[storeVarName] = storeValue;
            jsonWriter.writeServerData('./stuff/storedData.json', msg.guild, storedData);
        },

        load(ls) { // Load variable
            const loadDataName = ls[0];
            const storeVar = ls[1];
            var storedData = jsonWriter.readServerData('./stuff/storedData.json', msg.guild);
            if(!storedData) return;
            this.variable([storeVar, storedData[replaceVars(msg, loadDataName)]]);
        },

        giverole(ls) {
            const getMember = replaceVars(msg, ls[0]);
            const getRole = replaceVars(msg, ls[1]);
            const member = msg.guild.members.cache.get(getMember);
            if(!member) return error(msg, lineno, `Cannot find member '${getMember}'`);
            member.roles.add(getRole);
        },

        removerole(ls) {
            const getMember = replaceVars(msg, ls[0]);
            const getRole = replaceVars(msg, ls[1]);
            const member = msg.guild.members.cache.get(getMember);
            if(!member) return error(msg, lineno, `Cannot find member '${getMember}'`);
            member.roles.remove(getRole);
        },

        async sleep(ls) {
            await delay(ls[0]);
        }
    }
    if(compile) {
        for (lineno = 0; lineno<lines.length; lineno++) {
            const line = lines[lineno];
            var ls = line.split(" "); // ls stands for.. uh..... line-split i think?
            const syntax = ls.shift(); // Get the syntax from the line.
            if(!functions[syntax]) { error(msg, lineno, `Syntax error: '${syntax}' is not a function`); return false; } // Execute the command. I could have done this better but I am lazy.
            //else if(premiumCommands.indexOf(syntax) > -1 && premiumUsers.indexOf(msg.member.id) < 0) { error(msg, lineno, `Premium error: You are not permitted to use the '${syntax}' function. This function is limited to premium members only.`); return false;}
        }
        return true;
    }
    else {
        for (lineno = 0; lineno<lines.length; lineno++) { // This is the main interpreter. This goes through and executes each line of code.
            const line = lines[lineno];
            var ls = line.split(" "); // ls stands for.. uh..... line-split i think?
            const syntax = ls.shift(); // Get the syntax from the line.
            await execute(msg, lineno, syntax, ls, functions, premiumUsers, custom); // Execute the command. I could have done this better but I am lazy.
        }
    }
}

function error(msg, lineno, err) {
    return utils.sendEmbeddedResponse(msg, true, false, `\`LINE ${lineno}: ${err}\``, `Error in your code!`, 0xFF0000);
}

async function execute(msg, lineno, syntax, ls, functions, premiumUsers, custom) { // This runs the command itself.
    try {
        if(!functions[syntax]) error(msg, lineno, `Syntax error: '${syntax}' is not a function`); // If the command doesn't exist....
        else if((premiumCommands.indexOf(syntax) > -1 && premiumUsers.indexOf(msg.member.id) < 0) && !custom) error(msg, lineno, `Premium error: You are not permitted to use the '${syntax}' function. This function is limited to premium members only.`);
        else await functions[syntax](ls); // Run the command
    }
    catch (err) { error(msg, lineno, err); } // Error any errors. Error.
}
