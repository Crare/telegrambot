/*
* bot for running commands
* This telegrambot is made by Crare. Hi! C: https://github.com/crare/telegrambot
* parsers can be found in folder ./data_parsers
* train-data from https://rata.digitraffic.fi/api/v1/doc/index.html
* weather-data from https://openweathermap.org/api
* news-data from https://yle.fi/uutiset/rss
*/

const startTime = new Date();
// first load api keys and settings:
// save your api keys in 'settings_template.json'
// and change the name to 'settings.json'.
const settings = require('./settings.json');

// get required modules.
const Telegraf = require('telegraf');
let cmdargs = require('commander');

const train_parser = require('./data_parsers/vr-trains.js');
const weather_parser = require('./data_parsers/weather.js');
const news_parser = require('./data_parsers/news3.js');
const reminder = require('./data_parsers/reminder.js');
const sunrise_sunset = require('./data_parsers/sunrise-sunset.js');
const movies = require('./data_parsers/movies.js');
const flagdays = require('./data_parsers/flagdays.js');
const ruuvi = require('./data_parsers/ruuvi.js');

// commands
cmdargs
  .version('0.0.1')
  .option('-p, --production', 'Start running bot in production version of the bot.')
  .option('-d, --debug', 'Debug, show console log')
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

// storing reminders.
let reminders = [];
let reminders_store_path = "./data/reminders_test.json";
if (cmdargs.production) {
  reminders_store_path = "./data/reminders.json";
}
//emojis
const e_train = '\u{1f686}';
const e_train2 = '\u{1F682}';

const extras_ = { parse_mode: 'Html' };


// milliseconds to more human readable format
msToHumanReadable = (ms) => {
  days = Math.floor(ms / (24 * 60 * 60 * 1000));
  daysms = ms % (24 * 60 * 60 * 1000);
  hours = Math.floor((daysms) / (60 * 60 * 1000));
  hoursms = ms % (60 * 60 * 1000);
  minutes = Math.floor((hoursms) / (60 * 1000));
  minutesms = ms % (60 * 1000);
  seconds = Math.floor((minutesms) / (1000));
  output = "";
  if (days > 0) {
    output += days + " days ";
  }
  if (hours > 0) {
    output += hours + " hours ";
  }
  if (minutes > 0) {
    output += minutes + " minutes ";
  }
  if (seconds > 0) {
    output += seconds + " seconds";
  }
  return output;
}

lastDay = (y, m) => {
  return new Date(y, m + 1, 0).getDate();
}

// HELP
bot.command(['/h', '/help', '/help@' + botName], (ctx) => {
  let output = "<b>Available commands:</b>\r\n";
  output += "/chatId to get current chat's id.\r\n";
  output += "/f Flip a coin: output heads or tails.\r\n";
  output += "/h or /help Get this help message.\r\n";
  output += "/movies get movies coming up in TV.\r\n";
  output += "/n News data from YLE.\r\n";
  output += "/p Get provinces for news areas.\r\n";
  output += "/re Set a reminder to your future self!\r\n";
  output += "/res Check how many active reminders there are.\r\n";
  output += "/sun Get sunrise and sunset.\r\n";
  output += "/t Train data VR.\r\n";
  output += "/station To get more information about train-station.\r\n";
  output += "/set_home /set_work /home /work Try these to set quick route for work-home commuting.\r\n";
  output += "/up To see how long this bot has been running.\r\n";
  output += "/w Weather data from OpenWeatherMap.\r\n";
  output += "This bot can also be setup to send daily messages, checkout the readme.\r\n";
  output += "More information can be found by writing command without parameters after it.\r\n";

  const chatId = ctx.update.message.chat.id;
  bot.telegram.sendMessage(chatId, output, extras_).then(() => {
    debugLog("Message sent.");
  })
})

//UPTIME 
bot.command(['/uptime', '/up'], (ctx) => {
  debugLog("uptime command called");
  let now = new Date();
  let uptime = now.getTime() - startTime.getTime();
  debugLog("uptime is " + uptime + " ms.");
  let output = "I've been running since " +
    ('0' + startTime.getHours()).substr(-2)
    + ":" + ('0' + startTime.getMinutes()).substr(-2)
    + " " + startTime.getDate()
    + "." + (startTime.getMonth() + 1)
    + "." + startTime.getFullYear() + "\r\n";
  output += "Uptime is " + msToHumanReadable(uptime);
  ctx.reply(output);
});

// SUN
bot.command(['/sunrise', '/sunset', '/dusk', '/dawn', '/sun'], (ctx) => {
  debugLog("sun command called");
  place = { name: settings.sun_place_name, countrycode: settings.countrycode, lat: settings.sun_at_lat, lng: settings.sun_at_lon };
  sunrise_sunset.getSunDataAtLocation(place, (sun_data) => {
    let output = "<b>Dusk till dawn at " + place.name + ":</b> \r\n";
    output += sun_data;
    const chatId = ctx.update.message.chat.id;
    const extras = { parse_mode: 'Html' };
    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      debugLog("Message sent.");
    })
  });
})

// TRAINS
bot.command(['/t', '/trains', '/junat'], (ctx) => {
  debugLog("trains command called");
  let text = ctx.update.message.text.split(' ');
  if (text.length == 1) {
    let output = "/t /trains /junat is a command to get results from and to train station.\r\n";
    output += "For example: '/trains Lahti Helsinki'\r\n";
    output += "First parameter 'Lahti' is departure station, \r\n";
    output += "and second parameter 'Helsinki' is destination.\r\n\r\n";
    output += "You can also use shortcodes for locations. \r\n";
    output += "For example: 'Lahti' is 'LH', 'Pasila' is 'PSL'. \r\n";
    output += "Get more info about certain station by: /station \r\n";
    output += "Trains are divided to locomotive trains" + e_train2 + " and long-distance trains" + e_train + " by emojis.\r\n";

    const chatId = ctx.update.message.chat.id;
    const extras = { parse_mode: 'Markdown' };
    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      debugLog("Message sent.");
    })
  } else if (text.length == 2) {
    // 1 destination
    train_parser.haeAsemanJunat(text[1], false, 10, (output) => {
      const chatId = ctx.update.message.chat.id;
      const extras = { parse_mode: 'Markdown' };
      bot.telegram.sendMessage(chatId, output, extras).then(() => {
        debugLog("Message sent.");
      })
    });
  } else if (text.length == 3) {
    // 2 destinations
    train_parser.haeJunatReitille(text[1], text[2], 10, false, (output) => {
      const chatId = ctx.update.message.chat.id;
      const extras = { parse_mode: 'Markdown' };
      bot.telegram.sendMessage(chatId, output, extras).then(() => {
        debugLog("Message sent.");
      })
    });
  } else {
    // too many parameters
    ctx.reply("Too many arguments given. Please give either 1 or two places. First one is departure station, second one is arrival station.");
  }
})

bot.command(['/sethome', '/setwork'], (ctx) => {
  debugLog("sethome / setwork command called");

  const chatId = ctx.update.message.chat.id;
  const extras = { parse_mode: 'Markdown' };

  let text = ctx.update.message.text.split(' ');
  if (text.length == 2) {
    let homeWorkLocation = { userId: ctx.update.message.from.id };
    if (text[0] == '/sethome') {
      homeWorkLocation.home = text[1];
    } else {
      homeWorkLocation.work = text[1];
    }
    train_parser.addHomeWorkLocation(homeWorkLocation, (output) => {
      bot.telegram.sendMessage(chatId, output, extras).then(() => {
        debugLog("Message sent.");
      })
    })
  } else {
    let output = "You can set home and work location for quick route by: \r\n"
      + "/sethome <station name>\r\n"
      + "/setwork <station name>\r\n"
      + "You can try searching station by /station <city name>\r\n"
      + "Then you can use quick commands for trains on that route:\r\n"
      + "/ho /home returns next 10 trains from work to home.\r\n"
      + "/wo /work returns next 10 trains from home to work.\r\n";

    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      debugLog("Message sent.");
    })
  }
})

bot.command(['/home', '/ho', '/work', '/wo'], (ctx) => {
  debugLog("/work or /home command called");

  const chatId = ctx.update.message.chat.id;
  const extras = { parse_mode: 'Markdown' };

  let text = ctx.update.message.text.split(' ');
  if (text.length == 1) {
    let directionAndUserId = { userId: ctx.update.message.from.id };
    if (text[0] == '/home' || text[0] == '/ho') {
      directionAndUserId.direction = "home";
    } else {
      directionAndUserId.direction = "work";
    }
    train_parser.getTrainsHomeWorkLocation(directionAndUserId, (output) => {
      bot.telegram.sendMessage(chatId, output, extras).then(() => {
        debugLog("Message sent.");
      })
    })
  } else {
    let output = "You can set home and work location for quick route by: \r\n"
      + "/sethome <station name>\r\n"
      + "/setwork <station name>\r\n"
      + "You can try searching station by /station <city name>\r\n"
      + "Then you can use quick commands for trains on that route:\r\n"
      + "/ho /home returns next 10 trains from work to home.\r\n"
      + "/wo /work returns next 10 trains from home to work.\r\n";

    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      debugLog("Message sent.");
    })
  }
})


// get train stations
bot.command(['/st', '/station'], (ctx) => {
  debugLog("station command called");
  let text = ctx.update.message.text.split(' ');
  if (text.length == 2) {
    let station_name = text[1];
    let haeCargoJunat = false;
    train_parser.haeAsemanTiedot(station_name, (output) => {
      const chatId = ctx.update.message.chat.id;
      const extras = { parse_mode: 'Markdown' };
      bot.telegram.sendMessage(chatId, output, extras).then(() => {
        debugLog("Message sent.");
      })
    });
  } else {
    ctx.reply("Give station name after /station for example: /station Pasila");
  }
})


// WEATHER
bot.command(['/w', '/weather', '/sää', '/saa'], (ctx) => {
  debugLog("weather command called");
  let text = ctx.update.message.text.split(' ');
  if (text.length == 1) {
    let output = "/w /weather /sää /saa is a command to get weatherdata. \r\n";
    output += "For example: '/weather Lahti' gives you weather-forecast for Lahti today.\r\n";
    const chatId = ctx.update.message.chat.id;
    const extras = { parse_mode: 'Markdown' };
    bot.telegram.sendMessage(chatId, output, extras).then(() => {
      debugLog("Message sent.");
    })
  } else if (text.length == 2) {
    let place = new Object();
    place.nimi = text[1];
    place.countrycode = "FI"; // for now
    let days = 1;
    weather_parser.getOpenWeatherData(place, days, (output) => {
      const chatId = ctx.update.message.chat.id;
      const extras = { parse_mode: 'Markdown' };
      bot.telegram.sendMessage(chatId, output, extras).then(() => {
        debugLog("Message sent.");
      })
    });
  } else {
    ctx.reply("Give only one argument as city name for weatherdata.");
  }
})

// PROVINCES = MAAKUNNAT
bot.command(['/p', '/provinces'], (ctx) => {
  debugLog("provinces command called");
  news_parser.getProvinces((provinces_output) => {
    const chatId = ctx.update.message.chat.id;
    const extras = { parse_mode: 'Markdown' };
    bot.telegram.sendMessage(chatId, provinces_output, extras).then(() => {
      debugLog("Message sent.");
    })
  });
})

// NEWS
bot.command(['/n', '/news', '/uutiset'], (ctx) => {
  debugLog("news command called");
  let text = ctx.update.message.text.split(' ');
  if (settings.newsDefaultLanguage == "" || text.length == 1 || text.length >= 4) {
    news_parser.getHelpMessage((output) => {
      const chatId = ctx.update.message.chat.id;
      const extras = { parse_mode: 'Markdown' };
      bot.telegram.sendMessage(chatId, output, extras).then(() => {
        debugLog("Message sent.");
      })
    });
  } else if (text.length == 2 || text.length == 3) {
    let lang = text[1];
    let province = text[2];

    news_parser.getYleNews(province, lang, 10, (output) => {
      debugLog(output);
      //ctx.reply(output);
      const chatId = ctx.update.message.chat.id;
      const extras = { parse_mode: 'Markdown' };
      bot.telegram.sendMessage(chatId, output, extras).then(() => {
        debugLog("Message sent.");
      })
    });
  }
});

// FLIP A COIN
bot.command(['/f', '/flip', '/flipcoin', '/heads', '/tails'], (ctx) => {
  debugLog("flipping coin command called");
  let output = "";
  let side = Math.random(); // 0-1
  debugLog("side: " + side);
  if (side > 0.5) {
    output = "Heads";
  } else {
    output = "Tails";
  }
  ctx.reply(output)
})

// TEST
bot.command(['/test'], (ctx) => {
  debugLog("test command called");
  const chatId = ctx.update.message.chat.id;
  let output = '<b>bold</b>, <strong>bold</strong>\r\n';
  output += '<i>italic</i>, <em>italic</em>\r\n';
  output += '<a href="http://www.example.com/">inline URL</a>\r\n';
  output += '<a href="tg://user?id=258407019">inline mention of a user</a>\r\n';
  output += '<code>inline fixed-width code</code>\r\n';
  output += '<pre>pre-formatted fixed-width code block</pre>\r\n';

  bot.telegram.sendMessage(chatId, output, extras_).then(() => {
    debugLog("Message sent.");
  })
})

// load reminders
reminder.loadRemindersJSON(reminders_store_path, (reminders_array) => {
  reminders = reminders_array;
  debugLog("loaded " + reminders.length + " reminders");
  if (reminders.length > 0) {
    reminder.setupRemindersRunning(reminders, bot, (reminders_truncated) => {
      reminders = reminders_truncated; // truncated out reminders that have been already passed.
      reminder.saveRemindersJSON(reminders, reminders_store_path);

      const chatId = "258407019"; // send Juho a message for debugging
      let output = "<b>" + reminders.length + " reminders running active.</b>";
      bot.telegram.sendMessage(chatId, start_message, extras_).then(() => {
        debugLog("Message sent.");
      })
    });
  }
});

// REMINDER
bot.command(['/remind', '/re'], (ctx) => {
  debugLog("remind command called");
  //debugLog(ctx.message);
  let chatId = ctx.update.message.chat.id;
  let user_id = ctx.message.from.id;
  let username = ctx.message.from.username;
  if (username == undefined) {
    // no username, use firstname
    username = ctx.message.from.first_name;
  }
  let unparsed_text = ctx.update.message.text;

  try {
    reminder.createNewReminder(chatId, user_id, username, unparsed_text, (reminder_obj) => {
      //debugLog(reminder_obj);
      reminders.push(reminder_obj);
      reminder.saveRemindersJSON(reminders, reminders_store_path);

      reminder.setupReminderRunning(reminder_obj, bot, (reminder_obj) => {
        // reminder has been called.
        if (reminders.indexOf(reminder_obj) != -1) {
          // remove called reminder from reminders
          reminders = reminders.splice(reminders.indexOf(reminder_obj) - 1, 1);
          reminder.saveRemindersJSON(reminders, reminders_store_path);
        }
      });
    }, (err) => {
      bot.telegram.sendMessage(chatId, err, extras_).then(() => {
        debugLog("Error message sent.");
      })
    });
  } catch (err) {
    console.error(err);
  }
});

bot.command(['/reminders', '/res'], (ctx) => {
  debugLog("reminders command called");
  let chatId = ctx.update.message.chat.id;
  let output = "There is ";
  if (reminders.length <= 0) {
    output += "no reminders active.";
  } else if (reminders.length == 1) {
    output += reminders.length + " reminder active.";
  } else {
    output += reminders.length + " reminders active.";
  }
  bot.telegram.sendMessage(chatId, output, extras_).then(() => {
    debugLog("Message sent.");
  })
});

// Get movies on TV
bot.command(['/movies', '/films'], (ctx) => {
  debugLog("get movies called");
  let chatId = ctx.update.message.chat.id;
  let useHtmlMarkdown = true;
  let only_today = false;
  movies.getMoviesOnTV(useHtmlMarkdown, only_today, (output) => {
    bot.telegram.sendMessage(chatId, output, extras_).then(() => {
      debugLog("Movies message sent.");
    })
  })
})

// get chat id
bot.command(['/chatId', '/id'], (ctx) => {
  debugLog("This chat's id is: " + ctx.update.message.chat.id);
  ctx.reply("This chat's id is: " + ctx.update.message.chat.id);
});


// get flagging-day today
bot.command(['/flag', '/flagday'], (ctx) => {
  debugLog("flagday command called.");
  flagdays.getFlagdayToday((output) => {
    ctx.reply(output);
  });
});

// get ruuvitag info
bot.command(['/tag', '/ruuvi', '/ruuvitag'], (ctx) => {
  debugLog("ruuvitag command called.");
  let tag = { id: settings.ruuvitag_id, name: settings.ruuvitag_name };
  let chatId = ctx.update.message.chat.id;
  ruuvi.getRuuviTagData(tag, (output) => {
    debugLog(output);
    bot.telegram.sendMessage(chatId, output, extras_).then(() => {
      debugLog("Movies message sent.");
    })
  })
});





// handle errors, this won't find them all, only the ones that throw error.
bot.catch((err) => {
  debugLog('Ooops error happened!')
  console.error(err);
})

debugLog("bot running!");
bot.startPolling()

if (sendToChatId && sendToChatId != "") {
  // send message chat that the bot is running.
  const start_message = "Bot started running! Check command /help for commands and more information.";
  bot.telegram.sendMessage(sendToChatId, start_message, extras_).then(() => {
    debugLog("Message sent.");
  })
} else {
  console.log("No ChatId setup. Please send command /chatId to the bot and save the id to the settings.json.");
}