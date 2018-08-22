const util = require('util');

const Promise = require('bluebird').Promise;

const request = Promise.promisify(require('request'), { multiArgs: true });
Promise.promisifyAll(request);

const cheerio = require('cheerio');

const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');

const WAIT_THRESHOLD = 100;
class ChromeWebStoreScraper {

    constructor() {
        this.searchCategories = require('../data/search_categories.json');
        this.searchFeatures = require('../data/search_features.json');
    }

    async scrapeApp(appURL) {
        let driver = await this.createChromeDriver();
        let details = {}
        try {
            await driver.get(appURL);
            details = await this.scrapeDetails(driver);
        }
        catch(err){
            console.log('building failed', err)
        }
        finally {
            await driver.quit();
            return details;
        }

    }

    async scrapeDetails(driver) {
        const header = await this.scrapeAppHeader(driver);
        const overview = await this.scrapeOverview(driver);
        const reviews = await this.scrapeReviews(driver);
        return {
            header: header,
            overview : overview,
            reviews : reviews
        }
    }

    async scrapeReviews(driver) {
        // gonna need to go through each page and perform this...
        var reviewData = [];
        var timer = 0
        while(reviewData.length == 0){
            reviewData = await Promise.all(driver.findElements(By.css('.h-ba-Eb ba-Eb pd-Ye-Qa')));
            timer = timer + 1;
            if(timer > WAIT_THRESHOLD) {
                throw new Error('Unable to find header.');
            }
        }

        let res = await reviewData[0];
        let html = ''
        let overview = {};

        if(typeof res.getAttribute === 'function'){
            html = await res.getAttribute('outerHTML');
            overview = this.parseAppReviewsHTML(html);
        }
        return overview;
    }

    async scrapeOverview(driver) {
        var overviewData = [];
        var timer = 0
        while(overviewData.length == 0){
            overviewData = await Promise.all(driver.findElements(By.css(".h-e-f-b-Qe")));
            timer = timer + 1;
            if(timer > WAIT_THRESHOLD) {
                throw new Error('Unable to find header.');
            }
        }

        let res = await overviewData[0];
        let html = ''
        let overview = {};

        if(typeof res.getAttribute === 'function'){
            html = await res.getAttribute('outerHTML');
            overview = this.parseAppOverviewHTML(html);
        }
        return overview;

    }

    parseAppOverviewHTML(html) {
        const $ = cheerio.load(html);
        const summary = $('.C-b-p-j-Pb').first().text();
        const description = $('.C-b-p-j-Oa').first().text();
        const version = $('.C-b-p-D-Xe.h-C-b-p-D-md').first().text()
        const lastUpdatedDate = $('.C-b-p-D-Xe.h-C-b-p-D-xh-hh').first().text()
        const size = $('.C-b-p-D-Xe.h-C-b-p-D-za').first().text()
        const language = $('.C-b-p-D-Xe.h-C-b-p-D-Ba').first().text()
        const screenshotURLs = $('.h-A-Ce-ze-Yf.A-Ce-ze-Yf').map(function(){
            return $(this).attr('src');
        }).get()

        // Additional Info Not Guaranteed... need a strategy.
        //const developerEmail = $('.C-b-p-rc-D-R').first().text().replace('mailto:','');
        //const privacyPolicyURL = $('.C-b-p-rc-D-R').first().text()

        const additionalInfo = $('.C-b-p-rc-D-R').map( function() {
            return {
                text : $(this).text(),
                href : $(this).attr('href')
            }
        }).get();
        return {
            summary : summary ? summary : '',
            description : description ? description : '',
            version : version ? version : '',
            lastUpdatedDate : lastUpdatedDate ? lastUpdatedDate : '',
            size : size ? size : '',
            language : language ? (language.includes('See all') ? 'multiple' : language) : '',
            screenshotURLs : screenshotURLs ? screenshotURLs : [],
            additionalInfo : additionalInfo ? additionalInfo : []
        }
    }

    async scrapeAppHeader(driver) {
        var headerData = [];
        var timer = 0
        while(headerData.length == 0){
            headerData = await Promise.all(driver.findElements(By.css(".e-f-o")));
            timer = timer + 1;
            if(timer > WAIT_THRESHOLD) {
                throw new Error('Unable to find header.');
            }
        }

        let res = await headerData[0];
        let html = ''
        let header = {};

        if(typeof res.getAttribute === 'function'){
            html = await res.getAttribute('outerHTML');
            header = this.parseAppHeaderHTML(html);
        }
        return header
    }

    parseAppHeaderHTML(html) {
        const $ = cheerio.load(html);
        const imgURL = $('img').first().attr('src');
        const title = $('.e-f-w').first().text();
        const offeredBy = $('.e-f-Me').first().text();
        const rating = $('.rsw-stars').first().attr('g:rating_override');
        const userCount = $('.e-f-ih').first().text().replace(' users', '').replace(' user', '');
        const ratingCount = parseInt($('.q-N-nd').first().text().replace(/[\(\)]/g, ''));

        return {
            title : title,
            offeredBy : offeredBy,
            userCount : userCount,
            rating : rating,
            ratingCount : ratingCount,
            imgURL : imgURL
        }
    }


    async parseSearchBody(driver) {

        var searchResults = [];
        var timer = 0

        while(searchResults.length == 0){
            searchResults = await Promise.all(driver.findElements(By.css(".a-d-na.a-d.webstore-test-wall-tile.a-d-zc.Xd.dd")));
            timer = timer + 1;
            if(timer > WAIT_THRESHOLD) {
                throw new Error('Unable to find search body.');
            }
        }

        const textHeadings = ['title', 'author', 'description','buttonText','category','numberOfRatings'];
        const searchResultsJSON = [];
        console.log(`${searchResults.length} Found. Extracting Text and HTML`);
        for(const result of searchResults) {
            const res = await result ;
            if(typeof res.getAttribute !== 'function'){
                console.log('No getAttribute Method Found a Search Result.');

                break;
            }
            if(typeof res.getText !== 'function') {
                console.log('No getText Method Found on a Search Result.');
                break;
            }
            const html = await res.getAttribute('outerHTML');
            const text = (await res.getText()).split('\n');

            const resJSON = {};
            for(let i=0;i<textHeadings.length;i++){
                resJSON[textHeadings[i]] = text[i];
            }

            delete resJSON['buttonText'];
            resJSON['numberOfRatings'] = parseInt(resJSON['numberOfRatings'].replace(/[\(\)]/g, ''));

            let $ = cheerio.load(html);

            const storeURL = $('.h-Ja-d-Ac.a-u').first().attr('href');
            resJSON['storeURL'] = storeURL;

            const averageRating = $('.rsw-stars').first().attr('g:rating_override');
            resJSON['rating'] = parseFloat(averageRating);


            searchResultsJSON.push(resJSON);
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

        let driver = await this.createChromeDriver();
        try {
            await driver.get(searchURL);
            searchResults = await this.parseSearchBody(driver);
        } finally {
            await driver.quit();
        }

        return searchResults;
    }

    async createChromeDriver() {

        const chromeOptions = {
            args: ['--headless', '--disable-gpu', '--no-sandbox']
        }
        const chromeCapabilities = Capabilities.chrome();
        chromeCapabilities.set('chromeOptions', chromeOptions);

        console.log('Building Selenium Driver')
        return new Builder()
        .forBrowser('chrome')
        .withCapabilities(chromeCapabilities)
        .build();
    }
}

module.exports = ChromeWebStoreScraper;