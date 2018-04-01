/*
* juhis_bot.js made by Juho. Hi! C: https://github.com/crare/telegrambot
* parsers can be found in folder ./data_parsers
* train-data from https://rata.digitraffic.fi/api/v1/doc/index.html
* weather-data from https://openweathermap.org/api
* news-data from https://yle.fi/uutiset/rss
* happenings from http://www.webcal.fi/fi-FI/kalenterit.php
*/

// first load api keys and settings:
// save your api keys in 'settings_template.json'
// and change the name to 'settings.json'.
const fs = require('fs')
settings = JSON.parse(fs.readFileSync('./settings.json'));

// get required modules.
const Telegraf = require('telegraf');
let cmdargs = require('commander');
const diskspace = require('diskspace');
let diskspace_path = "/var/www/html/";
//const fs = require('fs'); // used for saving error logs in /tmp

const train_parser = require('./data_parsers/vr-trains.js');
const weather_parser = require('./data_parsers/weather.js');
const news_parser = require('./data_parsers/news3.js');
const voice_recognition = require('./data_parsers/voice_recognition.js');
const giphy_handler = require('./data_parsers/giphy.js');
const reminder = require('./data_parsers/reminder.js');
const sunrise_sunset = require('./data_parsers/sunrise-sunset.js');
const movies = require('./data_parsers/movies.js');

// commands
cmdargs
  .version('0.0.1')
  .option('-t, --test', 'Start running test version of the bot.')
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
let api_key_openweathermap = settings.openweathermap;
let api_key_watson_username = settings.watson_username;
let api_key_watson_password = settings.watson_password;
let api_key_giphy = settings.giphy;
// and set them.
weather_parser.setApiKey(api_key_openweathermap);
voice_recognition.setApiKey(api_key_watson_username, api_key_watson_password, botToken);
giphy_handler.setApiKey(api_key_giphy);

// storing reminders.
let reminders = [];
let reminders_store_path = "./data/reminders.json";
if(cmdargs.test) {
  reminders_store_path = "./data/reminders_test.json";
}
//emojis
var e_train   = '\u{1f686}';
var e_train2   = '\u{1F682}';

// milliseconds to more human readable format
msToHumanReadable = (ms) => {
    days = Math.floor(ms / (24*60*60*1000));
    daysms=ms % (24*60*60*1000);
    hours = Math.floor((daysms)/(60*60*1000));
    hoursms=ms % (60*60*1000);
    minutes = Math.floor((hoursms)/(60*1000));
    minutesms=ms % (60*1000);
    seconds = Math.floor((minutesms)/(1000));
    output = "";
    if(days > 0) {
        output += days + " days ";
    }
    if(hours > 0) {
        output += hours + " hours ";
    }
    if(minutes > 0) {
        output += minutes + " minutes ";
    }
    if(seconds > 0) {
        output += seconds + " seconds";
    }
    return output;
}

lastDay = (y,m) => {
  return new Date(y, m +1, 0).getDate();
}

// HELP
bot.command(['/h', '/help', '/help@'+botName], (ctx) => {
  let output = "<b>Available commands:</b>\r\n";
  output += "/ds Check diskspace at /var/www/html.\r\n";
  output += "/f Flip a coin: output heads or tails.\r\n";
  output += "/gif Get gifs! \r\n";
  output += "/h Get this help message. \r\n";
  output += "/movies get movies coming up in TV.\r\n";
  output += "/n News data from YLE. \r\n";
  output += "/p Get provinces for news areas. \r\n";
  output += "/re Set a reminder to your future self!\r\n";
  output += "/res Check how many active reminders there are.\r\n";
  output += "/rg Get random gif. You can add tag as parameter to narrow results to that tag.\r\n";
  output += "/sun Get sunrise and sunset at Lahti, FI. \r\n";
  output += "/t Train data VR. \r\n";
  output += "/up To see how long this bot has been running. \r\n";
  output += "/w Weather data from OpenWeatherMap. \r\n";
  output += "You can record voice message and Watson(Microsoft, Azure) tries to recognize it. \r\n";
  output += "This bot also sends daily messages about news-, train- and weather- data in mornings(at 7am mon-fri, 9am weekends) and afternoon(15:45 mon-fri)\r\n";
  output += "More information can be found by writing command without parameters after it.\r\n";

  var chatId = ctx.update.message.chat.id;
  var extras = {parse_mode: 'Html'};
  bot.telegram.sendMessage(chatId, output, extras).then(function() {
    console.log("Message sent.");
  })
})

//UPTIME 
const startTime = new Date();
bot.command(['/uptime', '/up'], (ctx) => {
    console.log("uptime command called");
    let now = new Date();
    let uptime = now.getTime() - startTime.getTime();
    console.log("uptime is " + uptime + " ms.");
    var output = "I've been running since " + startTime.getHours() +":" + startTime.getMinutes() + " " + startTime.getDate() + "." + (startTime.getMonth()+1) + "." + startTime.getFullYear() + "\r\n";
    output += "Uptime is " + uptime + " ms.\r\n";
    output += "= " + msToHumanReadable(uptime);
    ctx.reply(output);
});

// SUN
bot.command(['/sunrise', '/sunset', '/dusk', '/dawn', '/sun'], (ctx)=> {
  console.log("sun command called");
  place = { nimi: "Lahti", countrycode: "FI", lat: 60.9827, lng: 25.6612};
  sunrise_sunset.getSunDataAtLocation(place, function(sun_data) {
    var output = "<b>Dusk till dawn at Lahti, Finland:</b> \r\n";
        output += sun_data;
    var chatId = ctx.update.message.chat.id;
    var extras = {parse_mode: 'Html'};
    bot.telegram.sendMessage(chatId, output, extras).then(function() {
      console.log("Message sent.");
    })
  });
})

// TRAINS
bot.command(['/t', '/trains', '/junat'], (ctx) => {
  console.log("trains command called");
  let text = ctx.update.message.text.split(' ');
  if(text.length == 1) {
    var output = "/t /trains /junat is a command to get results from and to train station.\r\n";
    output += "For example: '/trains Lahti Helsinki'\r\n";
    output += "First parameter 'Lahti' is departure station, \r\n";
    output += "and second parameter 'Helsinki' is destination.\r\n\r\n";
    output += "You can also use shortcodes for locations. \r\n";
    output += "For example: 'Lahti' is 'LH', 'Pasila' is 'PSL'. \r\n";
    output += "Get more info about certain station by: /station \r\n";
    output += "Trains are divided to locomotive trains"+e_train2+" and long-distance trains"+e_train+" by emojis.\r\n";

    var chatId = ctx.update.message.chat.id;
    var extras = {parse_mode: 'Markdown'};
    bot.telegram.sendMessage(chatId, output, extras).then(function() {
      console.log("Message sent.");
    })
  } else if(text.length == 2) {
    // 1 destination
    train_parser.haeAsemanJunat(text[1], false, 10, (output) => {
      var chatId = ctx.update.message.chat.id;
      var extras = {parse_mode: 'Markdown'};
      bot.telegram.sendMessage(chatId, output, extras).then(function() {
        console.log("Message sent.");
      })
    });
  } else if (text.length == 3) {
    // 2 destinations
    train_parser.haeJunatReitille(text[1], text[2], 10, false, (output) => {
      var chatId = ctx.update.message.chat.id;
      var extras = {parse_mode: 'Markdown'};
      bot.telegram.sendMessage(chatId, output, extras).then(function() {
        console.log("Message sent.");
      })
    });
  } else {
    // too many parameters
    ctx.reply("Too many arguments given. Please give either 1 or two places. First one is departure station, second one is arrival station.");
  }
})

// WEATHER
bot.command(['/w', '/weather', '/sää', '/saa'], (ctx) => {
  console.log("weather command called");
  let text = ctx.update.message.text.split(' ');
  if(text.length == 1) {
    var output = "/w /weather /sää /saa is a command to get weatherdata. \r\n";
    output += "For example: '/weather Lahti' gives you weather-forecast for Lahti today.\r\n";
    var chatId = ctx.update.message.chat.id;
    var extras = {parse_mode: 'Markdown'};
    bot.telegram.sendMessage(chatId, output, extras).then(function() {
      console.log("Message sent.");
    })
  } else if (text.length == 2) {
    var place = new Object();
    place.nimi = text[1];
    place.countrycode = "FI"; // for now
    let days = 1;
    weather_parser.getOpenWeatherData(place, days, (output) => {
      var chatId = ctx.update.message.chat.id;
      var extras = {parse_mode: 'Markdown'};
      bot.telegram.sendMessage(chatId, output, extras).then(function() {
        console.log("Message sent.");
      })
    });
  } else {
    ctx.reply("Give only one argument as city name for weatherdata.");
  }
})

// PROVINCES = MAAKUNNAT
bot.command(['/p', '/provinces'], (ctx) => {
  console.log("provinces command called");
  news_parser.getProvinces(function (provinces_output) {
    var chatId = ctx.update.message.chat.id;
    var extras = {parse_mode: 'Markdown'};
    bot.telegram.sendMessage(chatId, provinces_output, extras).then(function() {
      console.log("Message sent.");
    })
  });
})

// NEWS
bot.command(['/n', '/news', '/uutiset'], (ctx) => {
  console.log("news command called");
  let text = ctx.update.message.text.split(' ');
  if(text.length == 1 || text.length >= 4) {
    news_parser.getHelpMessage(function(output) {
      var chatId = ctx.update.message.chat.id;
      var extras = {parse_mode: 'Markdown'};
      bot.telegram.sendMessage(chatId, output, extras).then(function() {
        console.log("Message sent.");
      })
    });
  } else if(text.length == 2 || text.length == 3) {
    let lang = text[1];
    let province = text[2];

    news_parser.getYleNews(province, lang, 10, (output) => {
      console.log(output);
      //ctx.reply(output);
      var chatId = ctx.update.message.chat.id;
      var extras = {parse_mode: 'Markdown'};
      bot.telegram.sendMessage(chatId, output, extras).then(function() {
        console.log("Message sent.");
      })
    });
  }
});

// FLIP A COIN
bot.command(['/f', '/flip', '/flipcoin', '/heads', '/tails'], (ctx) => {
  console.log("flipping coin command called");
  let output = "";
  let side = Math.random(); // 0-1
  console.log("side: " + side);
  if (side > 0.5) {
    output = "Heads";
  } else {
    output = "Tails";
  }
  ctx.reply(output)
})

// TEST
bot.command(['/test'], (ctx)=> {
  console.log("test command called");
  var chatId = ctx.update.message.chat.id;
  var extras = {parse_mode: 'HTML'};
  var output = '<b>bold</b>, <strong>bold</strong>\r\n';
  output += '<i>italic</i>, <em>italic</em>\r\n';
  output += '<a href="http://www.example.com/">inline URL</a>\r\n';
  output += '<a href="tg://user?id=258407019">inline mention of a user</a>\r\n';
  output += '<code>inline fixed-width code</code>\r\n';
  output += '<pre>pre-formatted fixed-width code block</pre>\r\n';

  bot.telegram.sendMessage(chatId, output, extras).then(function() {
    console.log("Message sent.");
  })
})

// VOICE MESSAGE, telegram bot sees voice-message in chat
bot.on('voice', (ctx) => {
  console.log("voice message found");
  let username = ctx.message.from.username;
  console.log("Got voice message from @" + username);
  console.log("Loading the audio file...");

  voice_recognition.getFile(ctx.message.voice.file_id, function(localpath) {

    console.log("File loaded. sending the audio to Watson...");
    console.log("localpath: " + localpath);
    voice_recognition.speechToText(localpath, function(result) {

      console.log("Watson found keywords: ");
      console.log(result.keywords);
      console.log("Watson returned the message:");
      console.log(result.text + "\n");

      if(result.text != undefined) {
        ctx.reply("Watson thinks @" + username + " said: " + result.text);
      } else {
        ctx.reply("Couldn't get Watson results, please try again.");
      }
    });
  });
});

// get gifs
bot.command(['/gif'], (ctx) => {
  console.log("gif command called");
  var chatId = ctx.update.message.chat.id;
  let text = ctx.update.message.text.split(' ');

  if (text.length == 2) {

    let query = text[1];
    let amount = 1;

    giphy_handler.getGifs(query, amount, function(gif_urls) {
      for(let i = 0; i < gif_urls.length; i++) {
        let photo = gif_urls[i];
        bot.telegram.sendDocument(chatId, photo).then(function() {
          console.log("Message sent.");
        })
      }
    })
  } else if (text.length == 3) {

    let query = text[1];
    let amount = text[2];

    giphy_handler.getGifs(query, amount, function(gif_urls) {
      for(let i = 0; i < gif_urls.length; i++) {
        let photo = gif_urls[i];
        if(photo == undefined) {
            console.log("undefined photo url!");
        } else {
          bot.telegram.sendDocument(chatId, photo).then(function() {
            console.log("Message sent.");
          })
        }
      }
      if(gif_urls.length < amount) {
        ctx.reply("Didn't find " + (amount - gif_urls.length) + "/" + amount + " gifs, sorry!");
      }
    })
  } else {
      ctx.reply("Give parameter as searchword for gifs. example: '/gif cats' or '/gif dogs 3' if you want multiple just add number at the end(limit 10).");
  }
});


// get random gifs
bot.command(['/randomgif', '/rg'], (ctx) => {
  console.log("random gif command called");
  var chatId = ctx.update.message.chat.id;
  let text = ctx.update.message.text.split(' ');
  let tag = undefined;
  if (text.length == 2) {
    tag = text[1];
  }
  giphy_handler.getRandomGif(tag, function(gif) {
    if(gif != undefined) {
      bot.telegram.sendDocument(chatId, gif).then(function() {
        console.log("Message sent.");
      })
    }
  });
});

// load reminders
reminder.loadRemindersJSON(reminders_store_path, (reminders_array) => {
  reminders = reminders_array;
  console.log("loaded " + reminders.length + " reminders");
  if(reminders.length > 0) {
    reminder.setupRemindersRunning(reminders, bot, (reminders_truncated) => {
      reminders = reminders_truncated; // truncated out reminders that have been already passed.
      reminder.saveRemindersJSON(reminders, reminders_store_path);

      var chatId = "258407019"; // send Juho a message for debugging
      var output = "<b>" + reminders.length + " reminders running active.</b>";
      bot.telegram.sendMessage(chatId, start_message, extras).then(function() {
        console.log("Message sent.");
      })
    });
  }
});

// REMINDER
bot.command(['/remind', '/re'], (ctx) => {
  console.log("remind command called");
  //console.log(ctx.message);
  let chatId = ctx.update.message.chat.id;
  let user_id = ctx.message.from.id;
  let username = ctx.message.from.username;
  if (username == undefined) {
    // no username, use firstname
    username = ctx.message.from.first_name;
  }
  let unparsed_text = ctx.update.message.text;
  let extras = {parse_mode: 'HTML'};

  try {
    reminder.createNewReminder(chatId, user_id, username, unparsed_text, function(reminder_obj) {
      //console.log(reminder_obj);
      reminders.push(reminder_obj);
      reminder.saveRemindersJSON(reminders, reminders_store_path);

      reminder.setupReminderRunning(reminder_obj, bot, (reminder_obj) => {
        // reminder has been called.
        if(reminders.indexOf(reminder_obj) != -1) {
          // remove called reminder from reminders
          reminders = reminders.splice(reminders.indexOf(reminder_obj)-1, 1);
          reminder.saveRemindersJSON(reminders, reminders_store_path);
        }
      });
    }, function(err) {
      bot.telegram.sendMessage(chatId, err, extras).then(function() {
          console.log("Error message sent.");
        })
    });
  } catch(err) {
    console.error(err);
  }
});

bot.command(['/reminders', '/res'], (ctx) => {
  console.log("reminders command called");
  let chatId = ctx.update.message.chat.id;
  let output = "There is ";
  if (reminders.length <= 0) {
    output += "no reminders active.";
  } else if(reminders.length == 1) {
    output += reminders.length + " reminder active.";
  } else {
    output += reminders.length + " reminders active.";
  }
  let extras = {parse_mode: 'HTML'};
  bot.telegram.sendMessage(chatId, output, extras).then(function() {
    console.log("Message sent.");
  })
});

// removes keyboard. (because messing around is fun, and then you have to clean it up.)
/*bot.command(['/removeKeyboard'], (ctx) => {
 var chatId = ctx.update.message.chat.id;
    var extras = {reply_markup: {remove_keyboard: true}};
    var output = 'Removed keyboard!';
    bot.telegram.sendMessage(chatId, output, extras).then(function() {
     console.log("Message sent. Keyboard removed.");
   })
});*/

bytesToSize = (bytes) => {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

bot.command(['/space', '/disk', '/diskspace', '/ds'], (ctx) => {
  let chatId = ctx.update.message.chat.id;
  diskspace.check(diskspace_path, function (err, result)
  { 
    let output = "*Diskspace at* " + diskspace_path + "\r\n";
    output += "*Total:* " + bytesToSize(result.total) + " 100% \r\n";
    output += "*Used:* " + bytesToSize(result.used) + " " + ((result.used/result.total) * 100).toFixed(2) + "% " + "\r\n";
    output += "*Free:*  " + bytesToSize(result.free) + " " + ((result.free/result.total) * 100).toFixed(2) + "% " + "\r\n";
    output += "*Status:* " + result.status + "\r\n";

    var extras = {parse_mode: 'Markdown'};
    bot.telegram.sendMessage(chatId, output, extras).then(function() {
      console.log("Send diskspace message.");
    })
  });
})



// Get movies on TV 2
bot.command(['/movies2', '/films2'], (ctx) => {
  console.log("get movies2 called");
  let chatId = ctx.update.message.chat.id;
  movies.getAmpparitMoviesOnTV( (output) => {
    let extras = {parse_mode: 'Html'};
    bot.telegram.sendMessage(chatId, output, extras).then(function() {
      console.log("Movies message sent.");
    })
  })
})

// Get movies on TV
bot.command(['/movies', '/films'], (ctx) => {
  console.log("get movies called");
  let chatId = ctx.update.message.chat.id;
  movies.getMoviesOnTV( (output) => {
    let extras = {parse_mode: 'Html'};
    bot.telegram.sendMessage(chatId, output, extras).then(function() {
      console.log("Movies message sent.");
    })
  })
})



// handle errors, this won't find them all, only the ones that throw error.
bot.catch((err) => {
  console.log('Ooops error happened!')
  console.error(err);
})

console.log("bot running!");
bot.startPolling()

// send message chat that the bot is running.
var extras = {parse_mode: 'Html'};
var start_message = "bot started running!";
bot.telegram.sendMessage(sendToChatId, start_message, extras).then(function() {
  console.log("Message sent.");
})
