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

describe('getEntities', () => {
    it('should return an Array of Promises', async () => {
        DeadOrAlive.axios = {};
        let output = await DeadOrAlive._private.getEntities(['Q1', 'Q2', 'Q3', 'Q4']);
        expect(output).to.be.a('Array');
        expect(output[0]).to.be.a('Object');
        expect(output[1]).to.be.a('Object');
        expect(output[2]).to.be.a('Object');
        expect(output[3]).to.be.a('Object');
    });
});
