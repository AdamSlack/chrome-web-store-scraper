const gplay = require('google-play-scraper');

const fs = require('fs')

const search_list = ['distraction', 'smartphone distraction', 'addiction', 'smartphone addiction', 'motivation', 'smartphone motivation', 'self-control', 'smartphone self-control']

async function main () {
    let results = []

    for (const term of search_list) {
        console.log(term)

        let currResults = []

        const searchOptions = {
            term: term,
            num: 250,
            throttle: 1,
            fullDetail: true,
            country: 'us'
        }

        console.log('Performing GPlay search with Params:');
        console.log(searchOptions);
        currResults = await gplay.search(searchOptions).catch((err)=>console.log(err))

        // console.log(currResults)

        console.log(`Search Complete Found: ${currResults.length} Results`);
        results.push({
            searchTerm: term,
            results: currResults
        })
    }

    fs.writeFile('uk_search.json', JSON.stringify(results, null, 2), function (err) {
      if (err) throw err;
      console.log('Saved!');
    });

}

main()