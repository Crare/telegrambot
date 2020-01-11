const async = require('async');

/* 
* bot for running in cronjob
* This telegrambot is made by Crare. Hi! C: https://github.com/crare/telegrambot
* parsers can be found in folder ./data_parsers
* train-data from https://rata.digitraffic.fi/api/v1/doc/index.html
* weather-data from https://openweathermap.org/api
* news-data from https://yle.fi/uutiset/rss
*/

/*
* DEBUG RUN:
* in commandline:
* node bot_cronjob.js --morning
* THIS CODE IS RUN IN CRONTAB. telegram commands are in bot_commands.js
*/


const Telegraf = require('telegraf')

// first load api keys and settings:
// save your settings in 'settings_template.json'
// and change the name it as 'settings.json'.
const settings = require('./settings.json');
morning_in_many_languages = require('./data/good_morning_in_many_languages.json');

const cmdargs = require('commander');

const train_parser = require('./data_parsers/vr-trains.js');
const weather_parser = require('./data_parsers/weather.js');
const news_parser = require('./data_parsers/news3.js');
const sunrise_sunset = require('./data_parsers/sunrise-sunset.js');
const flagdays = require('./data_parsers/flagdays.js');
const movies = require('./data_parsers/movies.js');
const lunch_menu = require('./data_parsers/lunch_menu.js');

// crontab examples:

// morning
// node bot_cronjob.js -m -WshHFNg

// evening
// node bot_cronjob.js -e -WM

// friday evening
// node bot_cronjob.js -e -f -WMg

// weekend
// node bot_cronjob.js -w -WshHFNM

// lunch menu for week
// node bot_cronjob.js --l_week

// lunch menu for today
// node bot_cronjob.js --l_today

// commands
cmdargs
  .version('0.0.1')
  .option('--production', 'send messages to production bot instead of test bot.')
  .option('-m, --morning', 'Show morning message')
  .option('-e, --evening', 'Show evening message')
  .option('-f, --friday', 'Show friday message')
  .option('-w, --weekend', 'Show weekend message')

  .option('-W, --weather', 'Show weather forecast.')
  .option('--lat <n>', 'Latitude coordinate for weather. (otherwise uses settings.lat)', parseFloat)
  .option('--lon <n>', 'Longitude coordinate for weather. (otherwise uses settings.lon)', parseFloat)
  .option('-s, --sunrise_sunset', 'Show sunrise and sunset time.')
  .option('-t, --trains', 'Show train schedules.')
  .option('--trains_from [station_name]', 'Station for departing.')
  .option('--trains_to [station_name]', 'Station for arrival.')
  .option('--trains_amount <n>', 'Amount of train-schedules shown.', parseInt)
  .option('-M, --movies', 'Show todays movies.')
  .option('-F, --flags', 'Show flagday information if today is flagday.')
  .option('-N, --news', 'Show news for today.')
  .option('--l_week', 'Show lunch menu for this week.')
  .option('--l_today', 'Show lunch menu for today.')

  .option('--message <s>', 'Sends message')

  .parse(process.argv);

const debug = cmdargs.debug ? true : false;
debugLog = (output) => {
  if (debug) {
    console.log(output);
  }
}

// setup bot
let botToken = settings.test_bot_key;
let sendToChatId = settings.testChatId;
let botName = settings.testBotName;
if (cmdargs.production) {
  botToken = settings.prod_bot_key;
  sendToChatId = settings.productionChatId;
  botName = settings.botName;
}
const bot = new Telegraf(botToken)

const extras = { parse_mode: 'Markdown' };

// Default language for news if not given. Possible languages are: en, fi, ru, sa, simplefi
const defaultLang = settings.newsDefaultLanguage;

getDayName = (index) => {
  const daynames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return daynames[index];
}

getWeekNumber = () => {
  // https://weeknumber.net/how-to/javascript
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

getEveningMessage = () => {
  return "*Good afternoon!" + "*\r\n";
}

getRandomMorningGreeting = () => {
  let rand_i = Math.floor(Math.random() * morning_in_many_languages.length);
  let output = morning_in_many_languages[rand_i].word + " (" + morning_in_many_languages[rand_i].language + ")" + "\r\n";
  return output;
}

getFridayEveningMessage = () => {
  return "*IT'S FRIDAY YAY!" + "*\r\n";
}

getWeekendMessage = () => {
  return "*Have a nice weekend!" + "*\r\n";
}

buildMessageWithCommands = () => {
  let output = "";

  if (cmdargs.message) {
    output += cmdargs.message + "\r\n";
  }

  // first greeting message
  if (cmdargs.morning) {
    output += getRandomMorningGreeting();
  } else if (cmdargs.evening) {
    if (cmdargs.friday) {
      output += getFridayEveningMessage();
    } else {
      output += getEveningMessage();
    }
  } else if (cmdargs.weekend) {
    output += getWeekendMessage();
  }

  // add wanted functions to waterfall for getting asyn function callbacks back to back syncronously.
  // next if statements make up output message depending what commands are used as starting parameters.
  let waterfall_functions = [];

  // setup place
  let place = {
    name: settings.sun_place_name,
    countrycode: settings.countrycode,
    lat: settings.sun_at_lat,
    lng: settings.sun_at_lon,
    province: undefined
  }
  if (cmdargs.lon) {
    place.lon = cmdargs.lon;
  }
  if (cmdargs.lat) {
    place.lon = cmdargs.lat;
  }
  if (cmdargs.country) {
    place.lon = cmdargs.country;
  }
  if (cmdargs.city) {
    place.nimi = cmdargs.city;
  }

  if (cmdargs.weather) {
    waterfall_functions.push(
      (callback) => {
        weather_parser.getOpenWeatherData(place, 1, (weather_forecast) => {
          output += weather_forecast + "\r\n";
          callback();
        });
      }
    );
  }

  if (cmdargs.sunrise_sunset) {
    waterfall_functions.push(
      (callback) => {
        sunrise_sunset.getSunDataAtLocation(place, (sun_data) => {
          output += sun_data + "\r\n";
          callback();
        });
      }
    );
  }

  if (cmdargs.trains) {
    let trains_from = cmdargs.trains_from;
    let trains_to = cmdargs.trains_to;
    let trains_amount = cmdargs.trains_amount;
    let getCargoTrains = false;

    if (trains_from != undefined && trains_to != undefined) {
      waterfall_functions.push(
        (callback) => {
          train_parser.haeJunatReitille(trains_from, trains_to, trains_amount, getCargoTrains, (trains) => {
            output += trains + "\r\n";
            callback();
          });
        }
      );
    }
  }

  if (cmdargs.movies) {
    waterfall_functions.push(
      (callback) => {
        let useHtmlMarkdown = false;
        let only_today = true;
        movies.getMoviesOnTV(useHtmlMarkdown, only_today, (moviesMessage) => {
          output += moviesMessage + "\r\n";
          callback();
        })
      }
    );
  }

  if (cmdargs.flags) {
    waterfall_functions.push(
      (callback) => {
        flagdays.getFlagdayToday((flagday_) => {
          output += flagday_ + "\r\n";
          callback();
        });
      }
    );
  }

  if (cmdargs.news) {
    waterfall_functions.push(
      (callback) => {
        news_parser.getYleNews(place.province, defaultLang, 5, (news_) => {
          output += news_;
          callback();
        });
      }
    )
  };

  if (cmdargs.l_week) {
    waterfall_functions.push(
      (callback) => {
        lunch_menu.getMenuForWeek((menu) => {
          output += menu + "\r\n";
          callback();
        });
      });
  }
  if (cmdargs.l_today) {
    waterfall_functions.push(
      (callback) => {
        lunch_menu.getMenuToday((menu) => {
          output += menu + "\r\n";
          callback();
        });
      });
  }

  // run waterfall functions and return output message to chat.
  async.waterfall(waterfall_functions, (err, result) => {
    debugLog("waterfall result = " + result);
    debugLog(output);

    bot.telegram.sendMessage(sendToChatId, output, extras).then(() => {
      debugLog("Send buildMessageWithCommands message.");
    });
  });

};

buildMessageWithCommands();