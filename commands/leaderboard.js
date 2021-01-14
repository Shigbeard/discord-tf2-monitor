// const chalk = require('chalk');
// const Discord = require("discord.js");
const mysql = require('mysql');
// const SteamID = require('steamid');
const config = require('../config.json');

const Table = require('cli-table');

const conn = mysql.createPool({
    connectionLimit: 5,
    host: config.leaderboard.host,
    user: config.leaderboard.user,
    password: config.leaderboard.password,
    database: config.leaderboard.database
});

conn.on('error', (err) => {
    console.log(`MySQL errored! "${err.code}" ${err.fatal == 1 && 'FATAL' || 'NOT FATAL'}`);
});
function timeDifference(current, previous) {
    // This disgusting function just returns a string, of how many
    // years/months/days/hours/minutes/seconds since previous based on current
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
    var elapsed = current - previous;
    if (elapsed < msPerMinute) {let v = Math.round(elapsed/1000); return v + ` second${v == 1 && ' ' || 's '}ago`;}
    else if (elapsed < msPerHour) {let v = Math.round(elapsed/msPerMinute); return v + ` minute${v == 1 && ' ' || 's '}ago`;}
    else if (elapsed < msPerDay ) {let v = Math.round(elapsed/msPerHour ); return v + ` hour${v == 1 && ' ' || 's '}ago`;}
    else if (elapsed < msPerMonth) {let v = Math.round(elapsed/msPerDay); return 'about ' + v + ` day${v == 1 && ' ' || 's '}ago`;}
    else if (elapsed < msPerYear) {let v = Math.round(elapsed/msPerMonth); return 'about ' + v + ` month${v == 1 && ' ' || 's '}ago`;}
    else {let v = Math.round(elapsed/msPerYear); return 'about ' + v + ` year${v == 1 && ' ' || 's '}ago`;}
}

module.exports.run = async(bot,message,args) => {
    let offset = 0
    if(args[0]) offset = Number(args[0]) - 1;
    let count = 0;
    let table = new Table({
        chars: {'mid': '', 'left-mid': '', 'mid-mid':'', 'right-mid':''},
        head: ['#','Name','ELO','W','L','Last Played'],
        colAligns: ['right','left','right','right','right','right'],
        colWidths: [5,27,6,6,6,21],
        style: {'padding-left': 1, 'padding-right':1, 'compact':true},
        colors: false
    });
    conn.query(`SELECT * FROM mgemod_stats ORDER BY rating DESC;`, (e,r,f) => {
        console.log(offset);
        if (e) throw e;
        count = r.length;
        if (Number(offset) > r.length - 20) {
            offset = Math.max(r.length - 20, 0);
        }else{
            offset = Number(offset)
        }
        table.push(['','','','','',''])
        for (let index = offset; index < offset+20; index++) {
            const element = r[index];
            let ely = {};
            let d = new Date(0)
            d.setUTCSeconds(element.lastplayed)
            let d2 = new Date();
            let d3 = timeDifference(d2,d)
            ely.position = index + 1;
            ely.name = element.name;
            ely.steamid = element.steamid;
            ely.rating = element.rating;
            ely.wins = element.wins;
            ely.losses = element.losses;
            ely.lastplayed = d3;
            table.push([ely.position, ely.name, ely.rating, ely.wins, ely.losses, ely.lastplayed]);
        }
        message.channel.send(`\`\`\`\n${count} Rows\n${table.toString()}\`\`\``)
        console.log(table.toString());
        console.log(table.toString().length + 7 + count.toString().length + 4 + 1 + " characters long - Playing with fire here...");
    })
    
}

module.exports.help = {
    name:"leaderboard",
    schedules:false
}