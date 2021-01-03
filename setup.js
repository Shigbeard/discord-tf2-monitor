const fs = require('fs');
const prompt = require('prompt');
const chalk = require('chalk');
console.log(chalk.bgGreenBright(chalk.black("To cancel your changes, simply press CTRL + C before finishing the setup.")));
process.on('SIGINT', function() {
    console.log(chalk.bgGreenBright(chalk.black("Detected CTRL+C, cancelling setup.")));
    process.exit(0);
})
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
    console.log(chalk.bgBlue(chalk.whiteBright("Setup complete!")) + " You can start the bot with \"npm start\"");
    fs.writeFile('config.json', data, (err) => {
        if (err) throw err;
    });
});
//process.exit(0);