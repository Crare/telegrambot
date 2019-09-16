//reminder.js

const fs = require('fs');

/*
  reminder json structure:
  {
    whenTime: date
    chatId: int id of chat,
    message: html parse-mode string,
    user_id: user id in Telegram,
    username: username in Telegram,
  }
  and this is inside reminders array [].
*/

const debug = false;

debugLog = (output) => {
  if (debug) {
    console.log(output);
  }
}

exports.setupRemindersRunning = (reminders, bot, callback) => {
  let extras = { parse_mode: 'HTML' };
  debugLog("setting up " + reminders.length + " reminders running.");
  let juhis_chat_id = "258407019";
  let output = "Setting up " + reminders.length + " reminders running.";
  bot.telegram.sendMessage(juhis_chat_id, output, extras).then(function () {
    debugLog("Message sent.");
  })
  let reminders_truncated = []; // truncated out reminders that have passed in time., we return this in callback.
  let now = new Date();
  for (let i = 0; i < reminders.length; i++) {
    // set the actual reminder
    if (reminders[i].whenTime.getTime() > now.getTime()) {
      reminders_truncated.push(reminders[i]);
    }
    getCallbackAtTime(reminders[i].whenTime, function () {
      debugLog("Time to send reminder!");
      let output = '<b>Reminder for</b> <a href="tg://user?id=' + reminders[i].user_id + '">@' + reminders[i].username + '</a>:\r\n';
      output += reminders[i].message;
      // time is up! Time to send the reminder message
      bot.telegram.sendMessage(reminders[i].chatId, output, extras).then(function () {
        debugLog("Message sent.");
      })
    })
  }
  callback(reminders_truncated);
}

exports.setupReminderRunning = (reminder, bot, callback) => {
  debugLog("setting up reminder running.");
  let extras = { parse_mode: 'HTML' };

  let output = "<b>Set reminder to: </b>\r\n";
  let hour = reminder.whenTime.getHours() < 10 ? '0' + reminder.whenTime.getHours() : reminder.whenTime.getHours();
  let minute = reminder.whenTime.getMinutes() < 10 ? '0' + reminder.whenTime.getMinutes() : reminder.whenTime.getMinutes();
  output += hour + ":" + minute + " " + reminder.whenTime.getDate() + "." + (reminder.whenTime.getMonth() + 1) + "." + reminder.whenTime.getFullYear() + "\r\n";
  output += "<b>Message:</b> \r\n" + reminder.message;
  bot.telegram.sendMessage(reminder.chatId, output, extras).then(function () {
    debugLog("Message sent.");
  })

  // set the actual reminder
  getCallbackAtTime(reminder.whenTime, function () {
    debugLog("Time to send reminder!");
    let output = '<b>Reminder for</b> <a href="tg://user?id=' + reminder.user_id + '">@' + reminder.username + '</a>:\r\n';
    output += reminder.message;
    // time is up! Time to send the reminder message
    bot.telegram.sendMessage(reminder.chatId, output, extras).then(function () {
      debugLog("Message sent.");
    })
    callback(reminder);
  })
}

exports.loadRemindersJSON = (path, callback) => {
  fs.readFile(path, function (err, data) {
    if (err) throw err;
    let reminders = JSON.parse(data);
    for (let i = 0; i < reminders.length; i++) {
      reminders[i].whenTime = new Date(reminders[i].whenTime);
    }
    callback(reminders);
  })
}

exports.createNewReminder = (chatId, user_id, username, unparsed_text, callback, errorCallback) => {
  try {
    if (isNaN(chatId)) { throw 'chatId is NaN!'; }
    if (isNaN(user_id)) { throw 'user_id is NaN!'; }
    if (typeof username != 'string') { debugLog(typeof username); throw 'username is not String!'; }
    if (typeof unparsed_text != 'string') { throw 'unparsed_text is not String!'; }
    if (callback == undefined) { throw 'callback is undefined!'; }

    // parse string
    parseInputText(unparsed_text, (remind_json) => {
      remind_json.chatId = chatId;
      remind_json.user_id = user_id;
      remind_json.username = username;
      callback(remind_json);
    }, (error_message) => {
      errorCallback(error_message);
    });

    return undefined;
  } catch (err) {
    console.error(err);
  }
}

exports.saveRemindersJSON = (json_data, path) => {
  fs.writeFile(path, JSON.stringify(json_data), function (err, data) {
    if (err) throw err;
    debugLog('Saved reminders to: ' + path);
  })
}

function getCallbackAtTime(whenTime, callback) {
  const now = new Date();
  let millisTill10 = whenTime.getTime() - now.getTime();
  if (millisTill10 < 0) {
    millisTill10 += 86400000; // it's after 10am, try 10am tomorrow.
  }
  if (whenTime.getTime() < now.getTime()) {
    millisTill10 = 0; // time has passed, call the callback
  }
  setTimeout(function () { callback() }, millisTill10);
}

function parseInputText(input_text, callback, errorCallback) {
  let text = input_text.split(' ');
  debugLog("split text: ", text)

  if (text.length > 2) {
    let when = text[1];
    let dateString = text[2];
    let strip_strings = text[0].length + 1 + text[1].length + 1 + text[2].length + 1; // the ones(+1) are spaces that get left out in split
    let message = input_text.substring(strip_strings, input_text.length); // get rest of the string as message.
    let hours;
    let minutes;
    let day;
    let month;
    let year;
    let whentime2 = undefined;

    // FIRST PARSE TIME HH:mm
    let timeString = when.split(':');

    if (timeString.length == 2) {
      debugLog("can be splitted with by ':'");
      debugLog("timeString: ", timeString);
      if (isNaN(timeString[0])) {
        errorCallback('First parameter is not a time. Please give time formatted as H:m or HH:mm');
      }
      hours = parseInt(timeString[0]);
      minutes = parseInt(timeString[1]);
      if (hours > 23) { hours = 23; }
      if (minutes > 59) { minutes = 59; }
      debugLog("hours: ", hours);
      debugLog("minutes: ", minutes);
    } else {
      // "when doesn't split by ':'
      if (when.endsWith('h')) {
        timeAmount = parseInt(when.substring(0, when.indexOf('h')))
        debugLog(timeString + " = h");
        whentime2 = new Date();
        whentime2.setHours(whentime2.getHours() + timeAmount)
      } else if (when.endsWith('min')) {
        timeAmount = parseInt(when.substring(0, when.indexOf('min')))
        debugLog(timeAmount + " = min");
        whentime2 = new Date();
        whentime2.setMinutes(whentime2.getMinutes() + timeAmount)
      } else {
        debugLog("doesn't split by ':', but isn't mins and hours!");
      }
    }

    // THEN PARSE DATE dd.MM.yyyy and also parse the message.
    let dateStringParts = [];

    let whenTime = new Date();
    if (dateString == 'today') {

    } else if (dateString == 'tomorrow') {
      whenTime.setDate(whenTime.getDate() + 1);

    } else if (whentime2 == undefined) {
      // we have date string to parse
      dateStringParts = dateString.split('.');
      debugLog("dateStringParts: ", dateStringParts);
      if (dateStringParts.length >= 2 &&
        dateStringParts.length <= 3) {
        whenTime.setDate(parseInt(dateStringParts[0]));
        whenTime.setMonth(parseInt(dateStringParts[1]) - 1);
        if (dateStringParts.length == 3 && dateStringParts[2] != '') {
          whenTime.setFullYear(parseInt(dateStringParts[2]));
        } else {
          // we assume this year.
        }
      } else {
        debugLog("we assume it's today");
        // we assume it's today
        // so message start earlier.. parse message again
        let strip_strings = text[0].length + 1 + text[1].length + 1; // the ones(+1) are spaces that get left out in split
        message = input_text.substring(strip_strings, input_text.length); // get rest of the string as message.
      }
    }

    if (whentime2 == undefined) {
      whenTime.setHours(hours);
      whenTime.setMinutes(minutes);
      whenTime.setSeconds(0);
      whenTime.setMilliseconds(0);
    } else {
      whenTime = whentime2;
      let strip_strings = text[0].length + 1 + text[1].length + 1;; // the ones(+1) are spaces that get left out in split
      message = input_text.substring(strip_strings, input_text.length); // get rest of the string as message.
    }

    let remind_json = {};
    remind_json.whenTime = whenTime;
    remind_json.message = message;

    let now = new Date();

    if (isNaN(whenTime.getTime())) {
      errorCallback('Got invalid date. \r\nWrite hours first, then date. Date format: [H:m d.M.yyyy]');

    } else if (now.getTime() > whenTime.getTime()) {
      errorCallback('Moment in time passed already.');

    } else if (whenTime.getTime() > now.getTime() && (whenTime.getTime() - now.getTime()) > 604800000) { // 604800000 is 7days in ms.
      errorCallback('Time too far or format is wrong, try to stay within 7 days reach. \r\nWrite hours first, then date. Date format: [H:m d.M.yyyy]');

    } else if (remind_json.message.length == 0) {
      errorCallback('Your message is empty. Give message after time and date.');

    } else {
      callback(remind_json); // we are good to go.
    }
  } else {
    let output = "<b>Give parameters for reminder. Date format: [H:m d.M.yyyy]</b> example: \r\n";
    output += "'/remind 10:10 today Meeting starts in five minutes!' You can also use 'tomorrow' instead of 'today'.\r\n";
    output += "or '/remind 0:0 1.1.2018 Happy new year!'.\r\n";
    output += "You can shorten that to: '/re 0:0 1.1 Happy new year!', and I assume it's this year.\r\n";
    output += "You can set reminder to remind you in hours or minutes:\r\n";
    output += "'/re 1h remember to do the thing after this meeting...'\r\n";
    output += "'/re 30min meal is done in the oven, bon appétit!'\r\n";
    output += "If you leave date out, I assume you meant today.\r\n";
    output += "Reminders are limited to next 7 days for now.\r\n";
    output += "Check how many active reminders there are with /reminders or with /res";
    errorCallback(output);
  }

}
