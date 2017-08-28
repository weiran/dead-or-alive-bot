require('dotenv').config();

const Telegraf = require('telegraf');
const DeadOrAliveService = require('./DeadOrAliveService');

const bot = new Telegraf(process.env.BOT_TOKEN_DEV);

const customResponses = {
    harambe: 'Harambe, our lord and saviour was gunned down at 4pm on May 28, 2016. RIP.'
};

bot.on('text', async (context) => {
    const message = context.message;
    let searchTerm = message.text;
    if (message.entities !== undefined && message.entities.length > 0) {
        const commandOffset = message.entities[0];
        const command = searchTerm.substring(commandOffset.offset, commandOffset.length);
        if (command === '/dead' || command === '/alive') {
            // strip out command from message
            const start = commandOffset.offset + commandOffset.length + 1;
            searchTerm = searchTerm.substring(start, searchTerm.length);
        } else {
            // ignore all other commands
            return;
        }
    }

    const customResponse = customResponses[searchTerm.toLowerCase()];
    if (customResponse) {
        context.replyWithMarkdown(customResponse);
    } else {
        try {
            const deadOrAliveService = new DeadOrAliveService();
            const result = await deadOrAliveService.search(searchTerm);
            let response = null;
            if (result && result.isDead) { // dead
                response = `[${result.name}](${result.wikipediaUrl}) died aged ${result.age} on ${result.dateOfDeath}.`;
            } else if (result && !result.Dead) { // alive
                response = `[${result.name}](${result.wikipediaUrl}) is alive and kicking at ${result.age} years old.`;
            } else { // not found
                response = `Couldn't find a person named ${searchTerm}.`;
            }
            context.replyWithMarkdown(response);
        } catch (e) {
            context.reply('Oops, something went wrong.');
        }
    }
});

bot.startPolling();
