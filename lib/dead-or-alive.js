import { fetch } from 'sdk';
import { WIKIDATA_ERROR } from 'lib/constants';
import { overrides } from 'lib/overrides';

const WIKIMEDIA_USER_AGENT = 'dead-or-alive-bot/1.1.0 (+https://github.com/weiran/dead-or-alive-bot)';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';

const requestHeaders = {
    'User-Agent': WIKIMEDIA_USER_AGENT,
    'Api-User-Agent': WIKIMEDIA_USER_AGENT,
};

const wikidataUrl = (params) => `${WIKIDATA_API}?${new URLSearchParams(params).toString()}`;

const parseWikipediaUrl = (title) => {
    const parsedTitle = title
        .replace(/ /g, '_')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');

    return `https://en.wikipedia.org/wiki/${parsedTitle}`;
};

const fetchJson = async (url) => {
    const result = await fetch(url, { headers: requestHeaders });
    if (!result.ok) {
        const error = new Error(result.statusText);
        error.response = { status: result.status };
        throw error;
    }
    return result.json();
};

const getEntityIds = async (searchTerm) => {
    const searchResult = await fetchJson(wikidataUrl({
        action: 'wbsearchentities',
        search: searchTerm,
        language: 'en',
        limit: '20',
        continue: '0',
        format: 'json',
        uselang: 'en',
        type: 'item',
    }));

    if (searchResult.error) {
        throw new Error(WIKIDATA_ERROR);
    }

    if (!searchResult.search || searchResult.search.length === 0) {
        throw new Error('not-found');
    }
    return searchResult.search.map((entity) => entity.id).slice(0, 5);
};

const getEntity = async (entityId) => {
    const result = await fetchJson(wikidataUrl({
        action: 'wbgetentities',
        ids: entityId,
        format: 'json',
    }));

    return result.entities[entityId];
};

const getEntities = (entityIds) => Promise.all(entityIds.map((entityId) => getEntity(entityId)));

const getFirstHumanEntity = (entities) => {
    const personEntity = entities.find((entity) => {
        if (!entity.claims.P31) return null;
        const instanceOfValue = entity.claims.P31[0].mainsnak.datavalue.value.id;
        return instanceOfValue === 'Q5';
    });
    if (!personEntity || !personEntity.sitelinks.enwiki) {
        throw new Error('not-found');
    }
    return personEntity;
};

const parseWikidataDate = (value) => {
    const match = value.match(/^([+-]\d+)-(\d{2})-(\d{2})T/);
    if (!match) return null;

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(Date.UTC(year, monthIndex, day));
};

const getPersonModel = (personEntity) => {
    const {
        P569: birthData,
        P570: deathData
    } = personEntity.claims;

    const name = personEntity.labels.en.value;
    const url = parseWikipediaUrl(personEntity.sitelinks.enwiki.title);
    const hasDOB = birthData !== undefined;
    const isDead = deathData !== undefined;

    let dateOfBirth = null;
    if (hasDOB) {
        const dateOfBirthString = birthData[0].mainsnak.datavalue.value.time;
        dateOfBirth = parseWikidataDate(dateOfBirthString);
    }

    let dateOfDeath = null;
    if (isDead) {
        const dateOfDeathString = deathData[0].mainsnak.datavalue.value.time;
        dateOfDeath = parseWikidataDate(dateOfDeathString);
    }

    return {
        name,
        dateOfBirth,
        dateOfDeath,
        url
    };
};

const ageOnDate = (birthDate, endDate) => {
    let age = endDate.getUTCFullYear() - birthDate.getUTCFullYear();
    const birthdayThisYear = Date.UTC(
        endDate.getUTCFullYear(),
        birthDate.getUTCMonth(),
        birthDate.getUTCDate()
    );
    if (endDate.getTime() < birthdayThisYear) age -= 1;
    return age;
};

const ordinal = (day) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
    case 1:
        return `${day}st`;
    case 2:
        return `${day}nd`;
    case 3:
        return `${day}rd`;
    default:
        return `${day}th`;
    }
};

const formatDate = (date) => {
    const month = new Intl.DateTimeFormat('en', {
        month: 'long',
        timeZone: 'UTC',
    }).format(date);
    return `${month} ${ordinal(date.getUTCDate())} ${date.getUTCFullYear()}`;
};

const getResultModel = (personModel) => {
    const hasDOB = personModel.dateOfBirth !== null;
    const isDead = personModel.dateOfDeath !== null;
    const { customMessage } = personModel;
    let age;
    let dateOfDeath = null;

    if (hasDOB) {
        const endDate = isDead ? personModel.dateOfDeath : new Date();
        age = ageOnDate(personModel.dateOfBirth, endDate);
        if (isDead) {
            dateOfDeath = formatDate(personModel.dateOfDeath);
        }
    }

    return {
        name: personModel.name,
        age,
        hasDOB,
        isDead,
        dateOfDeath,
        url: personModel.url,
        customMessage,
    };
};

const matchSearchToOverride = (arrayOrString, searchTerm) => {
    if (typeof arrayOrString !== 'object') {
        return arrayOrString === searchTerm;
    }

    return arrayOrString.find((x) => x === searchTerm);
};

export const search = async (searchTerm) => {
    const overrideModel = overrides.find(
        (override) => matchSearchToOverride(override.overrideSearchTerm, searchTerm.toLowerCase())
    );

    if (overrideModel) return getResultModel(overrideModel);

    const entityIds = await getEntityIds(searchTerm);
    const entities = await getEntities(entityIds);
    const personEntity = getFirstHumanEntity(entities);
    const wikipediaModel = getPersonModel(personEntity);
    return getResultModel(wikipediaModel);
};
