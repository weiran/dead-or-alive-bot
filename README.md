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

## Creating your bot

To run or debug this bot, you'll need to create a bot of your own using [telegram's own bot, botfather](https://core.telegram.org/bots#3-how-do-i-create-a-bot).

This will provide you with a token which can be used to access the bot.

## Running & Debugging

You need to set your bot's token in one of the following ways:

1. Either add an `.env` file that sets your Telegram tokens:
```
BOT_TOKEN_DEV=1234567:AAGdsf08sg9897fsdD89fsD
```

2. Or set `BOT_TOKEN_DEV` as environment variables.

Then run either:
- `npm run debug` - debug the bot locally.
- `npm run start` - run the bot in production.
> note - production requires the `NOW_URL` env var to be configured

## FAQ

<details>
    <summary>
        I'm receiving 401 responses when debugging!
    </summary>
    
    Sometimes the token provided by the botfather is incorrect, even when first creating the bot.

    If you're getting 401 responses, usually this is fixed by trashing the old token and using the fresh one generated.

    > note - bot tokens can be managed by running the command `/mybots` within botfather.
</details>


<details>
    <summary>
        I want to deploy to now
    </summary>
    
    Deploy with your bot token as an environment variable:
    now -e BOT_TOKEN='1234567:AAGdsf08sg9897fsdD89fsD'
</details>

---
<p align="center">
  <b>By Weiran Zhang</b><br>
  <a href="https://weiran.co">Website</a> |
  <a href="https://twitter.com/weiran">Twitter</a> |
  <a href="https://github.com/weiran">GitHub</a>
</p>
