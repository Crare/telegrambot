const assert = require('assert');

const settings = require('../settings.json');

const sunrise_sunset = require('../data_parsers/sunrise-sunset.js');
const train_parser = require('../data_parsers/vr-trains.js');
const weather_parser = require('../data_parsers/weather.js');
const news_parser = require('../data_parsers/news3.js');

const test_data = {
  sunrise: {
    place: {
      nimi: settings.sun_place_name,
      countrycode: settings.countrycode,
      lat: settings.sun_at_lat,
      lng: settings.sun_at_lon
    }
  },
  train: {
    stop1: "Helsinki",
    stop2: "Tamere",
    amount: 10,
  },
  weather: {
    place: {
      name: "Helsinki",
      countrycode: "FI"
    },
    days: 5
  }
};

const debug = false;
const YELLOW ='\033[1;33m';
const NEUTRAL = '\033[0m';

debugLog = (output) => {
  if (debug) {
    console.log(YELLOW);
    console.log(output);
    console.log(NEUTRAL);
  }
}

exists = (object, done) => {
  assert.notEqual(object, null);
  assert.notEqual(object, undefined);
  done();
}

describe('Sunrise sunset', () => {

  describe('getSunDataAtLocation', () => {
    it('should get parsed response from API', (done) => {
      sunrise_sunset.getSunDataAtLocation(test_data.sunrise.place, (output) => {
        exists(output, done);
      });
    });
  });

});

describe('VR trains', () => {

  describe('haeAsemanTiedot', () => {
    it('should get parsed response from API', (done) => {
      train_parser.haeAsemanTiedot(test_data.train.stop1, (output) => {
        debugLog(output);
        exists(output, done);
      });
    });
  });

  describe('haeAsemanJunat', () => {
    it('should get parsed response from API', (done) => {
      train_parser.haeAsemanJunat(test_data.train.stop1, false, 10, (output) => {
        debugLog(output);
        exists(output, done);
      });
    });
  });

  describe('haeJunatReitille', () => {
    it('should get parsed response from API', (done) => {
      train_parser.haeJunatReitille(test_data.train.stop1, test_data.train.stop2, test_data.train.amount, false, (output) => {
        debugLog(output);
        exists(output, done);
      });
    });
  });

});

describe('Weather', () => {

  describe('getOpenWeatherData', () => {
    it('should get parsed response from API', (done) => {
      weather_parser.getOpenWeatherData(test_data.weather.place, test_data.weather.days, (output) => {
        debugLog(output);
        exists(output, done);
      }, (err) => {
        done(err);
      });
    });
  });

});

describe('News', () => {

  describe('getProvinces', () => {
    it('should get parsed response from API', (done) => {
      news_parser.getProvinces((output) => {
        debugLog(output);
        exists(output, done);
      });
    });
  });

});