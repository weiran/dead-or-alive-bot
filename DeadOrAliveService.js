const axios = require("axios");
const qs = require("qs");
const cheerio = require("cheerio");
const moment = require("moment");

axios.interceptors.request.use(request => {
    console.log('Starting Request', request);
    if (request.method === "post" && request.headers["Content-Type"] === "application/x-www-form-urlencoded") {
        request.data = qs.stringify(request.data);
    }
    return request;
})

class DeadOrAliveService {

    search(searchTerm) {
        const data = { "displayname": searchTerm };
        
        return axios.post("http://www.wa-wd.com/search.asp", data, {
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(response => {
            const html = cheerio.load(response.data);

            const name = html("td.L > a").first().text();
            if (!name) {
                return null;
            }

            const isDead = html("td.L:nth-child(4)").first().text() === "dead";
            let age = null;
            if (!isDead) {
                age = parseInt(html("td.R:nth-child(6)").first().text());
            } else {
                let ageText = html("td.R:nth-child(6)").first().text();
                ageText = ageText.substring(1, ageText.length - 1);
                age = parseInt(ageText);
            }
            
            const dateDiedText = html("td.R:nth-child(5)").first().text();
            const dateDied = moment(dateDiedText, "l").format("MMMM Do YYYY");

            return {
                name: name,
                isDead: isDead,
                age: age,
                dateDied: dateDied
            };
        })
        .catch(result => {
            console.log(result.response);
        });
    }

}

module.exports = DeadOrAliveService;