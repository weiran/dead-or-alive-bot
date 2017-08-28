require('dotenv').config();

const Telegraf = require('telegraf');
const DeadOrAlive = require('./DeadOrAlive');

const bot = new Telegraf(process.env.BOT_TOKEN_DEV);

const parseTextFromCommand = (text, commandOffset) => {
    const command = text.substring(commandOffset.offset, commandOffset.length);
    const start = commandOffset.offset + commandOffset.length + 1;
    return {
        command,
        text: text.substring(start, text.length)
    };
};

bot.on('text', async (context) => {
    const message = context.message;
    let searchTerm = message.text;
    if (message.entities !== undefined && message.entities.length > 0) {
        const commandOffset = message.entities[0];
        const { command, text } = parseTextFromCommand(searchTerm, commandOffset);

        switch (command) {
        case '/dead':
        case '/alive': {
            searchTerm = text;
            break;
        }
        default:
            return;
        }
    }

    let response = `Couldn't find a person named ${searchTerm}.`;
    try {
        const result = await DeadOrAlive.search(searchTerm);
        if (result === null) return;

        switch (result.isDead) {
        case true:
            response = `[${result.name}](${result.wikipediaUrl}) died aged ${result.age} on ${result.dateOfDeath}.`;
            break;
        case false:
            response = `[${result.name}](${result.wikipediaUrl}) is alive and kicking at ${result.age} years old.`;
            break;
        default:
        }
    } catch (e) {
        switch (e.message) {
        case 'not-found':
            break;
        default:
            response = e.message;
        }
    }

    context.replyWithMarkdown(response);
});

bot.startPolling();
