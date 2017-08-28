const { describe, it } = require('mocha');
const chai = require('chai');
const BotRunner = require('./../BotRunner');

const expect = chai.expect;

describe('parseTextFromCommand', () => {
    it('should parse a command and search query with spaces', () => {
        const text = '/alive a test query';
        const commandOffset = {
            offset: 0,
            length: 6
        };
        const output = BotRunner._private.parseTextFromCommand(text, commandOffset);
        expect(output.command).to.be.equal('/alive');
        expect(output.text).to.be.equal('a test query');
    });

    it('should parse a command without a query', () => {
        const text = '/dead';
        const commandOffset = {
            offset: 0,
            length: 5
        };
        const output = BotRunner._private.parseTextFromCommand(text, commandOffset);
        expect(output.command).to.be.equal('/dead');
        expect(output.text).to.be.equal('');
    });
});