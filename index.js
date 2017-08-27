const config = require("./config");
const Telegraf = require("telegraf");
const bot = new Telegraf(config.TELEGRAM_TOKEN);

const DeadOrAliveService = require("./DeadOrAliveService");

bot.on("text", context => {
    const searchTerm = context.message.text;
    const deadOrAliveService = new DeadOrAliveService();
    deadOrAliveService.search(searchTerm)
    .then(result => {
        let response = null;

        if (result && result.isDead) { // dead
            response = `${result.name} died aged ${result.age} on ${result.dateDied}.`;
        } else if (result && !result.Dead) { // alive
            response = `${result.name} is alive and kicking and ${result.age} years old.`;
        } else { // not found
            response = `Couldn't find a person named ${searchTerm}.`;
        }

        return context.reply(response);
    });
});

bot.startPolling();