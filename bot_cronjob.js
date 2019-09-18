const async = require('async');

/* 
* bot for running in cronjob
* This telegrambot is made by Crare. Hi! C: https://github.com/crare/telegrambot
* parsers can be found in folder ./data_parsers
* train-data from https://rata.digitraffic.fi/api/v1/doc/index.html
* weather-data from https://openweathermap.org/api
* news-data from https://yle.fi/uutiset/rss
* happenings from http://www.webcal.fi/fi-FI/kalenterit.php
*/

/*
* DEBUG RUN:
* in commandline:
* node bot_cronjob.js --test --morning
* THIS CODE IS RUN IN CRONTAB. telegram commands are in bot_commands.js
*/


const Telegraf = require('telegraf')

// first load api keys and settings:
// save your settings in 'settings_template.json'
// and change the name it as 'settings.json'.
const settings = require('./settings.json');
morning_greetings = require('./data/morning_greetings.json');

const cmdargs = require('commander');
const diskspace = require('diskspace');

const train_parser = require('./data_parsers/vr-trains.js');
const weather_parser = require('./data_parsers/weather.js');
const news_parser = require('./data_parsers/news2.js');
const giphy_handler = require('./data_parsers/giphy.js');
const sunrise_sunset = require('./data_parsers/sunrise-sunset.js');
const happenings = require('./data_parsers/happenings.js');
const flagdays = require('./data_parsers/flagdays.js');
const holidays = require('./data_parsers/holidays.js');
const movies = require('./data_parsers/movies.js');
const lunch_menu = require('./data_parsers/lunch_menu.js');

// crontab examples:

// morning
// node bot_cronjob.js --test -m -WshHFNg

// evening
// node bot_cronjob.js --test -e -WM

// friday evening
// node bot_cronjob.js --test -e -f -WMg

// weekend
// node bot_cronjob.js --test -w -WshHFNM

// lunch menu for week
// node bot_cronjob.js --test --l_week

// lunch menu for today
// node bot_cronjob.js --test --l_today

// commands
cmdargs
  .version('0.0.1')
  .option('--test', 'send messages to test bot instead of production bot.')
  .option('-m, --morning', 'Show morning message')
  .option('-e, --evening', 'Show evening message')
  .option('-f, --friday', 'Show friday message')
  .option('-w, --weekend', 'Show weekend message')
  .option('-d, --diskspace', 'Displays diskspace at /var/www/html/ used,total,free space.')

  .option('-W, --weather', 'Show weather forecast.')
  .option('--lat <n>', 'Latitude coordinate for weather. (otherwise uses settings.lat)', parseFloat)
  .option('--lon <n>', 'Longitude coordinate for weather. (otherwise uses settings.lon)', parseFloat)
  .option('-s, --sunrise_sunset', 'Show sunrise and sunset time.')
  .option('--diskspace [path]', 'Show diskspace at path.')
  .option('-t, --trains', 'Show train schedules.')
  .option('--trains_from [station_name]', 'Station for departing.')
  .option('--trains_to [station_name]', 'Station for arrival.')
  .option('--trains_amount <n>', 'Amount of train-schedules shown.', parseInt)
  .option('-h, --happenings', 'Show happenings for today.')
  .option('-H, --holidays', 'Show special holiday if today is holiday.')
  .option('-M, --movies', 'Show todays movies.')
  .option('-F, --flags', 'Show flagday information if today is flagday.')
  .option('-N, --news', 'Show news for today.')
  .option('--l_week', 'Show lunch menu for this week.')
  .option('--l_today', 'Show lunch menu for today.')
  .option('-g, --giphy', 'Show gifs from giphy.')

  .option('--message <s>', 'Sends message')

  .parse(process.argv);

// setup bot
let botToken = settings.prod_bot_key;
let sendToChatId = settings.productionChatId;
let botName = settings.botName;

const debug = cmdargs.debug ? true : false;

if (cmdargs.test) {
  botToken = settings.test_bot_key;
  sendToChatId = settings.testChatId;
  botName = settings.testBotName;
}

const bot = new Telegraf(botToken)

debugLog = (output) => {
  if (debug) {
    console.log(output);
  }
}

const extras = { parse_mode: 'Markdown' };

const diskspaceCheckLocation = "/var/www/html/";

// Default language for news if not given. Possible languages are: en, fi, ru, sa, simplefi
const defaultLang = "en";

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
  let rand_i = Math.floor(Math.random() * morning_greetings.length);
  let output = morning_greetings[rand_i] + "\r\n";
  return output;
}

getFridayEveningMessage = () => {
  return "*IT'S FRIDAY YAY!" + "*\r\n";
}

getWeekendMessage = () => {
  return "*Have a nice weekend!" + "*\r\n";
}

bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

getDiskSpaceMessage = (path, callback) => {
  let output = "";
  diskspace.check(path, (err, result) => {
    if (err) {
      callback("Couldn't get diskspace at path: " + path);
    } else {
      output += "*Diskspace at* " + path + "\r\n";
      output += "*Total:* " + bytesToSize(result.total) + " 100% \r\n";
      output += "*Used:* " + bytesToSize(result.used) + " " + ((result.used / result.total) * 100).toFixed(2) + "% " + "\r\n";
      output += "*Free:*  " + bytesToSize(result.free) + " " + ((result.free / result.total) * 100).toFixed(2) + "% " + "\r\n";
      output += "*Status:* " + result.status + "\r\n";
      callback(output);
    }
  });
}

getDiskSpace = (path, chatId) => {
  diskspace.check(path, (err, result) => {
    let output = "*Hello this is diskspace information:*\r\n";
    output += "*Diskspace at* " + path + "\r\n";
    output += "*Total:* " + bytesToSize(result.total) + " 100% \r\n";
    output += "*Used:* " + bytesToSize(result.used) + " " + ((result.used / result.total) * 100).toFixed(2) + "% " + "\r\n";
    output += "*Free:*  " + bytesToSize(result.free) + " " + ((result.free / result.total) * 100).toFixed(2) + "% " + "\r\n";
    output += "*Status:* " + result.status + "\r\n";

    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      debugLog("Send diskspace message.");
    })
  });
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
    nimi: settings.morning_weather_at,
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

  if (cmdargs.diskspace) {
    waterfall_functions.push(
      (callback) => {
        getDiskSpaceMessage(path, (message) => {
          output += message + "\r\n";
        })
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

  if (cmdargs.happenings) {
    waterfall_functions.push(
      (callback) => {
        happenings.getHappeningsTodayString((happenings_string) => {
          output += happenings_string + "\r\n";
          callback();
        });
      }
    );
  }

  if (cmdargs.holidays) {
    waterfall_functions.push(
      (callback) => {
        holidays.getHolidayToday((holiday) => {
          output += holiday + "\r\n";
          callback();
        });
      }
    );
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

      if (cmdargs.giphy) {
        // send gif after other messages as separate message
        giphy_handler.getRandomGif(getDayName(new Date().getDate()), (gif) => {
          if (gif != undefined) {
            bot.telegram.sendDocument(sendToChatId, gif).then(() => {
              debugLog("Send monday gif.");
            })
          }
        });
      }
    });
  });

};

buildMessageWithCommands();