const util = require('util');
const Promise = require('bluebird').Promise;
const request = Promise.promisify(require('request'), { multiArgs: true });
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

        let {err, res, body} = await request(searchURL);

        if(res.responseCode === undefined || res.responseCode != 200) {
            console.log(res.responseCode);
            //throw new Error(`Response code Not Equal 200. Problem requesting search results. Response Code: ${res.responseCode}`);
        }

        return {err, res, body}
    }
}

module.exports = ChromeWebStoreScraper;