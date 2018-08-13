const ChromeWebStoreScraper = require('../src/chrome-web-store-scraper');

var assert = require('assert');

describe('Scraper Constructor', function() {
    describe('#constructor()', function() {
        it('Scraper should have constructed correctly', function() {
            const scraper = new ChromeWebStoreScraper();
            assert.equal(scraper.constructed);
        });
    });
});