require('dotenv').config();
const { Telegraf } = require('telegraf');
const BotRunner = require('./BotRunner');

const bot = new Telegraf(process.env.BOT_TOKEN_DEV);
bot.on('text', BotRunner.textReceived);
bot.startPolling();
