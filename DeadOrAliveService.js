const axios = require("axios");
const qs = require("qs");
const cheerio = require("cheerio");
const moment = require("moment");
const wiki = require("wikidata-sdk");

axios.interceptors.request.use(request => {
    if (request.method === "post" && request.headers["Content-Type"] === "application/x-www-form-urlencoded") {
        request.data = qs.stringify(request.data);
    }
    return request;
});

class DeadOrAliveService {

    async search(searchTerm) {
        let searchUrl = wiki.searchEntities({
            search: searchTerm,
            format: "json"
        });

        // get results for search term
        let searchResult = await axios.get(searchUrl);
        if (searchResult.data.search.length === 0) {
            return null;
        }
        let entityIds = searchResult.data.search.map(entity => {
            return entity.id;
        });
        
        // get person entity from search results
        let entities = await this.getEntities(entityIds);
        let personEntity = entities.find(entity => {
            let instanceOfValue = entity.claims.P31[0].mainsnak.datavalue.value.id;
            return instanceOfValue === "Q5";
        });
        if (!personEntity) {
            return null;
        }

        // get person info
        let name = personEntity.labels.en.value;
        let dateOfBirthString = personEntity.claims.P569[0].mainsnak.datavalue.value.time;
        let dateOfBirth = moment(dateOfBirthString, "'+'YYYY-MM-DD'T'hh:mm:ss'Z'");
        let age = moment().diff(dateOfBirth, "years");
        let isDead = personEntity.claims.P570 !== undefined;
        let dateOfDeath = null;
        if (isDead) {
            let dateOfDeathString = personEntity.claims.P570[0].mainsnak.datavalue.value.time;
            dateOfDeath = moment(dateOfDeathString, "'+'YYYY-MM-DD'T'hh:mm:ss'Z'").format("MMMM Do YYYY");
        }

        return {
            name: name,
            isDead: isDead,
            age: age,
            dateOfDeath: dateOfDeath
        };
    }
    
    async getEntities(entityIds) {
        return Promise.all(entityIds.map(async (entityId) => {
            let entityUrl = wiki.getEntities(entityId);
            return await axios.get(entityUrl)
            .then(entityResult => {
                return entityResult.data.entities[entityId];
            });
        }));
    }

}

module.exports = DeadOrAliveService;