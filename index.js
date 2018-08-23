/**
 * Export cheerio (with )
 */

exports = module.exports = require('./src/chrome-web-store-scraper.js');

/*
  Export the version
*/

exports.version = require('./package.json').version;
