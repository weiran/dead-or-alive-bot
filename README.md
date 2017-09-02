<h1 align="center">
    <img src="https://raw.githubusercontent.com/weiran/dead-or-alive-bot/master/logo.png" alt="dead or alive bot" title="dead-or-alive-bot" width="200">
    <br>
    Dead or Alive Bot
    <br>
</h1>

A Telegram bot that searches Wikipedia (via WikiData) for people and informs you if they're dead or alive.

Known as [@dead_or_alive_bot](http://t.me/dead_or_alive_bot) on Telegram.


## Usage

* Via direct message
* When in a group: `/alive [query]` or `/dead [query]`


## Running Development Build

You need to set your bot's token in one of the following ways:

1. Either add a `config.js` that returns a property for your token:
```
module.exports = {
    TELEGRAM_TOKEN: "1234567:AAGdsf08sg9897fsdD89fsD"
};
```
2. Or set an environment variable called `BOT_TOKEN` (can be done in a `.env` file).

Then run `node index`.
