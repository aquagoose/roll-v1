const { TextChannel } = require('discord.js');
const fs = require('fs');

module.exports = {
    writeServerData(file, server, data) {
        const serverID = server.id;
        const json = JSON.parse(fs.readFileSync(file));
        var getData = json[serverID];
        if(!getData) getData = {};
        for (let property in data) {
            getData[property] = data[property];
        }
        json[serverID] = getData;
        fs.writeFileSync(file, JSON.stringify(json));
    },

    deleteServerData(file, server, property) {
        const serverID = server.id;
        const json = JSON.parse(fs.readFileSync(file));
        delete json[serverID][property];
        fs.writeFileSync(file, JSON.stringify(json));
    },

    readServerData(file, server) {
        return JSON.parse(fs.readFileSync(file))[server.id];
    },

    createServer(file, server) {
        this.writeServerData(file, server, {});
    },

    findServerInList(file, server) {
        const tempdata = JSON.parse(fs.readFileSync(file));
        for (const item of tempdata) {
            if(item[server.id]) return item[server.id];
        }
    },

    writeListData(file, server, data) {
        const serverID = server.id;
        const tempdata = JSON.parse(fs.readFileSync(file));
        for (const item of tempdata) {
            if(item[server.id]) {
                var getData = item[server.id];
                if(!getData) getData = {};
                for (let property in data) {
                    getData[property] = data[property];
                }
                tempdata[serverID] = getData;
                return fs.writeFileSync(file, JSON.stringify(tempdata));
            }
        }
        tempdata.push({[serverID]:{}});
        return fs.writeFileSync(file, JSON.stringify(tempdata));
    },

    createListServer(file, server) {
        this.writeListData(file, server, {});
    }

    // TODO: deleting server data & deleting *all* server data
}