const { describe, it } = require('mocha');
const chai = require('chai');
const DeadOrAlive = require('./../DeadOrAlive');

const expect = chai.expect;

describe('parseWikipediaUrl', () => {
    it('should add Wikipedia base URL to all strings', () => {
        const output = DeadOrAlive._private.parseWikipediaUrl('Radiohead');
        expect(output).to.be.equal('https://en.wikipedia.org/wiki/Radiohead');
    });

    it('should escape spaces to underscores', () => {
        const output = DeadOrAlive._private.parseWikipediaUrl('Sean Connery');
        expect(output).to.be.equal('https://en.wikipedia.org/wiki/Sean_Connery');
    });

    it('should escape parenthesis', () => {
        const output = DeadOrAlive._private.parseWikipediaUrl('Test Article (disambiguation)');
        expect(output).to.be.equal('https://en.wikipedia.org/wiki/Test_Article_%28disambiguation%29');
    });
});
