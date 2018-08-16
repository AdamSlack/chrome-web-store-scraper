const util = require('util');

const Promise = require('bluebird').Promise;

const request = Promise.promisify(require('request'), { multiArgs: true });
Promise.promisifyAll(request);

const cheerio = require('cheerio');

class ChromeWebStoreScraper {

    constructor() {
        this.searchCategories = require('../data/search_categories.json');
        this.searchFeatures = require('../data/search_features.json');
    }

    async scrapeApp() {

    }

    async scrapeOverview() {

    }

    async scrapeReviews() {

    }

    async scrapeSupport() {

    }

    async scrapeRelated() {

    }

    parseSearchBody(body) {
        let $ = cheerio.load(body);
        let searchResBody = $('Je-qe-zd-Ge.hg.S-Zb-fd').first().text();
        //let searchResBody = $('.a-d-na.a-d.webstore-test-wall-tile.a-d-zc.Xd.dd').first().text();
        console.log(searchResBody);
    }

    buildSearchURLString( searchString, options={searchCategory : undefined, searchFeatures: undefined}) {
        const searchCategory = options.searchCategory !== undefined ? options.searchCategory :  'all'
        const searchFeatures = options.searchFeatures !== undefined ? options.searchFeatures :  []

        // Form Search URL
        const baseURL = 'https://chrome.google.com/webstore/search'
        let searchURL = `${baseURL}/${searchString}?_category=${this.searchCategories[searchCategory]}`;

        if(searchFeatures.length > 0) {
            searchURL = `${searchURL}&${searchFeatures.map((f) => this.searchFeatures[f]).join('&')}`
        }

        return encodeURI(searchURL);
    }

    async search(searchString, options={searchCategory : undefined, searchFeatures: undefined}) {
        const searchCategory = options.searchCategory !== undefined ? options.searchCategory :  'all'
        const searchFeatures = options.searchFeatures !== undefined ? options.searchFeatures :  []

        // Check options are valid.
        if(searchFeatures.constructor !== Array) {
            throw new Error('Search Filter Must Be Provided as an Array')
        }

        if(searchFeatures.some((f) => !this.searchFeatures[f])) {
            throw new Error('Invalid Search Filter Provided.')
        }

        if(!this.searchCategories[searchCategory]) {
            throw new Error('Invalid Search Category Provided.')
        }

        // build the encoded search URL.
        const searchURL = this.buildSearchURLString(searchString, {searchCategory:searchCategory, searchFeatures:searchFeatures});
        console.log(searchURL);
        const resOptions = {
            headers: {
                'User-Agent': 'https://github.com/pandawing/node-chrome-web-store-item-property',
                'content-type' : 'application/x-www-form-urlencoded'
            },
            qs: {
                hl: 'en',
                gl: 'US'
            }
        }

        const res = await request(searchURL,{headers:{}});

        const statusCode = res[0].statusCode
        const body = res[0].body;

        const fs = require('fs');
        fs.writeFileSync('body.html', body);

        if(!statusCode || statusCode != 200) {
            throw new Error(`Response code Not Equal 200. Problem requesting search results. Response Code: ${statusCode}`);
        }

        const searchResults = this.parseSearchBody(body);

        return searchResults;
    }
}

module.exports = ChromeWebStoreScraper;