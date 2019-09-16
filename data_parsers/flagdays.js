
const fs = require('fs');

getFlagdays = (callback) => {
  fs.readFile('./data_parsers/flagdays_finland.json', 'utf8', (err, data) => {
    if (err) throw err;
    data = JSON.parse(data);
    for (let i = 0; i < data.length; i++) {
      data[i].date = new Date(data[i].date);
    }
    callback(data);
  });
}

exports.getFlagdayToday = (callback) => {
  getFlagdays((flagdays) => {
    let today = new Date();
    let flagday = undefined;
    for (let i = 0; i < flagdays.length; i++) {
      if (flagdays[i].date.getDate() == today.getDate() &&
        flagdays[i].date.getMonth() == today.getMonth()) {
        // console.log(flagdays[i]);
        flagday = flagdays[i];
      }
    }
    let output = "";
    if (flagday != undefined) {
      output = "Today is flagday: \r\n";
      output += flagday.name;
    } else {
      output = "Today is not flagday."
    }
    callback(output);
  });
}