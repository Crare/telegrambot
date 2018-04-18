/* 
* This telegrambot is made by Juho. Hi! C: https://github.com/crare/telegrambot
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
const fs = require('fs'); // used for saving error logs in /tmp
settings = JSON.parse(fs.readFileSync('./settings.json'));

let cmdargs = require('commander');
var diskspace = require('diskspace');

const train_parser = require('./data_parsers/vr-trains.js');
const weather_parser = require('./data_parsers/weather.js');
const news_parser = require('./data_parsers/news2.js');
const giphy_handler = require('./data_parsers/giphy.js');
const sunrise_sunset = require('./data_parsers/sunrise-sunset.js');
const happenings = require('./data_parsers/happenings.js');

// commands
cmdargs
  .version('0.0.1')
  .option('--test', 'send messages to test bot instead of production bot.')
  .option('--morning', 'Show morning message')
  .option('--evening', 'Show evening message')
  .option('--friday', 'Show friday message')
  .option('--weekend', 'Show weekend message')
  .option('--diskspace', 'Displays diskspace at /var/www/html/ used,total,free space.')
.parse(process.argv);

// setup bot
let botToken = settings.prod_bot_key;
let sendToChatId = settings.productionChatId;
let botName = settings.botName;
if(cmdargs.test) {
  botToken = settings.test_bot_key;
  sendToChatId = settings.testChatId;
  botName = settings.testBotName;
}
const bot = new Telegraf(botToken)

// setup api keys
weather_parser.setApiKey(settings.openweathermap);
giphy_handler.setApiKey(settings.giphy);

// storing reminders.
let reminders = [];
let reminders_store_path = "./data/reminders.json";
if(cmdargs.test) {
  reminders_store_path = "./data/reminders_test.json";
}

let testChatId = settings.testChatId;
let productionChatId = settings.productionChatId;
let happenings_json_path = "./data_parsers/happenings.json";
let diskspaceCheckLocation = "/var/www/html/";

// Default language for news if not given. Possible languages are: en, fi, ru, sa, simplefi
let defaultLang = "en";

let morning_greetings = settings.morning_greetings;

getDayName = (index) => {
  // quick handling of day names, could be made otherway but this was fast to do.
  switch (index) {
    case 0:
      return "Sunday";
      break;
    case 1:
      return "Monday";
      break;
    case 2:
      return "Tuesday";
      break;
    case 3:
      return "Wednesday";
      break;
    case 4:
      return "Thursday";
      break;
    case 5:
      return "Friday";
      break;
    case 6:
      return "Saturday";
      break;
    default:
      return "Unknown day index";
      break;
  }
}

getWeekNumber = () => {
  // https://weeknumber.net/how-to/javascript
  var date = new Date();
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

show_morning_message = (chatId) => {
  console.log("setting daily morning message.");
  var place = { nimi: "Lahti", countrycode: "FI", lat: 60.9827, lng: 25.6612};

  weather_parser.getOpenWeatherData(place, 1, (weather_forecast) => {
    train_parser.haeJunatReitille("Pasila", "Lahti", 5, false, (trains) => {
      news_parser.getYleNews(undefined, defaultLang, 5, (news) => {
        sunrise_sunset.getSunDataAtLocation(place, (sun_data) => {
          happenings.getHappeningsTodayString( (happenings_string) => {

            // get random morning message
            var output = "";
            var rand_i = Math.floor(Math.random() * morning_greetings.length);
            output += "" + morning_greetings[rand_i] + "\r\n";
            console.log(morning_greetings[rand_i]);
            console.log(rand_i);

            var date = new Date();
            hours = date.getHours();
            if(hours < 10) {hours = "0"+hours;}
            minutes = date.getMinutes()
            if(minutes < 10) {minutes = "0"+minutes;}

            let week_number = getWeekNumber();
            output += "*Today is " + getDayName(date.getDay()) + " " + date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + ". Week "+ week_number + ".*\r\n";
            output += happenings_string + "\r\n";
            output += weather_forecast + "\r\n";
            output += sun_data + "\r\n\r\n";
            output += trains + "\r\n";
            output += news;

            var extras = {parse_mode: 'Markdown'};
            bot.telegram.sendMessage(chatId, output, extras).then(() => {
              console.log("Send daily message.");
              if(date.getDay() == 1 || cmdargs.test) { // 1 == monday
                giphy_handler.getRandomGif("monday", (gif) => {
                  if(gif != undefined) {
                    bot.telegram.sendDocument(chatId, gif).then(() => {
                      console.log("Send monday gif.");
                    })
                  }
                });
              }
            });

          });
        });
      });
    });
  });
}

show_friday_message = (chatId) => {
  console.log("setting friday message.");
  var place = new Object();
  place.nimi = "Lahti";
  place.countrycode = "FI"; // for now

  weather_parser.getOpenWeatherData(place, 3, (weather_forecast) => {
    train_parser.haeJunatReitille("Lahti", "Pasila", 10, false, (trains) => {
       news_parser.getYleNews(undefined, defaultLang, 5, (news) => {

        var output = "*IT'S FRIDAY YAY!" + "*\r\n";
        output += weather_forecast + "\r\n";
        output += trains + "\r\n";
        output += news;

        var extras = {parse_mode: 'Markdown'};
        bot.telegram.sendMessage(chatId, output, extras).then(() => {

          console.log("Send friday message.");
          giphy_handler.getRandomGif("friday", (gif) => {

            if(gif != undefined) {
              bot.telegram.sendDocument(chatId, gif).then(() =>{
                console.log("Send friday gif.");
              })
            }

          });
        })
      });
    });
  });
}

show_weekend_message = (chatId) => {
  console.log("setting weekend message.");
  var paikka = new Object();
  paikka.nimi = "Lahti";
  paikka.countrycode = "FI"; // for now

  weather_parser.getOpenWeatherData(paikka, 2, (weather_forecast_lahti) => {

    var paikka = new Object();
    paikka.nimi = "Helsinki";
    paikka.countrycode = "FI"; // for now

    weather_parser.getOpenWeatherData(paikka, 2, (weather_forecast_helsinki) => {
      happenings.getHappeningsTodayString( (happenings_string) => {
        news_parser.getYleNews(undefined, defaultLang, 5, (news) => {

          var output = "*Have a nice weekend!" + "*\r\n";
          output += happenings_string + "\r\n";
          output += weather_forecast_helsinki + "\r\n";
          output += weather_forecast_lahti + "\r\n";
          output += news;

          var extras = {parse_mode: 'Markdown'};
          bot.telegram.sendMessage(chatId, output, extras).then(() => {
            console.log("Send weekend message.");
          })

        });
      });
    });
  });
}

show_evening_message = (chatId) => {
  console.log("setting daily evening message.");
  var place = new Object();
  place.nimi = "Lahti";
  place.countrycode = "FI"; // for now

  weather_parser.getOpenWeatherData(place, 2, (weather_forecast) => {
    train_parser.haeJunatReitille("Lahti", "Pasila", 10, false, (trains) => {
       news_parser.getYleNews(undefined, defaultLang, 5, (news) => {

        var output = "*Good afternoon!" + "*\r\n";
        output += weather_forecast + "\r\n";
        output += trains + "\r\n";
        output += news;
        var extras = {parse_mode: 'Markdown'};

        bot.telegram.sendMessage(chatId, output, extras).then(() => {
          console.log("Send daily iltapaiva message.");
        })
      });
    });
  });
}

bytesToSize = (bytes) => {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

getDiskSpace = (path, chatId) => {
  diskspace.check(path, (err, result) => { 
    let output = "*Hello this is diskspace information:*\r\n";
    output += "*Diskspace at* " + path + "\r\n";
    output += "*Total:* " + bytesToSize(result.total) + " 100% \r\n";
    output += "*Used:* " + bytesToSize(result.used) + " " + ((result.used/result.total) * 100).toFixed(2) + "% " + "\r\n";
    output += "*Free:*  " + bytesToSize(result.free) + " " + ((result.free/result.total) * 100).toFixed(2) + "% " + "\r\n";
    output += "*Status:* " + result.status + "\r\n";

    var extras = {parse_mode: 'Markdown'};
    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      console.log("Send diskspace message.");
    })
  });
}

// call message functions, depending on arguments
if(cmdargs.morning) {
  console.log("morning message");
  show_morning_message(sendToChatId);

} else if (cmdargs.evening) {
  console.log("evening message");
  show_evening_message(sendToChatId);

} else if (cmdargs.diskspace) {
  console.log("diskspace");
  getDiskSpace(diskspaceCheckLocation, sendToChatId);

} else if (cmdargs.friday) {
  console.log("FridayMessage");
  show_friday_message(sendToChatId);

} else if (cmdargs.weekend) {
  console.log("WeekendMessage");
  show_weekend_message(sendToChatId);
}
