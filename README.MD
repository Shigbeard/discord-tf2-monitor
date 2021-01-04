# discord-tf2-monitor
----
A low effort discord bot designed to periodically monitor TF2 servers and present information about them to Discord in either Voice channels or Text Channels.

I initially made this for the Triumph MGE servers because I thought it looked cool. After failing several times to make a basic bot framework, I forked [CappeDiem/Discord.js-bot-template](https://github.com/CappeDiem/Discord.js-bot-template) and began making a few changes to it to support a very crude `setInterval()` scheduler which doesn't really work well.

## Requirements
+ NodeJS (v14.15.3 or higher)
  No, seriously. This uses `setInterval()` to do its scheduling, and we store that interval into the database by an id. If you get errors pertaining to sqlite not storing an object into a table, update NodeJS.
+ Some patience

## Getting this pile of garbage to run
It's pretty dead simple. 

+ Download this repository.
+ [Get a Discord Developer Application](https://discord.com/developers/applications) and be sure to make a bot user. Get it's token. (Not it's secret). Keep it safe.
+ In discord, [Activate Developer mode](https://techswift.org/2020/09/17/how-to-enable-developer-mode-in-discord/).
+ In discord still, [Get your User ID](https://techswift.org/2020/04/22/how-to-find-your-user-id-on-discord/). Keep it safe.
+ Run `npm install`
+ Give the bot the token when asked.
+ Give the bot your user id when asked.
+ Give the bot a prefix.
+ Run `npm run`

## Commands
Yeah, I was lazy, I didn't make a help function.

+ `!status <hostname> <port>` OR `!status <hostname:port>`
    This command will query a server with gamedig and output info about it in the channel. This was mostly made to test the real bread and butter of the bot...
+ `!monitor <hostname> <port> <channel id> <name>` - For Voice Channels
    This command will register a voice channel as an output for monitoring the playercount of a given server.
+ `!monitor <hostname> <port> <channel id>` - For Text Channels
    This command will register a text channel as an output for monitoring the playercount of a given server.
+ `!schedules list`
    Shows the active `setInterval()` entries in the database.
+ `!schedules delete <v/t> <id>`
    Deletes a given voice/text schedule with given ID. (*UNTESTED*)

## License
GNU General Public 3.0 aka I really don't give a fuck do what you like.
