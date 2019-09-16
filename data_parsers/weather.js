// weather.js made by Juho.
// documentation for openweathermapAPI: http://openweathermap.org/

const http = require('http');
const { URL } = require('url');

const settings = require('../settings.json');
let openweathermapAPI = settings.openweathermap;

/*  preserve:start */
//Openweathermap Weather codes and corressponding emojis
const thunderstorm = '\u{1F4A8}' // Code: 200's, 900, 901, 902, 905
const drizzle = '\u{1F4A7}' // Code: 300's
const rain = '\u{02614}' // Code: 500's
const snowflake = '\u{02744}' // Code: 600's snowflake
const snowman = '\u{026C4}' // Code: 600's snowman, 903, 906
const atmosphere = '\u{1F301}' // Code: 700's foogy
const clearSky = '\u{02600}' // Code: 800 clear sky
const fewClouds = '\u{026C5}' // Code: 801 sun behind clouds
const clouds = '\u{02601}' // Code: 802-803-804 clouds general
const hot = '\u{1F525}' // Code: 904
const defaultEmoji = '\u{1F300}' // default emojis
/* beautify preserve:end */

getEmoji = (code) => {
  switch (code) {
    case 200:
    case 900:
    case 901:
    case 902:
    case 905:
      return thunderstorm;
    case 300:
      return drizzle;
    case 500:
      return rain;
    case 600:
      return snowflake;
    case 903:
    case 906:
      return snowman;
    case 700:
      return atmosphere;
    case 800:
      return clearSky;
    case 801:
      return fewClouds;
    case 802:
    case 803:
    case 804:
      return clouds;
    case 904:
      return hot;
    default:
      return defaultEmoji;
  }
}

const daynames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
getDayName = (index) => {
  return daynames[index];
}

tulostaOpenweatherData = (data) => {
  let output = "*Here's ";
  if (data.dayAmount > 1) { output += data.dayAmount + "-day weather-forecast for " + data.city.name + ": \r\n\r\n"; }
  else { output += "today's weather-forecast for " + data.city.name + ": \r\n\r\n"; }
  output += "*";
  last_date = undefined;
  days = 1;
  for (i = 0; i < data.list.length; i++) {
    date = new Date(data.list[i].dt_txt);
    if (last_date == undefined) {
      last_date = date;
      output += "*" + getDayName(date.getDay()) + " " + date.getDate() + "." + (date.getMonth() + 1) + ".*\r\n";
    }
    if (last_date.getDate() != date.getDate()) {
      if (data.dayAmount == days) { return output; }
      days++;
      output += "\r\n";
      output += "*" + getDayName(date.getDay()) + " " + date.getDate() + "." + (date.getMonth() + 1) + ".*\r\n";
    }
    output += "[";
    if (date.getHours() < 10) { output += "0" }
    output += date.getHours();
    output += "] ";

    output += parseInt(data.list[i].main.temp) + "°C ";
    for (j = 0; j < data.list[i].weather.length; j++) {
      output += getEmoji(data.list[i].weather[j].id) + " ";
    }
    output += parseInt(data.list[i].wind.speed) + "m/s "// + parseInt(data.list[i].wind.deg) + "° ";
    // output += parseInt(data.list[i].main.pressure) + "hPa ";
    // output += "h: " + parseInt(data.list[i].main.humidity) + "% ";
    // output += "c: " + parseInt(data.list[i].clouds.all) + "% ";
    for (j = 0; j < data.list[i].weather.length; j++) {
      output += data.list[i].weather[j].main + " ";
    }
    // if(data.list[i].rain) {
    //   console.log("rain: ");
    //   console.log(data.list[i].rain);
    // }
    if (data.list[i].rain && parseInt(data.list[i].rain['3h']) >= 1) { output += parseInt(data.list[i].rain['3h']) + "mm "; }
    else if (data.list[i].rain && data.list[i].rain['3h'] > 0) { output += "<1mm "; }

    output += "\r\n";
    if (last_date.getDate() != date.getDate()) {
      last_date = date;
    }
  }
  // if (data.list[0].main.temp)
  //   output += "Temperature " + data.list[0].main.temp + "°C (" + data.list[0].main.temp_min + "-" + data.list[0].main.temp_min + "°C)\r\n";
  // if (data.list[0].main.pressure)
  //   output += "Pressure " + data.list[0].main.pressure + "hPa\r\n";
  // if (data.list[0].main.humidity)
  //   output += "Humidity " + data.list[0].main.humidity + "%\r\n";
  // if (data.list[0].weather && data.list[0].weather.main)
  //   output += "Weather " + data.list[0].weather.main + ":" + data.list[0].weather.description + "\r\n";
  // if (data.list[0].clouds)
  //   output += "Clouds " + data.list[0].clouds.all + "%\r\n";
  // if (data.list[0].wind)
  //   output += "Wind " + data.list[0].wind.speed + "m/s " + data.list[0].wind.deg + "°\r\n";
  // if (data.list[0].rain)
  //   console.log(data.list[0].rain);
  //   //output += "Rain " + data.list[0].rain.3h + "mm\r\n";
  // if (data.list[0].snow)
  //   console.log(data.list[0].snow);
  //   //output += "Snow " + data.list[0].snow.3h + "\r\n";
  output += "\r\n";

  return output;
}

exports.getOpenWeatherData = (place, days, callBack, errorCallBack) => {
  if (openweathermapAPI == "") {
    console.error("no api key set!");
    errorCallBack("no api key set!");
  } else {
    if (days < 1 || days > 5) {
      errorCallBack("days is not between 1 to 5");
    } else {
      //console.log("Haetaan päivän sää-dataa paikalle " + paikka.nimi + "," + paikka.countrycode);
      const req_url = "http://api.openweathermap.org/data/2.5/forecast?q=" + place.nimi + "," + place.countrycode + "&appid=" + openweathermapAPI + "&units=metric";
      http.get(req_url, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          let data = JSON.parse(body);
          if (data != undefined && data.cod != '404') {
            // console.log(data);
            data.dayAmount = days;
            output = tulostaOpenweatherData(data);
            //console.log(output);
            callBack(output);
          } else {
            callBack("Couldn't find that place. Try something else.")
          }
        });
      }).on('error', (e) => {
        console.log("Got an error: ", e);
        errorCallBack(e);
      });
    }
  }
}

exports.getCurrentWeather = (place, callBack) => {
  if (openweathermapAPI == "") {
    console.error("no api key set!");
  } else {
    const req_url = "http://api.openweathermap.org/data/2.5/weather?q=" + place.nimi + "," + place.countrycode + "&appid=" + openweathermapAPI + "&units=metric";
    http.get(req_url, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const data = JSON.parse(body);
        //console.log(output);
        callBack(data);
      });
    }).on('error', (e) => {
      console.log("Got an error: ", e);
      errorCallBack(e);
    });
  }
}

exports.getSunriseSunsetMessage = (place, callBack) => {
  if (openweathermapAPI == "") {
    console.error("no api key set!");
  } else {
    const req_url = "http://api.openweathermap.org/data/2.5/weather?q=" + place.nimi + "," + place.countrycode + "&appid=" + openweathermapAPI + "&units=metric";
    http.get(req_url, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        let data = JSON.parse(body);

        console.log(data.sys);
        const sunrise = new Date(data.sys.sunrise);
        const sunset = new Date(data.sys.sunset);

        let output = place.nimi + " " + place.countrycode + ":\r\n";
        output += "Sun rises at: " + sunrise.getHours() + ":" + sunrise.getMinutes() + "\r\n";
        output += "Sun sets at: " + sunset.getHours() + ":" + sunset.getMinutes() + "\r\n";

        //console.log(output);
        callBack(output);
      });
    }).on('error', (e) => {
      console.log("Got an error: ", e);
      errorCallBack(e);
    });
  }
}