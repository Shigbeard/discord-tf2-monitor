const Discord = require("discord.js");
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

module.exports.run = async (bot, message, args) => {
    let msg = await message.channel.send("One moment...");
    let host = "";
    let port = "27015";
    let type = "tf2";
    if(args[0] == undefined){
        msg.edit("This command expects at least 1 argument.");
        return;
    }
    if(args[0].includes(":")){
        let split = args[0].split(":");
        host = split[0];
        port = split[1];
        if(args[1] != undefined) type = args[1];
    }else{
        host = args[0];
        if(args[1] != undefined) port = args[1];
        if(args[2] != undefined) type = args[2];
    }
    console.log(message.content, args);
    queryServer(host, port, type).then((state) => {
        let embed = buildEmbed(state);
        msg.edit('',{embed});
    }).catch((state) => {
        msg.edit(state);
    })
}

module.exports.help = {
    name:"status"
}