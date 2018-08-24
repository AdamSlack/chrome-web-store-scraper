[![CircleCI](https://circleci.com/gh/AdamSlack/chrome-web-store-scraper.svg?style=shield)](https://circleci.com/gh/AdamSlack/chrome-web-store-scraper)
[![npm version](https://badge.fury.io/js/chrome-web-store-scraper.svg)](https://badge.fury.io/js/chrome-web-store-scraper)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)

# chrome-web-store-scraper
A node js package for scraping the chrome web store.

# Requirements

This project requires selenium, a Web Browser Automation tool. The latest version of the Selenium Standalone Server can be downloaded from [seleniumhq](https://www.seleniumhq.org/download/).

Selenium Server must also be installed as `selenium` on the system PATH. For linux, a `selenium` bash script is included that can be paired with the `selenium.jar` for ease of use.

The [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) npm package has some details on what is required.

# Selenium Setup

The Selenium server must be on the system path as '`selenium`' the easiest way to set it up to work with the chrome web store scraper is to make the `selenium` bash script (that is included this project) an executable with `chmod +x selenium` and then copy that file, along with the selenium server `.jar` file to `/bin/` or somewhere similar.

When copying the selenium server `.jar` make sure it is renamed from `selenium-server-standalone-3.14.0.jar` or whatever it is currently called, to just `selenium.jar`.

## chromedriver

As well as selenium, you're going to need the latest [chromedriver](http://chromedriver.chromium.org/) installed.

## chrome-browser-stable

A chrome browser is also required. you can get the latest [chrome-broswer-stable](https://www.chromium.org/getting-involved/dev-channel) from chromium.

# How To Use

You can use this to scrape search results for chrome extensions, or to scrape store information for a specific extension.

To include the scraper in your project:
```js
const ChromeWebScraper = require('chrome-web-store-scraper');
const scraper = new ChromeWebScraper();
```

## Search

The most basic search just requires you to provide a search term.
```js
    scraper.search('some-search-term').then(
        (res) => console.log(res),
        (err) => console.log(err)
    );
```

Example Response
```json
[
  {
    "title": "Data Scraper - Easy Web Scraping",
    "description": "Data Scraper extracts data out of HTML web pages and imports it into Microsoft Excel spreadsheets",
    "author": "",
    "category": "Productivity",
    "rating": 4.107231920199501,
    "numberOfRatings": 401,
    "storeURL": "https://chrome.google.com/webstore/detail/data-scraper-easy-web-scr/nndknepjnldbdbepjfgmncbggmopgden"
  },
  ...
]
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

scraper.search('searchString', options).then(
    (res) => console.log(res),
    (err) => console.log(err)
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

scraper.search('searchString', options).then(
    (res) => console.log(res),
    (err) => console.log(err)
);
```

### Features and Categories

Searching can be performed with categories and features together in the same options JSON object.

```js
const options =  {
    searchCategory : 'newsAndWeather',
    searchFeatures : ['free', 'byGoogle']
}

scraper.search('searchString', options).then(
    (res) => console.log(res),
    (err) => console.log(err)
);

```

## Extension Scraping

In order to scrape the store page for a specific chrome extension, this scraper requires a direct url to that page. These urls are to be passed as a parameter to the `scrapeApp` function.

```js
scraper.scrapeApp('url-to-some-app').then(
    (res) => console.log(res),
    (err) => console.log(err)
);
```

Example Response

```json
{
    "header": {
        "title": "Autosave webpage",
        "offeredBy": "offered by mtcutler1",
        "userCount": "48",
        "rating": "3.5",
        "ratingCount": 4,
        "imgURL": "https://lh3.googleusercontent.com/4jyS9mGYDUFs2KL52Xfg_I9EzkUIzlCboTp5Dvqv-vKrUWhoz9tNCWR4lPfNFneM2JFmgNrkCkc=w26-h26-e365"
    },
    "overview": {
        "summary": "Save ... a scheduled…",
        "description": "Save ... stay updated",
        "version": "0.1",
        "lastUpdatedDate": "January 24, 2018",
        "size": "178KiB",
        "language": "English (United States)",
        "screenshotURLs": [
            "https://lh3.googleusercontent.com/nBXzgn-La5s3HyynhHWmnJwAasC1KUMK8GfqCVnOqL-CEGhLOcVNGaNPYUQBv180-ypWPQN2xc8=w640-h400-e365",
            "https://lh3.googleusercontent.com/nBXzgn-La5s3HyynhHWmnJwAasC1KUMK8GfqCVnOqL-CEGhLOcVNGaNPYUQBv180-ypWPQN2xc8=w640-h400-e365",
            "https://lh3.googleusercontent.com/nBXzgn-La5s3HyynhHWmnJwAasC1KUMK8GfqCVnOqL-CEGhLOcVNGaNPYUQBv180-ypWPQN2xc8=w120-h90-e365"
        ],
        "additionalInfo": []
    },
    "reviews": [
    {
        "displayName": "Jeffrey",
        "profileImageURL": "//www.gstatic.com/s2/contacts/images/NoPicture.gif",
        "displayNameURL": "https://plus.google.com/110338040265199312388",
        "timestamp": "Modified Mar 21, 2018",
        "ratingString": "4 stars (Liked it)",
        "rating": 4,
        "comment": "Seemed to only work with one tab...would be perfect if it works on multiple tabs simultaneously"
    }
    ]
}
}
```