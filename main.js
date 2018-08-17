const ChromeWebScraper = require('./src/chrome-web-store-scraper');
const scraper = new ChromeWebScraper();

const fs = require('fs');

async function main() {
    const searchResults = await scraper.search('scraper');
    console.log(searchResults);

}

main()