const util = require('util');
const Promise = require('bluebird').Promise;
const request = Promise.promisify(require('request'), { multiArgs: true });
const cheerio = require('cheerio');

class ChromeWebStoreScraper {

    constructor() {
        this.searchCategories = this.initSearchCategories();
        this.searchFeatures = this.initSearchFeatures();
    }

    initSearchFeatures() {
        return {
            offline : '_feature=offline',
            byGogle : '_feature=google',
            free : '_feature=free',
            android : '_feature=android',
            googleDribe : '_feature=drive'
        }
    }

    initSearchCategories() {
        return {
            all : 'extensions',
            accessibility : 'ext/22-accessibility',
            blogging : 'ext/10-blogging',
            byGoogle : 'ext/15-by-google',
            developerTools : 'ext/11-web-development',
            fun : 'ext/14-fun',
            newsAndWeather : 'ext/6-news',
            news : 'ext/6-news',
            weather : 'ext/6-news',
            photos : 'ext/28-photos',
            productivity : 'ext/7-productivity',
            searchTools : 'ext/38-search-tools',
            shopping : 'ext/12-shopping',
            socialAndCommunication : '1-communication',
            social : '1-communication',
            communication : '1-communication',
            sports : ''
        }
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

    async search(
        searchString=undefined,
        options={
        searchCategory : 'all',
        searchFilters : []

    }) {

        if(!searchString) {
            throw 'Search String Parameter not defined.';
        }
        if(seachString)
        const baseURL = 'https://chrome.google.com/webstore/search/'
        let searchURL = `${baseURL}/${options.searchString}?${this.searchCategories[options.searchCategory]}`;

        if(this.searchFeatures.length > 0) {
            searchURL = `${searchURL}&${this.searchFeatures.map((f) => this.searchFeatures).join('&')}`
        }
        console.log(this.searchURL);
        //let {err, res, body} = await request(searchURL);
        //console.log(res.response)
    }
}

module.exports = ChromeWebStoreScraper;