const cheerio = require('cheerio')

const { Builder, By, Capabilities, until } = require('selenium-webdriver')

const WAIT_THRESHOLD = 10000

class ChromeWebStoreScraper {
  constructor () {
    this.searchCategories = require('../data/search_categories.json')
    this.searchFeatures = require('../data/search_features.json')
    this.selectors = require('../data/selectors.json')
    this.driver = undefined
  }

  async scrapeApp (appURL) {
    let details = {}
    try {
      if (!this.driver) {
        this.driver = await this.createChromeDriver()
      }
      await this.driver.get(appURL)
      details = await this.scrapeDetails(this.driver)
    } catch (err) {
      console.log('building failed', err)
    }
    return details
  }

  async scrapeDetails (driver) {
    const header = await this.scrapeAppHeader(driver)
    const overview = await this.scrapeOverview(driver)
    const reviews = await this.scrapeReviews(driver)
    return {
      header: header,
      overview: overview,
      reviews: reviews
    }
  }

  async scrapeReviews (driver, previousReviews) {
    previousReviews = previousReviews || []

    // Find Reviews CSS button, then click it.
    const reviewButtons = await driver.findElements(By.css(this.selectors.reviews.button))
    if (reviewButtons.length) {
      console.log('Review Button Found')
      await reviewButtons[0].click()
      console.log('Review Button Clicked')
    } else {
      console.log('Review Button Not Found')
    }

    const reviewBySelector = By.css(this.selectors.reviews.container)
    const otherReviewBySelector = By.css(this.selectors.reviews.containerAlt)
    let reviewData = []
    try {
      await driver.wait(until.elementsLocated(reviewBySelector), WAIT_THRESHOLD)
      reviewData = await driver.findElements(reviewBySelector)
    }
    catch(err) {
      console.log(`Could not find review elements using first Selector: ${err}`)
    }

    if (!reviewData.length) {
      try {
        await driver.wait(until.elementsLocated(otherReviewBySelector), WAIT_THRESHOLD)
        reviewData = await driver.findElements(otherReviewBySelector)
      }
      catch(err) {
        console.log(`Could not find review elements using second Selector: ${err}`)
        return {}
      }
    }

    console.log(reviewData.length)

    let reviews = []
    for (const data of reviewData) {
      let res = await data
      console.log(await res.getAttribute('outerHTML'))
      let html = ''
      let review = {}

      if (typeof res.getAttribute === 'function') {
        html = await res.getAttribute('outerHTML')
        review = this.parseAppReviewHTML(html)
      }
      const notAllEmpty = Object.keys(review).every((key) => {
        const val = review[key]
        return val !== '' && val !== -1 && val !== [] && val !== {} // replace with an isEmpty method (maybe use the one in lodash)
      })
      if (notAllEmpty) {
        reviews.push(review)
      }
    }

    // return reviews

    previousReviews = previousReviews.concat(reviews)

    console.log(`Scraped ${previousReviews.length} (+${reviews.length}) Reviews`)
    const nextButtonBySelector = By.css(this.selectors.reviews.nextPage)
    let nextReviewsButtons = []

    try {
      await driver.wait(until.elementsLocated(nextButtonBySelector), WAIT_THRESHOLD)
      nextReviewsButtons = await driver.findElement(nextButtonBySelector)
      console.log(await nextReviewsButtons.getAttribute('innerHTML'))
      console.log(await nextReviewsButtons.getAttribute('outerHTML'))
      await driver.wait(until.elementIsVisible(nextReviewsButtons), WAIT_THRESHOLD)
    }
    catch(err) {
      console.log(`Could not find Next Page Element: ${err}`)
      return previousReviews
    }

    console.log(await nextReviewsButtons[0].getAttribute('outerHTML'))
    await nextReviewsButtons[0].click()

    return this.scrapeReviews(driver, previousReviews)
  }

  parseAppReviewHTML (html) {
    const $ = cheerio.load(html)
    const profileImageURL = $(this.selectors.reviews.profileImage).first().attr('src')
    const displayNameField = $(this.selectors.reviews.displayName).first().find('a').first()
    const displayName = displayNameField.text()
    const displayNameURL = displayNameField.attr('href')
    const timestamp = $(this.selectors.reviews.timestamp).first().text()
    const ratingString = $(this.selectors.reviews.rating).first().attr('title')
    let rating = -1
    if (ratingString) {
      rating = parseInt(ratingString.substr(0, 1))
    }
    const comment = $(this.selectors.reviews.comment).first().text()
    return {
      displayName: displayName || '',
      profileImageURL: profileImageURL || '',
      displayNameURL: displayNameURL || '',
      timestamp: timestamp || '',
      ratingString: ratingString || '',
      rating: rating || -1,
      comment: comment || ''
    }
  }

  async scrapeOverview (driver) {
    var overviewData = []
    var timer = 0
    while (overviewData.length === 0) {
      const selection = await driver.findElements(By.css(this.selectors.overview.container))
      if (selection.length) {
        overviewData.push(selection[0])
      }
      timer = timer + 1
      if (timer > WAIT_THRESHOLD) {
        return {}
      }
    }

    let res = await overviewData[0]
    let html = ''
    let overview = {}

    if (typeof res.getAttribute === 'function') {
      html = await res.getAttribute('outerHTML')
      overview = this.parseAppOverviewHTML(html)
    }
    return overview
  }

  parseAppOverviewHTML (html) {
    const $ = cheerio.load(html)
    const summary = $(this.selectors.overview.summary).first().text()
    const description = $(this.selectors.overview.description).first().text()
    const version = $(this.selectors.overview.version).first().text()
    const lastUpdatedDate = $(this.selectors.overview.lastUpdatedDate).first().text()
    const size = $(this.selectors.overview.size).first().text()
    const language = $(this.selectors.overview.language).first().text()

    const screenshotURLs = $(this.selectors.overview.screenshots).map(function () {
      return $(this).attr('src')
    }).get()

    const additionalInfo = $(this.selectors.overview.additionalInfo).map(function () {
      return {
        text: $(this).text(),
        href: $(this).attr('href')
      }
    }).get()

    return {
      summary: summary || '',
      description: description || '',
      version: version || '',
      lastUpdatedDate: lastUpdatedDate || '',
      language: language ? (language.includes('See all') ? 'multiple' : language) : '',
      size: size || '',
      screenshotURLs: screenshotURLs || [],
      additionalInfo: additionalInfo || []
    }
  }

  async scrapeAppHeader (driver) {
    var headerData = []
    var timer = 0
    while (headerData.length === 0) {
      const selection = await driver.findElements(By.css(this.selectors.header.container))
      if (selection.length) {
        headerData.push(selection[0])
      }
      timer = timer + 1
      if (timer > WAIT_THRESHOLD) {
        return {}
      }
    }
    let res = await headerData[0]
    let html = ''
    let header = {}
    if (typeof res.getAttribute === 'function') {
      html = await res.getAttribute('outerHTML')
      header = this.parseAppHeaderHTML(html)
    }
    return header
  }

  parseAppHeaderHTML (html) {
    const $ = cheerio.load(html)
    const imgURL = $(this.selectors.header.image).first().attr('src')
    const title = $(this.selectors.header.title).first().text()
    const offeredBy = $(this.selectors.header.offeredBy).first().text()
    const rating = $(this.selectors.header.rating).first().attr('g:rating_override')
    const userCount = parseInt($(this.selectors.header.userCount).first().text().replace(/\D/g, ''))
    const ratingCount = parseInt($(this.selectors.header.ratingCount).first().text().replace(/\D/g, ''))

    return {
      title: title,
      offeredBy: offeredBy,
      userCount: userCount,
      rating: rating,
      ratingCount: ratingCount,
      imgURL: imgURL
    }
  }

  async parseSearchBody (driver, throttle, scrollAttempts) {
    console.log('Processing Selenium Search Page')
    var searchResults = []

    // wait for page to load, scroll, wait scroll, wait scroll...
    const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

    for (var i = 0; i < scrollAttempts; i++) {
      await sleep(50)
      driver.executeScript('window.scrollBy(0,1000)', '')
    }

    console.log('Waiting for results to load.')

    await sleep(throttle)
    var timer = 0
    while (searchResults.length === 0) {
      searchResults = await driver.findElements(By.css(this.selectors.search.container))
      timer = timer + 1
      if (timer > WAIT_THRESHOLD) {
        throw new Error('Unable to find search body.', 'Timer:', timer)
      }
    }

    // const textHeadings = ['title', 'author', 'description','buttonText','category','numberOfRatings'];
    const searchResultsJSON = []
    console.log(`${searchResults.length} Found. Extracting Text and HTML`)
    for (const result of searchResults) {
      const res = await result

      if (typeof res.getAttribute !== 'function') {
        console.log('No getAttribute Method Found a Search Result.')
        break
      }

      if (typeof res.getText !== 'function') {
        console.log('No getText Method Found on a Search Result.')
        break
      }
      const html = await res.getAttribute('outerHTML')

      let $ = cheerio.load(html)

      const title = $(this.selectors.search.title).first().text()
      const description = $(this.selectors.search.description).first().text()
      const author = $(this.selectors.search.author).first().text()
      const category = $(this.selectors.search.category).text()
      const storeURL = $(this.selectors.search.url).first().attr('href')
      const numberOfRatings = $(this.selectors.search.ratingCount).first().text()
      const rating = $(this.selectors.search.rating).first().attr('g:rating_override')

      const resJSON = {
        title: title || '',
        description: description || '',
        author: author || '',
        category: category || '',
        storeURL: storeURL || '',
        rating: rating ? parseFloat(rating) : -1,
        numberOfRatings: numberOfRatings ? parseInt(numberOfRatings.replace(/\D/g, '')) : -1
      }
      searchResultsJSON.push(resJSON)
    }
    return searchResultsJSON
  }

  buildSearchURLString (
    searchString,
    options = {
      searchCategory: undefined,
      searchFeatures: undefined,
      locale: undefined
    }
  ) {
    const searchCategory = options.searchCategory !== undefined ? options.searchCategory : 'all'
    const searchFeatures = options.searchFeatures !== undefined ? options.searchFeatures : []
    const locale = options.locale !== undefined ? options.locale : 'en-gb'

    // Form Search URL
    const baseURL = 'https://chrome.google.com/webstore/search'
    let searchURL = `${baseURL}/${searchString}?hl=${locale}&_category=${this.searchCategories[searchCategory]}`

    if (searchFeatures.length > 0) {
      searchURL = `${searchURL}&${searchFeatures.map((f) => this.searchFeatures[f]).join('&')}`
    }

    return encodeURI(searchURL)
  }

  async search (
    searchString,
    options = {
      searchCategory: undefined,
      searchFeatures: undefined,
      throttle: undefined,
      scrollAttempts: undefined,
      locale: undefined
    }
  ) {
    const searchCategory = options.searchCategory !== undefined ? options.searchCategory : 'all'
    const searchFeatures = options.searchFeatures !== undefined ? options.searchFeatures : []
    const throttle = options.throttle !== undefined ? options.throttle : 3000
    const scrollAttempts = options !== undefined ? options.scrollAttempts : 100
    const locale = options.locale !== undefined ? options.locale : 'en-gb'

    // Check options are valid.
    if (searchFeatures.constructor !== Array) {
      throw new Error('Search Filter Must Be Provided as an Array')
    }

    if (searchFeatures.some((f) => !this.searchFeatures[f])) {
      throw new Error('Invalid Search Filter Provided.')
    }

    if (!this.searchCategories[searchCategory]) {
      throw new Error('Invalid Search Category Provided.')
    }

    // build the encoded search URL.
    const searchURL = this.buildSearchURLString(searchString, {
      searchCategory: searchCategory,
      searchFeatures: searchFeatures,
      locale: locale
    })

    let searchResults = []

    try {
      if (!this.driver) {
        this.driver = await this.createChromeDriver()
      }
      await this.driver.get(searchURL)
      searchResults = await this.parseSearchBody(this.driver, throttle, scrollAttempts)
    } catch (err) {
      console.log(err)
    }
    return searchResults
  }

  async createChromeDriver () {
    const chromeOptions = {
      args: ['--headless', '--disable-gpu', '--no-sandbox']
    }
    const chromeCapabilities = Capabilities.chrome()
    chromeCapabilities.set('chromeOptions', chromeOptions)

    console.log('Building Selenium Driver')

    return new Builder()
      .forBrowser('chrome')
      .withCapabilities(chromeCapabilities)
      .build()
  }
}

module.exports = ChromeWebStoreScraper
