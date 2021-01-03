const chalk = require('chalk');
const Discord = require("discord.js");
const db = require('better-sqlite3')('schedules.db');
db.prepare('\
CREATE TABLE IF NOT EXISTS text_schedules (id INTEGER PRIMARY KEY AUTOINCREMENT, host NOT NULL, port NOT NULL, stype NOT NULL, guild NOT NULL, channel NOT NULL, message NOT NULL, interval NOT NULL)').run();
db.prepare('CREATE TABLE IF NOT EXISTS voice_schedules (id INTEGER PRIMARY KEY AUTOINCREMENT, host NOT NULL, port NOT NULL, stype NOT NULL, guild NOT NULL, channel NOT NULL, name NOT NULL, interval NOT NULL)').run();
//schedules.schedules.append(interval,["text",host,port,stype,[channel.guild.id, channel.id],newmsg.id]);
const Gamedig = require("gamedig");
const dns = require("dns");
const Gradient = require('javascript-color-gradient');

queryServer = (ip, port = '27015', type = 'tf2') => {
    return new Promise((resolve, reject) => {
        dns.lookup(ip, (err) =>{
            if (!err){
                Gamedig.query({
                    type: type,
                    host: ip,
                    port: port,
                    maxAttempts: 3
                }).then((state) => {
                    resolve(state);
                }).catch((error) => {
                    reject("No online server was found at that address.");
                });
            } else {
                reject("That appears to be an invalid IP address or hostname.")
            }
        })
    })
}
buildOfflineEmbed = (message) => {
    let d = new Date();
    let name = ""
    if(message.embeds){
        name = message.embeds[0].author.name
    }
    return {
        "author": {
            "name": name,
            "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Team_Fortress_2_style_logo.svg/2000px-Team_Fortress_2_style_logo.svg.png"
        },
        // "title": "Click to connect to server",
        "description": `Server is offline.`,
        // "url": `steam://connect/${state.connect}`,
        "color": 1,
        "timestamp": `${d.toISOString()}`,
        "footer": {
            "icon_url": "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/mozilla/36/electric-plug_1f50c.png",
            "text": "Status Last Updated"
        },
        "fields": [
            {
                "name": `Players - **Error**`,
                "value": `\`\`\`md\n> Server is offline <\`\`\``
            },
            {
                "name": "Connect",
                "value": `( Server is offline )`
            }
        ]
    }
}
buildEmbed = (state) => {
    let d = new Date();
    let players = "";
    let longestName = 4;
    let longestScore = 3;
    var colorGradient = new Gradient();
    let green = 8311585;
    let red = 13632027;
    let playercount = state.raw.numplayers + 0.000000001 // Color Gradient doesn't support 0 as a value.
    colorGradient.setGradient("#"+green.toString(16),"#"+red.toString(16));
    if(state.raw.numplayers > 0){
        state.players.forEach((v, i) => {
            if(v.name.length > longestName){
                longestName = v.name.length;
            }
            if(v.score.toString().length > longestScore){
                longestScore = v.score.toString().length;
            }
        });
        players += `> Name${" ".repeat(longestName - 4)} | Score${" ".repeat(longestScore - 3)} |     Time\n`
        state.players.forEach((v, i) => {
            players += `+ ${v.name}${" ".repeat(longestName - v.name.length)} - ${" ".repeat(longestScore - v.score.toString().length)}<${v.score}> - <<${new Date(v.time * 1000).toISOString().substr(11, 8)}>>\n`;
        });
    }else{
        players += `# No Players Online #`
    }
    return {
        "author": {
            "name": state.name,
            "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Team_Fortress_2_style_logo.svg/2000px-Team_Fortress_2_style_logo.svg.png"
        },
        // "title": "Click to connect to server",
        "description": `Playing on **${state.map}**.`,
        // "url": `steam://connect/${state.connect}`,
        "color": parseInt(colorGradient.getColor(playercount).slice(1),16),
        "timestamp": `${d.toISOString()}`,
        "footer": {
            "icon_url": "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/mozilla/36/electric-plug_1f50c.png",
            "text": "Status Last Updated"
        },
        "fields": [
            {
                "name": `Players - **${state.raw.numplayers}/${state.maxplayers}**`,
                "value": `\`\`\`md\n${players}\`\`\``
            },
            {
                "name": "Connect",
                "value": `( steam://connect/${state.connect} )`
            }
        ]
    }
}

doScheduleVoice = (i, data) => {
    //console.log(`${chalk.blue('[TF2Mon]')} Monitor ${data[0]}:${data[1]}, ${data[3].name} - ${new Date().toString()}`);
    //data
    // [host, port, type, channel, name]
    // step 1: Is the channel destroyed?
    if(data[3].deleted == true){
        clearInterval(i);
        return;
    }else{
        queryServer(data[0],data[1],data[2]).then((state) => {
            data[3].setName(`${data[4]} - ${state.raw.numplayers}/${state.maxplayers}`);
            console.log(`${chalk.blue('[TF2Mon]')} ${chalk.red('VOICE')} Monitor ${chalk.green(data[0])}:${data[1]} | ${chalk.yellow(state.raw.numplayers)}/${chalk.yellow(state.maxplayers)} - ${chalk.green(new Date().toISOString())}`);
            //console.log(data)
        }).catch((error) => {
            console.log(`${chalk.blue('[TF2Mon]')} ${chalk.red('VOICE')} Monitor ${chalk.green(data[0])}:${data[1]} | ${chalk.red('OFFLINE')} - ${chalk.green(new Date().toISOString())}`);
            data[3].setName(`${data[4]} - Offline`);
        });
    }
}

doScheduleText = (i, data) => {
    //console.log(`Running Text Monitor ${data[0]}:${data[1]}, ${data[3].id} - ${new Date().toString()}`);
    if(data[3] == undefined){return}
    if(data[3].deleted == true){
        clearInterval(i);
        return;
    }else{
        queryServer(data[0],data[1],data[2]).then((state) => {
            let embed = buildEmbed(state)
            data[3].edit('',{embed});
            console.log(`${chalk.blue('[TF2Mon]')} ${chalk.red('TEXT ')} Monitor ${chalk.green(data[0])}:${data[1]} | ${chalk.yellow(state.raw.numplayers)}/${chalk.yellow(state.maxplayers)} - ${chalk.green(new Date().toISOString())}`);
        }).catch((error) => {
            let embed = buildOfflineEmbed(data[3])
            data[3].edit('',{embed});
            console.log(`${chalk.blue('[TF2Mon]')} ${chalk.red('TEXT ')} Monitor ${chalk.green(data[0])}:${data[1]} | ${chalk.red('OFFLINE')} - ${chalk.green(new Date().toISOString())}`);
        });
    }
}

module.exports.restart = async (bot) => {
    let tss = db.prepare("SELECT * FROM text_schedules");
    let tsss = tss.all();
    for (const ts of tsss){
        guild = await bot.guilds.cache.get(ts.guild)
        channel = await guild.channels.cache.get(ts.channel)
        message = await channel.messages.fetch(ts.message);
        // console.log(channel, message);
        let data = [ts.host,ts.port,ts.stype,message];
        doScheduleText(0,data);
        interval = setInterval(() => {
            doScheduleText(interval,data);
        }, 2*60*1000);
        db.prepare(`UPDATE text_schedules SET interval=${Number(interval)} WHERE id=${ts.id}`).run();
    }
    let vss = db.prepare("SELECT * FROM voice_schedules");
    let vsss = vss.all()
    for (const vs of vsss){
        channel = await bot.guilds.cache.get(vs.guild).channels.cache.get(vs.channel);
        let data = [vs.host,vs.port,vs.stype,channel,vs.name];
        doScheduleVoice(0,data);
        interval = setInterval(() => {
            doScheduleVoice(interval,data);
        },2*60*1000);
        db.prepare(`UPDATE voice_schedules SET interval=${Number(interval)} WHERE id=${vs.id}`).run();
    }
}
module.exports.run = async (bot, message, args) => {
    let host = "";
    let port = "27015";
    let stype = "tf2";
    let id = "";
    let name = "";
    if(args[0].includes(":")){
        let split = args[0].split(":");
        host = split[0];
        port = split[1];
        id = args[1];
        name = args[2];
    }else{
        host = args[0];
        port = args[1];
        id = args[2];
        name = args[3];
    }
    let msg = await message.channel.send("One moment...");
    await queryServer(host,port,stype).then(async (state) => {
        // valid server
        let channel
        if(id == ""){
            channel = message.channel;
        }else{
            channel = message.guild.channels.cache.get(id);
        }
        let data = []
        let interval = 0
        let newmsg
        switch(channel.type){
            case "voice":
            //voice channel renaming scheme
            data = [host,port,stype,channel,name]
            doScheduleVoice(0,data);
            interval = setInterval(() => {
                doScheduleVoice(interval,data);
            }, 2*60*1000);
            
            // schedules TIEM
            // await storage.setItem(interval,["voice",host,port,stype,[channel.guild.id, channel.id],name]);
            insert = db.prepare('INSERT INTO voice_schedules (host,port,stype,guild,channel,name,interval) VALUES (?,?,?,?,?,?,?)');
            insert.run(host,port,stype,[channel.guild.id, channel.id],name,Number(interval));
            msg.edit("Now monitoring.");
            break;
            case "text": case "news":
            newmsg = await channel.send("Loading...");
            data = [host,port,stype,newmsg]
            doScheduleText(0,data);
            interval = setInterval(() => {
                doScheduleText(interval,data);
            }, 2*60*1000);
            // await storage.setItem(interval, ["text",host,port,stype,[channel.guild.id, channel.id],newmsg.id]);
            insert = db.prepare('INSERT INTO text_schedules (host,port,stype,guild,channel,message,interval) VALUES (?,?,?,?,?,?,?)');
            insert.run(host,port,stype,channel.guild.id,channel.id,newmsg.id,Number(interval));
            msg.edit("Now monitoring.")
            break;
            default:
            msg.edit("Invalid Channel ID provided.");
            break;
        }
    }).catch((error) => {
        console.log(error);
        msg.edit(error);
    })
}
module.exports.help = {
    name:"monitor",
    schedules:true
}