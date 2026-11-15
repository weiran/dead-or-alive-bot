import { api } from 'sdk';
import { buildResponse, parseTextFromCommand } from 'lib/response';

const commandName = (command) => command.split('@')[0];

export default async function messageHandler(message) {
    if (!message.text) return;

    let searchTerm = message.text;

    if (message.entities && message.entities.length > 0) {
        const commandOffset = message.entities[0];
        if (commandOffset.type !== 'bot_command') return;

        const parsed = parseTextFromCommand(searchTerm, commandOffset);
        switch (commandName(parsed.command)) {
        case '/dead':
        case '/alive':
            searchTerm = parsed.text;
            break;
        default:
            return;
        }
    }

    console.log(`Querying '${searchTerm}'`);

    const response = await buildResponse(searchTerm);

    await api.sendMessage({
        chat_id: message.chat.id,
        text: response,
        parse_mode: 'Markdown',
    });
}
