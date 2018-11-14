const cheerio = require('cheerio')

const { Builder, By, Capabilities } = require('selenium-webdriver')

const WAIT_THRESHOLD = 1000

class ChromeWebStoreScraper {
  constructor () {
    this.searchCategories = require('../data/search_categories.json')
    this.searchFeatures = require('../data/search_features.json')
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

  async scrapeReviews (driver) {
    // gonna need to go through each page and perform this...
    var reviewData = []
    var timer = 0
    while (reviewData.length === 0) {
      const selection = await driver.findElements(By.css('.ba-bc-Xb.ba-ua-zl-Xb'))
      if (selection.length) {
        reviewData.push(selection[0])
      }
      timer = timer + 1
      if (timer > WAIT_THRESHOLD) {
        console.log('No Reviews Found')
        return {}
      }
    }
    let reviews = []
    for (const data of reviewData) {
      let res = await data
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

    return reviews
  }

  parseAppReviewHTML (html) {
    const $ = cheerio.load(html)
    const profileImageURL = $('.Lg-ee-A-O-xb').first().attr('src')
    const displayNameField = $('.ba-bc-Xb-K').first().find('a').first()
    const displayName = displayNameField.text()
    const displayNameURL = displayNameField.attr('href')
    const timestamp = $('.ba-Eb-Nf').first().text()
    const ratingString = $('.rsw-stars').first().attr('title')
    let rating = -1
    if (ratingString) {
      rating = parseInt(ratingString.substr(0, 1))
    }
    const comment = $('.ba-Eb-ba').first().text()
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
      const selection = await driver.findElements(By.css('.h-e-f-b-Qe'))
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
    const summary = $('.C-b-p-j-Pb').first().text()
    const description = $('.C-b-p-j-Oa').first().text()
    const version = $('.C-b-p-D-Xe.h-C-b-p-D-md').first().text()
    const lastUpdatedDate = $('.C-b-p-D-Xe.h-C-b-p-D-xh-hh').first().text()
    const size = $('.C-b-p-D-Xe.h-C-b-p-D-za').first().text()
    const language = $('.C-b-p-D-Xe.h-C-b-p-D-Ba').first().text()

    const screenshotURLs = $('.h-A-Ce-ze-Yf.A-Ce-ze-Yf').map(function () {
      return $(this).attr('src')
    }).get()

    const additionalInfo = $('.C-b-p-rc-D-R').map(function () {
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
      const selection = await driver.findElements(By.css('.e-f-o'))
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
    const imgURL = $('img').first().attr('src')
    const title = $('.e-f-w').first().text()
    const offeredBy = $('.e-f-Me').first().text()
    const rating = $('.rsw-stars').first().attr('g:rating_override')
    const userCount = parseInt($('.e-f-ih').first().text().replace(/\D/g, ''))
    const ratingCount = parseInt($('.KnRoYd-N-nd').first().text().replace(/\D/g, ''))

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
      searchResults = await driver.findElements(By.css('.a-d-na.a-d.webstore-test-wall-tile.a-d-zc.Xd.dd'))
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

      const title = $('.a-na-d-w').first().text()
      const description = $('.a-na-d-Oa').first().text()
      const author = $('.oc').first().text()
      const category = $('.a-na-d-ea').text()
      const storeURL = $('.h-Ja-d-Ac.a-u').first().attr('href')
      const numberOfRatings = $('.q-N-nd').first().text()
      const rating = $('.rsw-stars').first().attr('g:rating_override')

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
