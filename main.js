const ChromeWebScraper = require('./src/chrome-web-store-scraper');
const scraper = new ChromeWebScraper();


async function main() {
    const {err, res, body} = await scraper.search('scraper');
}

main()