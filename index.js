const Telegraf = require("telegraf");

let config = process.env;
if (!config.TELEGRAM_TOKEN) {
    config = require("./config");
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN || config.TELEGRAM_TOKEN);

const DeadOrAliveService = require("./DeadOrAliveService");

bot.on("text", async context => {
    let message = context.message;
    let searchTerm = message.text;
    if (message.entities !== undefined && message.entities.length > 0) {
        let commandOffset = message.entities[0];
        searchTerm = searchTerm.substring(commandOffset.offset + commandOffset.length + 1, searchTerm.length);
    }

    const deadOrAliveService = new DeadOrAliveService();
    let result = await deadOrAliveService.search(searchTerm);
    let response = null;
    if (result && result.isDead) { // dead
        response = `${result.name} died aged ${result.age} on ${result.dateOfDeath}.`;
    } else if (result && !result.Dead) { // alive
        response = `${result.name} is alive and kicking and ${result.age} years old.`;
    } else { // not found
        response = `Couldn't find a person named ${searchTerm}.`;
    }

    return context.reply(response);
});

bot.startPolling();