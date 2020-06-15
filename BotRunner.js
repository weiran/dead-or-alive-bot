const { WIKIDATA_ERROR } = require('./constants');
const DeadOrAlive = require('./DeadOrAlive');

const parseTextFromCommand = (text, commandOffset) => {
    const command = text.substring(commandOffset.offset, commandOffset.length);
    const start = commandOffset.offset + commandOffset.length + 1;
    return {
        command,
        text: text.substring(start, text.length)
    };
};

const buildResponse = (searchTerm) => async () => {
    try {
        const result = await DeadOrAlive.search(searchTerm);

        if (result.customMessage) {
            return result.customMessage;
        }

        if (result.isDead) {
            return `[${result.name}](${result.url}) died${result.hasDOB ? ` aged ${result.age}` : ''} on ${result.dateOfDeath}.`;
        }

        return `[${result.name}](${result.url}) is alive${result.hasDOB ? ` and kicking at ${result.age} years old` : ''}.`;
    } catch (e) {
        if (e.message === 'not-found') {
            return `Couldn't find a person named ${searchTerm}.`;
        }

        if (e.message === WIKIDATA_ERROR) {
            return "Oops! The bot seems to be having issues - please open an issue at https://github.com/weiran/dead-or-alive-bot/issues (include your search term) and I'll take a look 👀😁";
        }

        return e.message;
    }
};

const textReceived = async (context) => {
    const { message } = context;
    let searchTerm = message.text;

    // parse command and input text
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

    const response = await buildResponse(searchTerm);

    context.replyWithMarkdown(response);
};

module.exports = {
    textReceived,
    _private: {
        buildResponse,
        parseTextFromCommand
    }
};
