const ChromeWebScraper = require('./src/chrome-web-store-scraper')
const scraper = new ChromeWebScraper()

const fs = require('fs')

async function main () {
  // scraper.search('scraper',{scrollAttempts:200,locale:'da'}).then(
  //     (res) => console.log(res[0]),
  //     (err) => console.log(err)
  // );

  // scraper.scrapeApp('https://chrome.google.com/webstore/detail/vidiq-vision-for-youtube/pachckjkecffpdphbpmfolblodfkgbhl')
  // scraper.scrapeApp('https://chrome.google.com/webstore/detail/scraper-crawler-v3/kbhidgghgflkbalnkoeokcipocmigkfh')
  scraper.scrapeApp('https://chrome.google.com/webstore/detail/restlet-client-rest-api-t/aejoelaoggembcahagimdiliamlcdmfm')
  .then(
    (res) => {
        fs.writeFile(`${res.header.title.replace(' ', '_')}_scraping.json`,JSON.stringify(res,null,2),() => console.log('Output Saved')),
        console.log('Complete:', res.reviews, 'Number of reviews:', res.reviews.length)
      },
      (err) => console.log(err)
    )
}

main()
