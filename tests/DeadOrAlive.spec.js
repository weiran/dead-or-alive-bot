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
});

describe('getFirstHumanEntity', () => {
    before(async () => {
        const file = await fs.readFile('./tests/getHumanEntitiesInput.json');
        getHumanEntitiesInput = JSON.parse(file);
    });

    let getHumanEntitiesInput;
    
    it('should return person entity if it exists', () => {
        const output = DeadOrAlive._private.getFirstHumanEntity(getHumanEntitiesInput.entities);
        expect(output).to.be.equal(getHumanEntitiesInput.entities[0]);
    });

    it('should throw error if person entity not found', () => {
        const entitiesWithoutHuman = getHumanEntitiesInput.entities.splice(1, getHumanEntitiesInput.entities - 1);
        expect(() => DeadOrAlive._private.getFirstHumanEntity(entitiesWithoutHuman)).to.throw();
    });

    it('should throw error if person entity doesn\'t have an English Wikipedia link', () => {
        const entitiesHumanWithoutWikipediaLink = getHumanEntitiesInput.entities;
        delete entitiesHumanWithoutWikipediaLink[0].sitelinks.enwiki;
        expect(() => DeadOrAlive._private.getFirstHumanEntity(entitiesHumanWithoutWikipediaLink)).to.throw();
    });
});

describe('getWikipediaModel', () => {
    before(async () => {
        const file = await fs.readFile('./tests/getWikipediaModelInput.json');
        wikipediaModelInput = JSON.parse(file);
    });

    let wikipediaModelInput;

    it('should return wikipedia model given valid input', () => {
        const wikipediaModel = DeadOrAlive._private.getWikipediaModel(wikipediaModelInput);
        expect(wikipediaModel.name).to.be.equal('John Lennon');
        expect(wikipediaModel.dateOfBirth.getTime()).to.be.equal(new Date(Date.UTC(1975, 2, 17)).getTime());
        expect(wikipediaModel.dateOfDeath.getTime()).to.be.equal(new Date(Date.UTC(2009, 2, 13)).getTime());
        expect(wikipediaModel.wikipediaUrl).to.be.equal('https://en.wikipedia.org/wiki/John_Lennon');
    });

    it('should return wikipedia model with missing dates given partially valid input', () => {
        const wikipediaModelInputWithoutDates = wikipediaModelInput;
        delete wikipediaModelInputWithoutDates.claims.P569;
        delete wikipediaModelInputWithoutDates.claims.P570;

        const wikipediaModel = DeadOrAlive._private.getWikipediaModel(wikipediaModelInputWithoutDates);
        expect(wikipediaModel.name).to.be.equal('John Lennon');
        expect(wikipediaModel.dateOfBirth).to.be.equal(null);
        expect(wikipediaModel.dateOfDeath).to.be.equal(null);
        expect(wikipediaModel.wikipediaUrl).to.be.equal('https://en.wikipedia.org/wiki/John_Lennon');
    });
});

describe('getResultModel', () => {
    let resultModelInput = {
        name: 'John Lennon',
        dateOfBirth: new Date(Date.UTC(1975, 2, 17)),
        dateOfDeath: new Date(Date.UTC(2009, 2, 13)),
        wikipediaUrl: 'https://en.wikipedia.org/wiki/John_Lennon'
    };

    it('should return result model with correct age given birth and death dates exist', () => {
        const resultModel = DeadOrAlive._private.getResultModel(resultModelInput);
        expect(resultModel.age).to.be.equal(33);
        expect(resultModel.hasDOB).to.be.equal(true);
        expect(resultModel.isDead).to.be.equal(true);
        expect(resultModel.dateOfDeath).to.be.equal('March 13th 2009');
    })

    it('should return result model with correct age given birth date exist', () => {
        let resultModelInputWithoutDeath = Object.assign({}, resultModelInput);;
        resultModelInputWithoutDeath.dateOfDeath = null;
        const resultModel = DeadOrAlive._private.getResultModel(resultModelInputWithoutDeath);
        // TODO: inject a date for 'today' to calculate age statically
        expect(resultModel.age).to.be.equal(43);
        expect(resultModel.hasDOB).to.be.equal(true);
        expect(resultModel.isDead).to.be.equal(false);
        expect(resultModel.dateOfDeath).to.be.equal(null);
    })

    it('should return results model without age when date of birth is null', () => {
        let resultModelInputWithoutBirthDate = Object.assign({}, resultModelInput);
        resultModelInputWithoutBirthDate.dateOfBirth = null;
        const resultModel = DeadOrAlive._private.getResultModel(resultModelInputWithoutBirthDate);
        expect(resultModel.age).to.be.equal(undefined);
        expect(resultModel.hasDOB).to.be.equal(false);
        expect(resultModel.isDead).to.be.equal(true);
        expect(resultModel.dateOfDeath).to.be.equal(null);
    })

    it('should copy the right values into the result model', () => {
        const resultModel = DeadOrAlive._private.getResultModel(resultModelInput);
        expect(resultModel.name, 'John Lennon');
        expect(resultModel.wikipediaUrl, 'https://en.wikipedia.org/wiki/John_Lennon');
    })
});