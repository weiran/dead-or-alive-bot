import { WIKIDATA_ERROR } from 'lib/constants';
import { search } from 'lib/dead-or-alive';

export const parseTextFromCommand = (text, commandOffset) => {
    const commandEnd = commandOffset.offset + commandOffset.length;
    const command = text.substring(commandOffset.offset, commandEnd);
    const start = commandEnd + 1;
    return {
        command,
        text: text.substring(start, text.length)
    };
};

export const buildResponse = async (searchTerm) => {
    try {
        const result = await search(searchTerm);

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

        if (e.response && e.response.status === 403) {
            return 'Upstream request was blocked (403). If you run this bot, set a descriptive Wikimedia User-Agent.';
        }

        return e.message;
    }
};
