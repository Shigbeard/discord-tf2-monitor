const chalk = require('chalk');
const Discord = require('discord.js');
const { isUndefined } = require('util');
const db = require('better-sqlite3')('schedules.db');
db.prepare('\
CREATE TABLE IF NOT EXISTS text_schedules (\
    id INTEGER PRIMARY KEY AUTOINCREMENT, \
    host NOT NULL, \
    port NOT NULL, \
    stype NOT NULL, \
    guild NOT NULL, \
    channel NOT NULL, \
    message NOT NULL, \
    interval NOT NULL\
    )').run();
db.prepare('\
CREATE TABLE IF NOT EXISTS voice_schedules (\
    id INTEGER PRIMARY KEY AUTOINCREMENT, \
    host NOT NULL, \
    port NOT NULL, \
    stype NOT NULL, \
    guild NOT NULL, \
    channel NOT NULL, \
    name NOT NULL, \
    interval NOT NULL\
    )').run();

module.exports.help = {
    name:"schedules"
}

module.exports.run = async (bot, message, args) => {
    switch(args[0]){
        case "list":
            msg = "```md\n"
            tss = db.prepare("SELECT * FROM text_schedules")
            vss = db.prepare("SELECT * FROM voice_schedules")
            charlength = new Map()
            charlength.id = 0
            charlength.guild = 0
            charlength.channel = 0
            charlength.host = 0
            for(const ts of tss.iterate()){
                guild = await bot.guilds.cache.get(ts.guild)
                channel = await guild.channels.cache.get(ts.channel)
                if(ts.id.length > charlength.id) charlength.id = ts.id.length
                if(guild.name.length > charlength.guild) charlength.guild = guild.name.length
                if(channel.name.length > charlength.channel + 1) charlength.channel = channel.name.length + 1
                if((ts.host.length + ts.port.length + 1) > charlength.host) charlength.host = (ts.host.length + ts.port.length + 1)
            }
            for(const vs of vss.iterate()){
                guild = await bot.guilds.cache.get(vs.guild)
                channel = await guild.channels.cache.get(vs.channel)
                if(vs.id.length > charlength.id) charlength.id = vs.id.length
                if(guild.name.length > charlength.guild) charlength.guild = guild.name.length
                if(channel.name.length > charlength.channel + 1) charlength.channel = channel.name.length +1 
                if((vs.host.length + vs.port.length + 1) > charlength.host) charlength.host = (vs.host.length + vs.port.length + 1)
            }
            msg += `>  ${" ".repeat(charlength.id)}ID | ${" ".repeat((charlength.guild + 4) - 5)}Guild |  ${" ".repeat((charlength.channel) - 7)}Channel | ${" ".repeat((charlength.host + 4) - 8)}Hostname\n`
            for(const ts of tss.iterate()){
                guild = await bot.guilds.cache.get(ts.guild)
                channel = await guild.channels.cache.get(ts.channel)
                msg += `T ${" ".repeat(charlength.id - ts.id.length)}<${ts.id}> - <<${" ".repeat(charlength.guild - guild.name.length)}${guild.name}>> - ${" ".repeat(charlength.channel - channel.name.length)}#${channel.name} - <<${" ".repeat(charlength.host - (ts.host.length + ts.port.length + 1))}${ts.host}:${ts.port}>>\n`
            }
            msg += "\n"
            for(const vs of vss.iterate()){
                guild = await bot.guilds.cache.get(vs.guild)
                channel = await guild.channels.cache.get(vs.channel)
                msg += `V ${" ".repeat(charlength.id - vs.id.length)}<${vs.id}> - <<${" ".repeat(charlength.guild - guild.name.length)}${guild.name}>> - ${" ".repeat(charlength.channel - channel.name.length)}🔈${channel.name} - <<${" ".repeat(charlength.host - (vs.host.length + vs.port.length + 1))}${vs.host}:${vs.port}>>\n`
            }
            msg += "```"
            console.log(msg)
            await message.channel.send(msg);
            break;
        case "delete":
            //await message.channel.send('unimplemented. Just edit the database and restart the bot, soz dude');
            switch(args[1].toLowerCase()){
                case "v":
                    row = db.prepare("SELECT * FROM voice_schedules WHERE id = ?").get(args[2]);
                    if(row === undefined){
                        await message.channel.send("Couldnt find anything with that id.");
                        break;
                    }else{
                        clearInterval(row.interval);
                        guild = await bot.guilds.cache.get(row.guild);
                        channel = await guild.channels.cache.get(row.channel);
                        await channel.setName("Monitor Removed");
                        await message.channel.send("Schedule cleared.")
                        db.prepare("DELETE FROM voice_schedules WHERE id = ?").run(row.id);
                        break;
                    }
                case "t":
                    row = db.prepare("SELECT * FROM text_schedules WHERE id = ?").get(args[2]);
                    if(row === undefined){
                        await message.channel.send("Couldn't find anything with that id.");
                        break;
                    }else{
                        clearInterval(row.interval);
                        guild = await bot.guilds.cache.get(row.guild);
                        channel = await guild.channels.cache.get(row.channel);
                        msg = await channel.messages.fetch(row.message);
                        await msg.delete();
                        await message.channel.send("Schedule cleared.");
                        db.prepare("DELETE FROM text_schedules WHERE id = ?").run(row.id);
                        break;
                    }
                default:
                    await message.channel.send("Error: Invalid channel type (t/v)")
            }
            break;
        default:
            await message.channel.send("Invalid Command Argument #1 - Expected `list` or `delete`");
    }

}