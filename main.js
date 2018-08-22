const ChromeWebScraper = require('./src/chrome-web-store-scraper');
const scraper = new ChromeWebScraper();

const fs = require('fs');

async function main() {
    scraper.search('scraper').then(
        (results) => console.log,
        (err) => console.log
    );
}

main()