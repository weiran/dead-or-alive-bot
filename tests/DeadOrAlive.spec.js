const { describe, it } = require('mocha');
const chai = require('chai');
const moxios = require('moxios');
const fs = require('fs-extra');
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

describe('getEntity', () => {
    before(async () => {
        const file = await fs.readFile('./tests/entityResponse.json');
        entityResponse = JSON.parse(file);
    });

    let entityResponse = null;
    beforeEach(() => moxios.install(DeadOrAlive.axios));
    afterEach(() => moxios.uninstall(DeadOrAlive.axios));

    it('should make 1 network request', (done) => {
        const output = DeadOrAlive._private.getEntity("Q1");
        moxios.wait(async () => {
            expect(moxios.requests.count()).to.be.equal(1);
            done();
        });
    });

    it('should return the correct entity', (done) => {
        const output = DeadOrAlive._private.getEntity("Q1");
        moxios.wait(async () => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({ 
                status: 200,
                response: entityResponse
            });
        });
        output.then(entity => {
            expect(entity).to.be.a('object');
            expect(entity.claims).to.have.property("P31");
            done();
        });
    });
});

describe('getEntities', () => {
    before(async () => {
        const file = await fs.readFile('./tests/entityResponse.json');
        entityResponse = JSON.parse(file);
    });

    let entityResponse = null;
    beforeEach(() => moxios.install(DeadOrAlive.axios));
    afterEach(() => moxios.uninstall(DeadOrAlive.axios));

    it('should make 4 network requests', (done) => {
        const output = DeadOrAlive._private.getEntities(['Q1', 'Q2', 'Q3', 'Q4']);
        moxios.wait(async () => {
            expect(moxios.requests.count()).to.be.equal(4);
            done();
        });
    });

    it('should return an array after resolving', (done) => {
        const output = DeadOrAlive._private.getEntities(['Q1']);
        moxios.wait(async () => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({ 
                status: 200,
                response: entityResponse
            });
        });
        output.then(entities => {
            expect(entities).to.be.an('array');
            done();
        });
    });
});

describe('getEntityIds', () => {
    before(async () => {
        const file = await fs.readFile('./tests/entitiesResponse.json');
        entitiesResponse = JSON.parse(file);
    });

    let entitiesResponse;

    beforeEach(() => moxios.install(DeadOrAlive.axios));
    afterEach(() => moxios.uninstall(DeadOrAlive.axios));

    it('should make a network request', (done) => {
        const output = DeadOrAlive._private.getEntityIds("search term");
        moxios.wait(async () => {
            expect(moxios.requests.count()).to.be.equal(1);
            done();
        });
    });

    it('should return an array of entity IDs', (done) => {
        let output = DeadOrAlive._private.getEntityIds("search term");
        moxios.wait(async () => {
            const request = moxios.requests.mostRecent();
            await request.respondWith({ 
                status: 200,
                response: entitiesResponse
            });
        });
        output.then(entityIds => {
            expect(entityIds.length).to.be.equal(5);
            expect(entityIds[0]).to.be.equal("Q1");
            expect(entityIds[1]).to.be.equal("Q2");
            expect(entityIds[2]).to.be.equal("Q3");
            expect(entityIds[3]).to.be.equal("Q4");
            expect(entityIds[4]).to.be.equal("Q6");
            done();
        });
    });

describe('getFirstHumanEntity', () => {
    before(async () => {
        const file = await fs.readFile('./tests/getHumanEntitiesInput.json');
        getHumanEntitiesInput = JSON.parse(file);
    });

    let getHumanEntitiesInput;
    
    it('should return person entity if it exists', (done) => {
        const output = DeadOrAlive._private.getFirstHumanEntity(getHumanEntitiesInput.entities);
        expect(output === getHumanEntitiesInput.entities[0]);
        done();
    });

    it('should throw error if person entity not found', (done) => {
        const entitiesWithoutHuman = getHumanEntitiesInput.entities.splice(1, getHumanEntitiesInput.entities - 1);
        expect(() => 
            DeadOrAlive._private.getFirstHumanEntity(entitiesWithoutHuman)
        ).to.throw();
        done();
    });

    it('should throw error if person entity doesn\'t have an English Wikipedia link', (done) => {
        const entitiesHumanWithoutWikipediaLink = getHumanEntitiesInput.entities;
        delete entitiesHumanWithoutWikipediaLink[0].sitelinks.enwiki;
        expect(() => 
            DeadOrAlive._private.getFirstHumanEntity(entitiesHumanWithoutWikipediaLink)
        ).to.throw();
        done();
    });
});

describe('getWikipediaModel', () => {
});

describe('getResultModel', () => {

});
});