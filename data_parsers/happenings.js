// get_happenings.js

const fs = require('fs');

loadHappenings = (callback) => {
  fs.readFile('./data_parsers/happenings.json', (err, data) => {
    if (err) throw err;
    happenings = JSON.parse(data);
    for (let k = 0; k < happenings.length; k++) {
      happenings[k].date = new Date(happenings[k].date);
    }
    callback(happenings);
  });
}

getHappeningsTodayJSON = (callback) => {
  loadHappenings((happenings) => {
    let now = new Date();
    today_happen = [];
    for (let i = 0; i < happenings.length; i++) {
      if (happenings[i].date.getMonth() === now.getMonth() &&
        happenings[i].date.getDate() === now.getDate()) {
        // today's happening
        today_happen.push(happenings[i]);
      }
    }
    callback(today_happen);
  });
}

exports.getHappeningsTodayString = (callback) => {
  getHappeningsTodayJSON((happenings_today) => {
    if (happenings_today.length > 0) {
      output = "*Special day today:* \r\n";
      for (let j = 0; j < happenings_today.length; j++) {
        output += happenings_today[j].name;
        if (happenings_today[j].country) {
          output += " (" + happenings_today[j].country + ")";
        }
        output += "\r\n";
      }
      callback(output);
    } else {
      callback("No special day today.");
    }
  });
}

/*
exports.getHappeningsThisWeek = () => {

}

exports.getHappeningsThisMonth = () => {

}

exports.getHappeningsThisYear = () => {

}*/