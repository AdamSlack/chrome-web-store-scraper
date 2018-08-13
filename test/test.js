const ChromeWebStoreScraper = require('../src/chrome-web-store-scraper');

var assert = require('assert');

describe('Scraper', function() {

    describe('#constructor()', function() {
        it('Scraper should have constructed correctly with searchCategories and searchFeatures defined', function() {
            const scraper = new ChromeWebStoreScraper();
            assert.notEqual(scraper.searchCategories, undefined);
            assert.notEqual(scraper.searchFeatures, undefined);
        });
    });

    describe('#search()', function() {
        it('Should reject if no search string was provided.', function() {
            const scraper = new ChromeWebStoreScraper();
            assert.rejects(scraper.search(undefined))
        })

        it('should reject if invalid search filter is provided', function() {
            const scraper = new ChromeWebStoreScraper();
            assert.rejects(scraper.search('searchString', {searchFilters : ['notARealFilter']}))
        })

        it('should reject if search filter not passed as array', function() {
            const scraper = new ChromeWebStoreScraper();
            assert.rejects(() => scraper.search('searchString', {searchFilters : 'notAnArray'}))
        });

        it('should reject if invalid search category is provided', function () {
            const scraper = new ChromeWebStoreScraper();
            assert.rejects(() => scraper.search('searchString', {searchCategory : 'notARealFilter'}))
        })
    })
});