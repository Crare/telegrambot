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

/*
lat float
lon float
country string
city string

weather bool
sunrise_sunset bool
diskspace string
trains bool
  trains_from string
  trains_to string
  trains_amount int
happenings bool
holidays bool
movies bool
flags bool
news bool
*/

// commands
cmdargs
  .version('0.0.1')
  .option('--test', 'send messages to test bot instead of production bot.')
  .option('--morning', 'Show morning message')
  .option('--evening', 'Show evening message')
  .option('--friday', 'Show friday message')
  .option('--weekend', 'Show weekend message')
  .option('--diskspace', 'Displays diskspace at /var/www/html/ used,total,free space.')

  // new commands for building daily message with command-parameters.
  .option('--newCommands', 'Build a message with command parameters.')
  .option('-w, --weather', 'Show weather forecast.')
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
  .option('-m, --movies', 'Show todays movies.')
  .option('-f, --flags', 'Show flagday information if today is flagday.')
  .option('-n, --news', 'Show news for today.')
  .option('-l, --l_week', 'Show lunch menu for this week.')
  .option('-l, --l_today', 'Show lunch menu for today.')

  .parse(process.argv);

// setup bot
let botToken = settings.prod_bot_key;
let sendToChatId = settings.productionChatId;
let botName = settings.botName;

// setup bot
const botToken = settings.prod_bot_key;
const sendToChatId = settings.productionChatId;

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

// setup api keys
weather_parser.setApiKey(settings.openweathermap);
giphy_handler.setApiKey(settings.giphy);

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

show_morning_message = (chatId) => {
  debugLog("setting daily morning message.");
  let place = { nimi: settings.morning_weather_at, countrycode: settings.countrycode, lat: settings.sun_at_lat, lng: settings.sun_at_lon }

  let weather = "";
  let train = "";
  let news = "";
  let sunrise = "";
  let happening = "";
  let flagday = "";
  let holiday = "";

  async.waterfall([
    (callback) => {
      weather_parser.getOpenWeatherData(place, 1, (weather_forecast) => {
        weather = weather_forecast;
        callback();
      });
    },
    (callback) => {
      train_parser.haeJunatReitille(settings.morning_trains_from, settings.morning_trains_to, 5, false, (trains) => {
        train = trains;
        callback();
      });
    },
    (callback) => {
      news_parser.getYleNews(undefined, defaultLang, 5, (news_) => {
        news = news_;
        callback();
      });
    },
    (callback) => {
      sunrise_sunset.getSunDataAtLocation(place, (sun_data) => {
        sunrise = sun_data;
        callback();
      });
    },
    (callback) => {
      happenings.getHappeningsTodayString((happenings_string) => {
        happening = happenings_string;
        callback();
      });
    },
    (callback) => {
      holidays.getHolidayToday((holiday_) => {
        holiday = holiday_;
        callback();
      });
    },
    (callback) => {
      flagdays.getFlagdayToday((flagday_) => {
        flagday = flagday_;
        callback();
      });
    }
  ], (err, result) => {

    // get random morning message
    let output = "";
    const rand_i = Math.floor(Math.random() * morning_greetings.length);
    output += "" + morning_greetings[rand_i] + "\r\n";
    debugLog(morning_greetings[rand_i]);
    debugLog(rand_i);

    const date = new Date();
    hours = date.getHours();
    if (hours < 10) { hours = "0" + hours; }
    minutes = date.getMinutes()
    if (minutes < 10) { minutes = "0" + minutes; }

    let week_number = getWeekNumber();
    output += "*Today is " + getDayName(date.getDay()) + " " + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + ". Week " + week_number + ".*\r\n";
    output += flagday + "\r\n";
    output += holiday + "\r\n";
    output += happening + "\r\n";
    output += weather + "\r\n";
    output += sunrise + "\r\n\r\n";
    output += train + "\r\n";
    output += news;

    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      debugLog("Send daily morning message.");

      if (date.getDay() == 1 || cmdargs.test) { // 1 == monday
        giphy_handler.getRandomGif("monday", (gif) => {
          if (gif != undefined) {
            bot.telegram.sendDocument(chatId, gif).then(() => {
              debugLog("Send monday gif.");
            })
          }
        });
      }
    });

  });
}

show_friday_message = (chatId) => {
  debugLog("setting friday message.");
  let place = new Object();
  place.nimi = settings.morning_weather_at;
  place.countrycode = settings.countrycode;

  let weather = "";
  let train = "";
  let news = "";

  async.waterfall([
    (callback) => {
      weather_parser.getOpenWeatherData(place, 3, (weather_forecast) => {
        weather = weather_forecast;
        callback();
      });
    },
    (callback) => {
      train_parser.haeJunatReitille(settings.evening_trains_from, settings.evening_trains_to, 5, false, (trains) => {
        train = trains;
        callback();
      });
    },
    (callback) => {
      news_parser.getYleNews(undefined, defaultLang, 5, (news_) => {
        news = news_;
        callback();
      });
    },
  ], (err, result) => {

    let output = "*IT'S FRIDAY YAY!" + "*\r\n";
    output += weather + "\r\n";
    output += train + "\r\n";
    output += news;

    bot.telegram.sendMessage(chatId, output, extras).then(() => {

      debugLog("Send friday message.");
      giphy_handler.getRandomGif("friday", (gif) => {

        if (gif != undefined) {
          bot.telegram.sendDocument(chatId, gif).then(() => {
            debugLog("Send friday gif.");
          })
        }

      });
    })

  });
}

show_weekend_message = (chatId) => {
  debugLog("setting weekend message.");
  let place = new Object();
  place.nimi = settings.weekend_weather_at;
  place.countrycode = settings.countrycode;

  let weather = "";
  let news = "";
  let happening = "";
  let flagday = "";
  let holiday = "";

  async.waterfall([
    (callback) => {
      weather_parser.getOpenWeatherData(place, 3, (weather_forecast) => {
        weather = weather_forecast;
        callback();
      });
    },
    (callback) => {
      happenings.getHappeningsTodayString((happenings_string) => {
        happening = happenings_string;
        callback();
      });
    },
    (callback) => {
      news_parser.getYleNews(undefined, defaultLang, 5, (news_) => {
        news = news_;
        callback();
      });
    },
    (callback) => {
      holidays.getHolidayToday((holiday_) => {
        holiday = holiday_;
        callback();
      });
    },
    (callback) => {
      flagdays.getFlagdayToday((flagday_) => {
        flagday = flagday_;
        callback();
      });
    }
  ], (err, result) => {
    let output = "*Have a nice weekend!" + "*\r\n";
    output += flagday + "\r\n";
    output += holiday + "\r\n";
    output += happening + "\r\n";
    output += weather + "\r\n";
    output += news;

    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      debugLog("Send weekend message.");
    })
  });
}

show_evening_message = (chatId) => {
  debugLog("setting daily evening message.");
  let place = new Object();
  place.nimi = settings.evening_weather_at;
  place.countrycode = settings.countrycode;

  let weather = "";
  let train = "";
  let happening = "";
  let movies_tonight = "";

  async.waterfall([
    (callback) => {
      weather_parser.getOpenWeatherData(place, 3, (weather_forecast) => {
        weather = weather_forecast;
        callback();
      });
    },
    (callback) => {
      train_parser.haeJunatReitille(settings.evening_trains_from, settings.evening_trains_to, 5, false, (trains) => {
        train = trains;
        callback();
      });
    },
    (callback) => {
      news_parser.getYleNews(undefined, defaultLang, 5, (news_) => {
        news = news_;
        callback();
      });
    },
    (callback) => {
      let useHtmlMarkdown = false;
      let only_today = true;
      movies.getMoviesOnTV(useHtmlMarkdown, only_today, (movies_) => {
        movies_tonight = movies_;
        callback();
      })
    }
  ], (err, result) => {

    let output = "*Good afternoon!" + "*\r\n";
    output += weather + "\r\n";
    output += movies_tonight + "\r\n";
    output += train + "\r\n";
    output += news;

    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      debugLog("Send daily evening message.");
    })

  });
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

  // first greeting message
  if (cmdargs.morning) {
    output += getRandomMorningGreeting();
  } else if (cmdargs.evening) {
    output += getEveningMessage();
  } else if (cmdargs.fridayEvening) {
    output += getFridayEveningMessage();
  } else if (cmdargs.weekendMessage) {
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

  /*
  lat float
  lon float
  country string
  city string
  
  weather bool
  sunrise_sunset bool
  diskspace bool
  trains bool
    trains_from string
    trains_to string
    trains_amount int
  happenings bool
  holidays bool
  movies bool
  flags bool
  news bool
  */

  if (cmdargs.weather) {
    waterfall_functions.push(
      (callback) => {
        weather_parser.getOpenWeatherData(place, 3, (weather_forecast) => {
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

    bot.telegram.sendMessage(chatId, sendToChatId, extras).then(() => {
      debugLog("Send buildMessageWithCommands message.");
    });
  });

};

// new command method for building message with multiple commands.
if (cmdargs.newCommands) {
  debugLog("building Message With Commands");
  buildMessageWithCommands();
} else {
  // call message functions, depending on arguments
  if (cmdargs.morning) {
    debugLog("morning message");
    show_morning_message(sendToChatId);

  } else if (cmdargs.evening) {
    debugLog("evening message");
    show_evening_message(sendToChatId);

  } else if (cmdargs.diskspace) {
    debugLog("diskspace");
    getDiskSpace(diskspaceCheckLocation, sendToChatId);

  } else if (cmdargs.friday) {
    debugLog("FridayMessage");
    show_friday_message(sendToChatId);

  } else if (cmdargs.weekend) {
    debugLog("WeekendMessage");
    show_weekend_message(sendToChatId);
  }
}