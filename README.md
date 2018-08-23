[![CircleCI](https://circleci.com/gh/AdamSlack/chrome-web-store-scraper.svg?style=shield)](https://circleci.com/gh/AdamSlack/chrome-web-store-scraper)
[![npm version](https://badge.fury.io/js/chrome-web-store-scraper.svg)](https://badge.fury.io/js/chrome-web-store-scraper)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)

# chrome-web-store-scraper
A node js package for scraping the chrome web store.

# Requirements

This project requires selenium, a Web Browser Automation tool. The version of selenium can be downloaded from [seleniumhq](https://www.seleniumhq.org/P).

Selenium must also be installed and `selenium` must be on the system PATH. For linux, a `selenium` bash script is included that can be paired with the `selenium.jar` for ease of use.

The [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) npm package has some details on what is required.

# Selenium Setup.

The Selenium server must be on the system path as '`selenium`' the easiest way to set it up to work with the chrome web store scraper is to copy to make the `selenium` bash script in this project executable with `chmod +x selenium` and then copy that file, along with the selenium server `.jar` file to `/bin/` or somewhere similar.

When copying the selenium server `.jar` make sure it is renamed from `selenium-server-standalone-3.14.0.jar` to just `selenium.jar`.

## chromedriver

As well as selenium, you're going to need the latest [chromedriver](http://chromedriver.chromium.org/) installed.

## chrome-browser-stable

A chrome browser is also required. you can get the latest [chrome-broswer-stable](https://www.chromium.org/getting-involved/dev-channel) from chromium.

# How To Use

You can use this to scrape search results for chrome extensions, or to scrape store information for a specific extension.

To include the scraper in your project:
```js
const ChromeWebScraper = require('./src/chrome-web-store-scraper');
const scraper = new ChromeWebScraper();
```

## Search

The most basic search just requires you to provide a search term.
```js
    scraper.search('some-search-term').then(
        (res) => console.log),
        (err) => console.log
    );
```

there are additional options than can be used to perform a more directed search

### Search categories
You can provide as a category which the scraper will then use when building a search request, only one category can be provided.

Valid Categories
```json
all
accessibility
blogging
byGoogle
developerTools
fun
newsAndWeather
photos
productivity
searchTools
shopping
socialAndCommunication
sports
```

Categories can be provided in an options JSON object as demonstrated below:
```js
const options =  {searchCategory : 'newsAndWeather'}

return scraper.search('searchString', options).then(
    (res) => console.log,
    (err) => console.log
);
```

### Search Features

Search features can be provided as a means of specifying select features that a chrome extension must have.

Passed as an array of strings in an options JSON object, the features can be any combination of the following:
```json
offline
byGoogle
free
android
googleDrive
```


features can be provided in an options JSON object as demonstrated below:
```js
const options =  {
    searchFeatures : ['free', 'offline','byGoogle']
}

return scraper.search('searchString', options).then(
    (res) => console.log,
    (err) => console.log
);
```

### Features and Categories

Searching can be performed with categories and features together in the same options JSON object.

```js
const options =  {
    searchCategory : 'newsAndWeather',
    searchFeatures : ['free', 'byGoogle']
}

return scraper.search('searchString', options).then(
    (res) => console.log,
    (err) => console.log
);

```