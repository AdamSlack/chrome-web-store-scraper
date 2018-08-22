const ChromeWebScraper = require('./src/chrome-web-store-scraper');
const scraper = new ChromeWebScraper();

const fs = require('fs');

async function main() {
    // scraper.search('scraper').then(
    //     (results) => console.log,
    //     (err) => console.log
    // );
    //scraper.scrapeApp('https://chrome.google.com/webstore/detail/vidiq-vision-for-youtube/pachckjkecffpdphbpmfolblodfkgbhl')
    scraper.scrapeApp('https://chrome.google.com/webstore/detail/scraper-crawler-v3/kbhidgghgflkbalnkoeokcipocmigkfh')
    .then(
        (res) => console.log(res),
        (err) => console.log(err)
    )
}

main()