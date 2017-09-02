<h1 align="center">
    <img src="https://raw.githubusercontent.com/weiran/dead-or-alive-bot/master/logo.png" alt="dead or alive bot" title="dead-or-alive-bot" width="200">
    <br>
    Dead or Alive Bot
    <br>
</h1>

[![Build Status](https://travis-ci.org/weiran/dead-or-alive-bot.svg?branch=master)](https://travis-ci.org/weiran/dead-or-alive-bot)

A Telegram bot that searches Wikipedia (via WikiData) for people and informs you if they're dead or alive. Inspired by [@roguehousewife](https://twitter.com/roguehousewife)'s inability to remember if any celebrity is dead or alive.

Thanks to [@JonShort](https://github.com/JonShort) for the logo.

Known as [@dead_or_alive_bot](http://t.me/dead_or_alive_bot) on Telegram.


## Usage

* Query via direct message
* When invited in a group: `/alive [query]` or `/dead [query]`


## Running & Debugging

You need to set your bot's token in one of the following ways:

1. Either add an `.env` file that sets your Telegram tokens:
```
BOT_TOKEN=1234567:AAGdsf08sg9897fsdD89fsD
BOT_TOKEN_DEV=1234567:AAGdsf08sg9897fsdD89fsD
```

2. Or set `BOT_TOKEN` and `BOT_TOKEN_DEV` as environment variables.

Then run `node index` to debug, or `micro-bot` to run in production.
