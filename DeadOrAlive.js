const axios = require('axios');
const qs = require('qs');
const moment = require('moment');
const wiki = require('wikidata-sdk');

const WikiDataDateFormat = "'+'YYYY-MM-DD'T'hh:mm:ss'Z'";

axios.interceptors.request.use((request) => {
    if (request.method === 'post' && request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        request.data = qs.stringify(request.data);
    }
    return request;
});

const parseWikipediaUrl = (title) => {
    const parsedTitle = title
        .replace(' ', '_')
        .replace('(', '%28')
        .replace(')', '%29');

    return `https://en.wikipedia.org/wiki/${parsedTitle}`;
};

const getEntities = async entityIds => Promise.all(entityIds.map(async (entityId) => {
    const entityUrl = wiki.getEntities(entityId);
    const result = await axios.get(entityUrl);
    return result.data.entities[entityId];
}));

const search = async (searchTerm) => {
    const searchUrl = wiki.searchEntities({
        search: searchTerm,
        format: 'json',
    });

    // get results for search term
    const searchResult = await axios.get(searchUrl);
    if (searchResult.data.search.length === 0) {
        return null;
    }
    const entityIds = searchResult.data.search.map(entity => entity.id)
        .slice(0, 5);

    // get person entity from search results
    const entities = await getEntities(entityIds);
    const personEntity = entities.find((entity) => {
        if (entity.claims.P31 === undefined) return null;
        const instanceOfValue = entity.claims.P31[0].mainsnak.datavalue.value.id;
        return instanceOfValue === 'Q5';
    });
    if (personEntity === undefined || personEntity.sitelinks.enwiki === undefined) {
        return null;
    }

    // get person info
    const name = personEntity.labels.en.value;
    const dateOfBirthString = personEntity.claims.P569[0].mainsnak.datavalue.value.time;
    const dateOfBirth = moment(dateOfBirthString, WikiDataDateFormat);
    const isDead = personEntity.claims.P570 !== undefined;
    const wikipediaUrl = parseWikipediaUrl(personEntity.sitelinks.enwiki.title);

    let age = null;
    let dateOfDeathFormatted = null;
    if (isDead) {
        const dateOfDeathString = personEntity.claims.P570[0].mainsnak.datavalue.value.time;
        const dateOfDeath = moment(dateOfDeathString, WikiDataDateFormat);

        age = dateOfDeath.diff(dateOfBirth, 'years');
        dateOfDeathFormatted = dateOfDeath.format('MMMM Do YYYY');
    } else {
        age = moment().diff(dateOfBirth, 'years');
    }

    return {
        name,
        age,
        isDead,
        dateOfDeath: dateOfDeathFormatted,
        wikipediaUrl,
    };
};

module.exports = {
    search,
    _private: {
        parseWikipediaUrl,
        getEntities,
    },
};
