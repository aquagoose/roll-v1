const bannedVarNames = ["_RBC_MSG", "_RBC_ARGS", "_RBC_CODE", "_RBC_COMPILED", "if", "as", "is", "false", "true", "repeat", "none"];
const utils = require("./utils");

module.exports =
    {
        compile(msg, code, showJs)
        {
            return compile(msg, code, showJs);
        },
        
        run(msg, args, code, compiled)
        {
            run(msg, args, code, compiled);
        }
    };

// A list of predefined variables that can be used. Format: (message.channel.mention) for example.
const predefinedVars =
    {
        message:
            {
                get(msg) { return msg.id; },
                channel:
                    {
                        get(msg) { return msg.channel.id; },
                        name:
                            {
                                get(msg) { return msg.channel.name; }
                            },
                        mention:
                            {
                                get(msg) { return `<#${msg.channel.id}>`; }
                            }
                    },
                
                author:
                    {
                        get(msg) { return msg.author.toString(); },
                        displayName:
                            {
                                get(msg) { return msg.member.displayName }
                            }
                    },
                
                arguments:
                    {
                        get(msg, args) { return args; }
                    },
                
                content:
                    {
                        get(msg, args) { return msg.content; }
                    }
            },
        
        none: { get() { return null; } },
        true: { get() { return true; } },
        false: { get() { return false; } }
    };

// A list of predefined functions that can be accessed.
const predefinedFuncs =
    {
        async send(msg, args, message, channel = undefined)
        {
            let channelObj;
            if (!channel)
                channelObj = msg.channel;
            else
                channelObj = await msg.guild.channels.cache.get(channel);
            if (!channelObj)
                throw new Error(`Channel "${channel}" could not be found.`);
            const messageID = await channelObj.send(message);
            return messageID.id;
        },
        
        async getChannel(msg, args, channelNameOrId)
        {
            const channel = await msg.guild.channels.cache.find(c => c.name === channelNameOrId || c.id === channelNameOrId);
            if (!channel)
                throw new Error(`Channel "${channelNameOrId}" could not be found.`);
            return channel.id;
        },
        
        async channelExists(msg, args, channelNameOrId)
        {
            const channel = await msg.guild.channels.cache.find(c => c.name === channelNameOrId || c.id === channelNameOrId);
            return !!channel;
        },
        
        async rand(msg, args, min, max)
        {
            return Math.floor(Math.random() * (max - min + 1) + min).toString();
        },
        
        // EMBEDS ------------------------------------------------------------------------------------------------------
        
        async sendEmbed(msg, args, title, description, color, fields)
        {
            return await msg.channel.send({ embed:
                    {
                        title: title,
                        description: description,
                        color: color,
                        fields: fields
                    }});
        },

        async EmbedField(msg, args, name, value, inline = false)
        {
            return { name: name, value: value, inline: inline };
        },
        
        // END OF EMBEDS -----------------------------------------------------------------------------------------------
        
        // ARRAYS ------------------------------------------------------------------------------------------------------
        
        async Array(msg, args, ...arguments)
        {
            let embedArgs = [];
            for (const argument of arguments)
            {
                embedArgs.push(argument);
            }
            
            return embedArgs;
        },
        
        async join(msg, args, array, joinChar)
        {
            return array.join(joinChar);
        },
        
        elementAt(msg, args, array, index)
        {
            return array[index];
        },
        
        append(msg, args, array, element)
        {
            array.push(element);
        },
        
        slice(msg, args, array, start, end = undefined)
        {
            if (!end)
                end = array.length;
            return array.slice(start, end);
        },
        
        length(msg, args, arrayOrString)
        {
            return arrayOrString.length.toString();
        },

        // END OF ARRAYS -----------------------------------------------------------------------------------------------

        // STRINGS -----------------------------------------------------------------------------------------------------

        async lower(msg, args, text)
        {
            return text.toLowerCase();
        },

        async upper(msg, args, text)
        {
            return text.toUpperCase();
        },
        
        split(msg, args, string, splitStr)
        {
            return string.split(splitStr);
        },

        // END OF STRINGS ----------------------------------------------------------------------------------------------
        
        Color(msg, args, r, g, b)
        {
            let colStr = "";
            colStr += r.toString(16);
            colStr += g.toString(16);
            colStr += b.toString(16);
            console.log(colStr);
            return colStr.toString();
        }
    };

// Run string interpolation. This interpolates variables both inside & outside strings (using concatination)
function stringInterpolate(msg, javaScriptString, varNames)
{
    let finalStrings = [];
    // Strings are expected to be in concatenated form, so split them by pluses.
    const splitStr = javaScriptString.split("+");
    
    for (let str of splitStr)
    {
        // Trim the string to remove spaces.
        str = str.trim();
        let string = "";
        let isString = false;
        if (str.startsWith('"') && str.endsWith('"'))
        {
            isString = true;
            str = str.substring(1, str.length - 1);
            string += '"';
        }
        else
        {
            const func = checkForFunction(msg, str, varNames, null);
            if (func)
            {
                string += func;
            }
            else if (varNames.includes(str))
            {
                string += str;
            }
            else
            {
                let predefined = `predefinedVars["`;
                const splitInterp = str.split(".");
                let val = 0;
                for (const pre of splitInterp)
                {
                    predefined += pre;
                    const result = eval(predefined + `"]`);
                    if (result === undefined)
                    {
                        throw new Error(`"${splitInterp.slice(0, val + 1).join(".")}" is not defined`);
                    }
                    if (val + 1 < splitInterp.length)
                        predefined += `"]["`;
                    val++;
                }
                predefined += `"].get(_RBC_MSG, _RBC_ARGS)`;

                string += predefined;
            }
        }
        let interpolationLevel = 0;
        let interpolationString = "";
        for (let i = 0; i < str.length; i++)
        {
            const char = str[i];
            
            if (char === "{")
            {
                if (interpolationLevel > 0)
                    interpolationString += "{";
                interpolationLevel++;
            }
            else if (char === "}")
            {
                interpolationLevel--;
                if (interpolationLevel !== 0)
                {
                    interpolationString += char;
                    continue;
                }
                const func = checkForFunction(msg, interpolationString, varNames, null);
                if (func)
                {
                    string += `"+${func}+"`;
                    continue;
                }
                if (varNames.includes(interpolationString))
                {
                    string += `"+${interpolationString}+"`;
                    interpolationString = "";
                    continue;
                }
                
                let predefined = `predefinedVars["`;
                const splitInterp = interpolationString.split(".");
                let val = 0;
                for (const pre of splitInterp)
                {
                    predefined += pre;
                    const result = eval(predefined + `"]`);
                    if (result === undefined)
                    {
                        throw new Error(`"${splitInterp.slice(0, val + 1).join(".")}" is not defined`);
                    }
                    if (val + 1 < splitInterp.length)
                        predefined += `"]["`;
                    val++;
                }
                predefined += `"].get(_RBC_MSG, _RBC_ARGS)`;
                
                string += `"+${predefined}+"`;
                
                interpolationString = "";
            }
            else if (interpolationLevel > 0)
                interpolationString += char;
            else if (interpolationLevel === 0 && isString)
                string += char;
        }
        if (isString)
            string += '"';
        finalStrings.push(string);
        string = "";
    }
    
    return finalStrings.join("+");
}

// LA = Line Args.
// String interpreter. This first concatenates the strings together, then runs string interpolation.
// While this code is essentially useless right now, I will add token checking later.
function interpretString(msg, la, varNames)
{
    const wholeString = la.join(" ");
    let isInString = false;
    
    let javaScriptString = "";
    
    for (let i = 0; i < wholeString.length; i++)
    {
        const char = wholeString[i];
        
        if (char === '"' && !isInString)
        {
            isInString = true;
            javaScriptString += '"';
        }
        else if (char === '"' && wholeString[i - 1] !== '\\' && isInString)
        {
            isInString = false;
            javaScriptString += '"';
        }
        else if (char === '+' && !isInString)
        {
            javaScriptString += "+";
        }
        //else if (isInString)
        else
            javaScriptString += char;
    }
    
    javaScriptString = stringInterpolate(msg, javaScriptString, varNames);
    return javaScriptString;
}

function checkForFunction(msg, line, tempVars, tempFuncs, outsideString = false)
{
    let lineText = "";
    let varName = "";
    let isFunction = false;
    let funcName = "";
    let bracketLevels = 0;
    let isInString = false;
    for (let i = 0; i < line.length; i++)
    {
        const char = line[i];

        if (char === '"' && !isInString)
        {
            isInString = true;
            lineText += '"';
        }
        else if (char === '"' && line[i - 1] !== '\\' && isInString)
        {
            isInString = false;
            lineText += '"';
        }
        else if (char === '(' && !isInString)
        {
            if (bracketLevels === 0)
            {
                isFunction = true;
                funcName = lineText;
                lineText = "";
            }
            else
                lineText += "(";
            bracketLevels++;
        }
        else if (char === ')' && !isInString)
        {
            bracketLevels--;
            if (bracketLevels === 0)
            {
                if (outsideString) 
                {
                    const lineSplit = line.substring(i, line.length).split(" ");
                    if (lineSplit[1] === "as") 
                    {
                        varName = lineSplit[2];
                        if (bannedVarNames.includes(varName))
                            throw new Error(`Variable name must not be "${varName}" as it is reserved.`);
                        tempVars.push(varName);
                    }
                }
                break;
            }
            else
                lineText += ")";
        }
        else
            lineText += char;
    }
    if (predefinedFuncs[funcName.trim()])
    {
        let params = [];
        let isInString = false;
        let currentStr = "";
        let bracketLevels = 0;
        
        for (let i = 0; i < lineText.length; i++)
        {
            const char = lineText[i];

            if (char === '"' && !isInString)
            {
                isInString = true;
                currentStr += '"';
            }
            else if (char === '"' && lineText[i - 1] !== '\\' && isInString)
            {
                isInString = false;
                currentStr += '"';
            }
            else if (char === '(' && !isInString) 
            {
                bracketLevels++;
                currentStr += "(";
            }
            else if (char === ')' && !isInString) 
            {
                bracketLevels--;
                currentStr += ")";
            }
            else if (char === ',' && !isInString && bracketLevels === 0)
            {
                params.push(currentStr.trim());
                currentStr = "";
            }
            else
                currentStr += char;
        }
        params.push(currentStr.trim());

        let i = 0;
        for(const param of params)
        {
            params[i] = interpretString(msg, param.split(" "), tempVars);
            i++;
        }
        const funcArgs = predefinedFuncs[funcName.trim()].toString().split('\n')[0].split('(')[1].split(')')[0].split(',').slice(2);
        let requiredParams = 0;
        let maxParams = funcArgs.length;
        for (const param of funcArgs) 
        {
            if (param.trim().startsWith("..."))
            {
                maxParams = Number.MAX_SAFE_INTEGER;
                break;
            }
            else if (!param.includes("="))
                requiredParams++;
        }
        if (params.length < requiredParams)
            throw new Error(`"${funcName}" expected ${requiredParams} parameters, however ${params.length} were given.`);
        else if (params.length > maxParams)
            throw new Error(`"${funcName}" has a maximum of ${funcArgs.length} parameters, however ${params.length} were given.`);
        return `${varName.length ? `let ${varName} = ` : ""}await predefinedFuncs["${funcName.trim()}"](_RBC_MSG, _RBC_ARGS, ${params.join(", ")})`
    }
}

// A list of built in statements for things like if statements etc.
const statements =
    {
        end() 
        {
            return "}";
        },
        
        repeat(msg, args, tempVars)
        {
            const value = args.shift();
            if (value === "for")
            {
                let num = args.shift();
                if (isNaN(num))
                {
                    const interp = stringInterpolate(msg, num, tempVars);
                    if (interp)
                        num = interp;
                }
                if (num > 255)
                    throw new Error("Repeat amount must be 255 or less.");
                if (args[0] === "times")
                    args.shift();
                if (args.shift() !== "as")
                    throw new Error(`"repeat" statement must be assigned to a variable.`);
                const valueOfI = args.shift();
                if (bannedVarNames.includes(valueOfI))
                    throw new Error(`Variable name must not be "${valueOfI}" as it is reserved.`);
                tempVars.push(valueOfI);
                return `for (let ${valueOfI} = 0; ${valueOfI} < ${num}; ${valueOfI}++) {`;
            }
        },
        
        if(msg, args, tempVars)
        {
            const ifStatement = args.join(" ");
            let isInString = false;
            let string = "";
            let strings = [];
            let operators = [];
            for (let i = 0; i < ifStatement.length; i++)
            {
                const char = ifStatement[i];
                if (char === '"' && !isInString)
                {
                    
                }
            }
        },
        
        stop()
        {
            return `return;`;
        }
    };

// This will compile the given rollBASIC into JavaScript.
// Any compile-stage errors will be picked up here (for example - variables being referenced that do not exist).
// This MUST be done before the rollBASIC can be executed.
function compile(msg, code, showJavaScript = false)
{
    // A temporary list of vars used to make sure it has been defined before it can be used.
    let tempVars = [];
    let javaScript = "async function rbcCode()\n{\n";
    let lineNo = 0;
    
    for (const line of code.split("\n"))
    {
        try
        {
            const func = checkForFunction(msg, line, tempVars, null, true);
            if (func)
            {
                javaScript += `\t${func};\n`;
                continue;
            }
            
            const args = line.trim().split(" ");
            const functionName = args.shift();
        
            lineNo++;
            if (!statements[functionName])
            {
                if (args[0] === "is" || args[0] === "=" || args[0] === "+=")
                {
                    try
                    {
                        if (args[0] === "+=")
                        {
                            if (!tempVars.includes(functionName))
                                throw new Error(`"${functionName}" is not defined.`);
                            javaScript += `${functionName} += ${interpretString(msg, args.splice(1, args.length), tempVars)};\n`;
                        }
                        else
                        {
                            if (bannedVarNames.includes(functionName))
                                throw new Error(`Variable name must not be "${functionName}" as it is reserved.`);
                            javaScript += "\t" +
                                `${tempVars.includes(functionName) ? "" : "let "}${functionName} = ${interpretString(
                                    msg, args.splice(1, args.length), tempVars)}` +
                                ";\n";
                        }
                    }
                    catch (e)
                    {
                        return error(msg, e, lineNo);
                    }
                    if (!tempVars.includes(functionName))
                        tempVars.push(functionName);
                    continue;
                }
                else if (functionName.startsWith("#") || functionName === "")
                    continue;
                else
                    throw new Error(`SyntaxError: "${functionName}" is not a function.`);
            }
        
            javaScript += "\t" + statements[functionName](msg, args, tempVars) + "\n";
        }
        catch (e)
        {
            return error(msg, e, lineNo);
        }
    }
    javaScript += "}\nrbcCode();";
    
    if (showJavaScript)
        msg.channel.send("I generated this JavaScript while compiling:\n```js\n" + javaScript + "\n```");
    
    return javaScript;
}

function run(_RBC_MSG, _RBC_ARGS, _RBC_CODE, _RBC_COMPILED)
{
    let jsCode = _RBC_CODE;
    if (!_RBC_COMPILED)
        jsCode = compile(_RBC_MSG, _RBC_CODE, false);
    try
    {
        eval(jsCode);
    }
    catch (e)
    {
        return error(_RBC_MSG, e, 0);
    }
}

function error(msg, error, lineNo)
{
    utils.sendEmbeddedResponse(msg, true, false, `\`Line ${lineNo}: ${error.message}\``, "Error", 0xFF0000);
    return false;
}