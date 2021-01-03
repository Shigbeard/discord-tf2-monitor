const Discord = require("discord.js");
const fs = require("fs");
const prompt = require("prompt");
const chalk = require("chalk");
let config = {}
try {
	config = require("./config.json");
} catch (e) {
	console.log(chalk.bgRedBright(chalk.whiteBright("No config.json found, creating...")));
	config = {}
	fs.writeFile("./config.json", "{}");
}
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
	
	if(err) console.log(err);
	
	let jsfile = files.filter(f => f.endsWith('.js'))
	if(jsfile.length <= 0){
		console.log("Couldn't find commands.");
		return;
	}
	
	jsfile.forEach((f, i) =>{
		let props = require(`./commands/${f}`);
		console.log(`${f} loaded!`);
		bot.commands.set(props.help.name, props);
	});
	
});

bot.on("ready", async () => {
	console.log(`${bot.user.username} is online on ${bot.guilds.cache.size} servers!`);
	
	bot.user.setActivity("Team Fortress 2", {type: "PLAYING"});
	
	bot.commands.get("monitor").restart(bot);
});

bot.on("message", async message => {
	if(message.author.id != config.owner) return;
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
	
	let prefix = config.prefix;
	let messageArray = message.content.match(/(?:[^\s"]+|"[^"]*")+/g);
	let cmd = messageArray[0];
	let args = messageArray.slice(1);

	if(!cmd.startsWith(config.prefix)) return;
	let commandfile = bot.commands.get(cmd.slice(prefix.length));
	if(commandfile) commandfile.run(bot,message,args);
	
});

process.on('SIGINT', () => {
	console.log(chalk.bgRedBright("Caught CTRL+C (SIGINT) signal, terminating the bot."))
	bot.destroy();
	process.exit(0);
})
bot.login(config.token).catch((error) => {
	if(error.code == "TOKEN_INVALID"){
		setTimeout(() => {
			console.log(chalk.bgRedBright(chalk.whiteBright("An Invalid Token was used! Running setup...")))
			prompt.message = chalk.greenBright("[PROMPT]");
			prompt.delimiter = chalk.blueBright(" - ");
			prompt.start();
			prompt.get({
				properties: {
					token: {
						description: chalk.green("Please insert your Bot Token."),
						type: 'string',
						pattern: /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/,
						message: 'Please insert a valid Discord Bot Token',
						hidden: true,
						replace: '*',
						required: true
					},
					ownerid: {
						description: chalk.green("Please insert the id of the user that the bot will consider it's owner."),
						type: 'number',
						hidden: false,
						message: 'An owner id is required.',
						required: true
					},
					prefix: {
						description: chalk.green("Please insert the bot's preferred prefix. (default !)"),
						type: 'string',
						hidden: false,
						message: "A prefix is required.",
						required: true,
						default: '!'
					}
				}
			}, (err, result) => {
				data = JSON.stringify(result);
				fs.writeFile('config.json', data, (err) => {
					if (err) throw err;
					console.log(chalk.bgBlue(chalk.whiteBright("Setup complete!")) + " Please restart the bot using the same command.");
				});
			});
		}, 2000);
	}
});
