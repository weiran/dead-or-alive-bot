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
})

class DeadOrAliveService {

    async search(searchTerm) {
        let searchUrl = wiki.searchEntities({
            search: searchTerm,
            format: "json"
        });

        let searchResult = await axios.get(searchUrl);
        let entityId = searchResult.data.search[0].id;
        let entityUrl = wiki.getEntities(entityId);
        let entityResult = await axios.get(entityUrl);

        let isPerson = entityResult.data.entities[entityId].claims.P31[0].mainsnak.datavalue.value.id === "Q5";
        if (!isPerson) {
            return null;
        }

        let name = entityResult.data.entities[entityId].labels.en.value;
        let dateOfBirthString = entityResult.data.entities[entityId].claims.P569[0].mainsnak.datavalue.value.time;
        let dateOfBirth = moment(dateOfBirthString, "'+'YYYY-MM-DD'T'hh:mm:ss'Z'");
        let age = moment().diff(dateOfBirth, "years");
        let isDead = entityResult.data.entities[entityId].claims.P570 !== undefined;
        let dateOfDeath = null;
        if (isDead) {
            let dateOfDeathString = entityResult.data.entities[entityId].claims.P570[0].mainsnak.datavalue.value.time;
            dateOfDeath = moment(dateOfBirthString, "'+'YYYY-MM-DD'T'hh:mm:ss'Z'").format("MMMM Do YYYY");
        }

        return {
            name: name,
            isDead: isDead,
            age: age,
            dateOfDeath: dateOfDeath
        };
    }

}

module.exports = DeadOrAliveService;