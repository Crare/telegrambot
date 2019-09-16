// giphy.js
// gifs from giphy

const GphApiClient = require('giphy-js-sdk-core')

let client = undefined;

exports.setApiKey = (api_key) => {
  client = GphApiClient(api_key);
}

exports.getGifs = (query, amount, callback) => {
  if (client == undefined) {
    console.error("no api key set!");
  } else {
    /// Gif Search
    if (amount > 10) { amount = 10; } else if (amount < 1) { amount = 1; }

    //"rating" - string - limit results to those rated (y,g, pg, pg-13 or r).
    client.search('gifs', { "q": query, 'limit': amount }) //, rating: 'g'})
      .then((response) => {

        let gif_urls = [];
        for (let i = 0; i < response.data.length; i++) {
          let gif_url = response.data[i].images.looping.mp4_url;
          if (gif_url != undefined && gif_url.length > 0) {
            gif_urls.push(gif_url);
          }
        }

        callback(gif_urls);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

exports.getRandomGif = (tag, callback) => {
  if (client == undefined) {
    console.error("no api key set!");
  } else {
    /// Random Gif
    let extras = {};
    if (tag != undefined) {
      extras.tag = tag;
    }
    //"rating" - string - limit results to those rated (y,g, pg, pg-13 or r).
    client.random('gifs', extras) //, {rating: 'g'})
      .then((response) => {
        gif = response.data.images.original;
        if (gif.mp4) {
          gif = gif.mp4;
        } else {
          gif = gif.gif_url;
        }
        callback(gif);
      })
      .catch((err) => {
        console.error(err);
      })
  }
}
