const axios = require('axios');
const qs = require('qs');
const moment = require('moment');
const wiki = require('wikidata-sdk');

const overrides = require('./Overrides');

const WikiDataDateFormat = "'+'YYYY-MM-DD'T'hh:mm:ss'Z'";
const DefaultDateFormat = 'MMMM Do YYYY';

axios.interceptors.request.use((request) => {
    if (request.method === 'post' && request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        request.data = qs.stringify(request.data);
    }
    return request;
});

const parseWikipediaUrl = (title) => {
    const parsedTitle = title
        .replace(/ /g, '_')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');

    return `https://en.wikipedia.org/wiki/${parsedTitle}`;
};

const getEntityIds = async (searchTerm) => {
    const url = wiki.searchEntities({
        search: searchTerm,
        format: 'json',
    });
    const searchResult = await axios.get(url);
    if (searchResult.data.search.length === 0) {
        throw new Error('not-found');
    }
    return searchResult.data.search.map(entity => entity.id).slice(0, 5);
};

const getEntity = async (entityId) => {
    const entityUrl = wiki.getEntities(entityId);
    const result = await axios.get(entityUrl);
    return result.data.entities[entityId];
};

const getEntities = entityIds => Promise.all(entityIds.map(entityId => getEntity(entityId)));

const getFirstHumanEntity = (entities) => {
    const personEntity = entities.find((entity) => {
        if (entity.claims.P31 === undefined) return null;
        const instanceOfValue = entity.claims.P31[0].mainsnak.datavalue.value.id;
        return instanceOfValue === 'Q5';
    });
    if (personEntity === undefined || personEntity.sitelinks.enwiki === undefined) {
        throw new Error('not-found');
    }
    return personEntity;
};

const getWikipediaModel = (personEntity) => {
    const {
        P569: birthData,
        P570: deathData
    } = personEntity.claims;

    const name = personEntity.labels.en.value;
    const wikipediaUrl = parseWikipediaUrl(personEntity.sitelinks.enwiki.title);
    const hasDOB = birthData !== undefined;
    const isDead = deathData !== undefined;

    let dateOfBirth = null;
    if (hasDOB) {
        const dateOfBirthString = birthData[0].mainsnak.datavalue.value.time;
        dateOfBirth = moment(dateOfBirthString, WikiDataDateFormat).toDate();
    }

    let dateOfDeath = null;
    if (isDead) {
        const dateOfDeathString = deathData[0].mainsnak.datavalue.value.time;
        dateOfDeath = moment(dateOfDeathString, WikiDataDateFormat).toDate();
    }

    return {
        name,
        dateOfBirth,
        dateOfDeath,
        wikipediaUrl
    };
};

const getResultModel = (wikipediaModel) => {
    const hasDOB = wikipediaModel.dateOfBirth !== undefined;
    const isDead = wikipediaModel.dateOfDeath !== undefined;
    let age;
    let dateOfDeathFormatted;

    if (hasDOB) {
        const dateOfBirth = moment(wikipediaModel.dateOfBirth);
        age = moment().diff(dateOfBirth, 'years');
    }

    if (isDead) {
        const dateOfDeath = moment(wikipediaModel.dateOfDeath);
        const dateOfBirth = moment(wikipediaModel.dateOfBirth);
        age = dateOfDeath.diff(dateOfBirth, 'years');
        dateOfDeathFormatted = dateOfDeath.format(DefaultDateFormat);
    }

    return {
        name: wikipediaModel.name,
        age,
        hasDOB,
        isDead,
        dateOfDeath: dateOfDeathFormatted,
        wikipediaUrl: wikipediaModel.wikipediaUrl
    };
};

const search = async (searchTerm) => {
    // search for override terms first
    const overrideModel =
        overrides.find(override => searchTerm.toLowerCase() === override.overrideSearchTerm);
    if (overrideModel) return getResultModel(overrideModel);

    const entityIds = await getEntityIds(searchTerm);
    const entities = await getEntities(entityIds);
    const personEntity = getFirstHumanEntity(entities);
    const wikipediaModel = getWikipediaModel(personEntity);
    return getResultModel(wikipediaModel);
};

module.exports = {
    search,
    _private: {
        parseWikipediaUrl,
        getEntities,
        getEntity,
        getEntityIds,
        getFirstHumanEntity,
        getWikipediaModel,
        getResultModel
    },
};
