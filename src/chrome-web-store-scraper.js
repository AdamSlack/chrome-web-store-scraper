const util = require('util');

const Promise = require('bluebird').Promise;

const request = Promise.promisify(require('request'), { multiArgs: true });
Promise.promisifyAll(request);

const cheerio = require('cheerio');

const {Builder, By, Key, until} = require('selenium-webdriver');

const WAIT_THRESHOLD = 100;
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

    async parseSearchBody(driver) {

        let searchResults = [];
        let timer = 0
        while(searchResults.length == 0){
            searchResults = await Promise.all(driver.findElements(By.css(".a-d-na.a-d.webstore-test-wall-tile.a-d-zc.Xd.dd")));
            timer = timer + 1;
            if(timer > WAIT_THRESHOLD) {
                throw new Error('Unable to find search body.');
            }
        }

        const textHeadings = ['title', 'author', 'description','buttonText','category','numberOfRatings'];
        const searchResultsJSON = [];
        for(const res of searchResults) {
            console.log(await res);
            const html = res.getAttribute('outerHTML');
            const text = res.getText().split('\n')
            const resJSON = {}
            for(let i=0;i<textHeadings.length;i++){
                resJSON[textHeadings[i]] = text[i];
            }

            delete resJSON['buttonText'];
            resJSON['numberOfRatings'] = resJSON['numberOfRatings'].replace(/[\(\)]/g, '');

            searchResults.push(resJSON);
        }
        return searchResultsJSON;
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

        let searchResults = [];

        console.log('Building Selenium Driver')
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            await driver.get(searchURL);
            searchResults = await this.parseSearchBody(driver);
        } finally {
            await driver.quit();
        }

        return searchResults;
    }
}

module.exports = ChromeWebStoreScraper;