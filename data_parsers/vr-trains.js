// vr-trains.js made by Juho.
//documentation for train API: https://rata.digitraffic.fi/api/v1/doc/index.html
// Liikennetietojen lähde Traffic Management Finland / digitraffic.fi, lisenssi CC 4.0 BY
// TODO: rename these functions in english and cleanup.

const https = require('https');
const helper = require('./helper.js');

let asemat = [];

// emojis unicode
const e_station = '\u{1f689}';
const e_train = '\u{1f686}';
const e_train2 = '\u{1F682}';
const e_snail = '\u{1f40c}';
const e_warning = '\u{26a0}';
const e_no_entry = '\u{26D4}';
const e_cross_mark = '\u{274C}';

let homeWorkLocations = {};

loadHomeWorkLocations = () => {
  helper.loadJson('./data/workHomeStations.json', (data) => {
    homeWorkLocations = data;
    //console.log("loaded homeWorkLocations: ", homeWorkLocations);
  })
}
loadHomeWorkLocations();


capitalize = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

isAllUpperCase = (word) => {
  for (i = 0; i < word.length; i++) {
    if (word[i] != word[i].toUpperCase()) {
      return false;
    }
  }
  return true;
}

function withLeadingZero(n) {
  return (n < 10 ? '0' : '') + n;
}

tulostaJunienTiedot = (lahtevatJunat, haeCargoJunat, trainAmountMax) => {
  let trainAmount = 0;
  let output = "";
  if (lahtevatJunat && lahtevatJunat.length > 0) {
    if (lahtevatJunat.targetAsema2) {
      output += "* to " + lahtevatJunat.targetAsema2.nimi + "*";
    }
    output += "\r\n\r\n";

    for (i = 0; i < lahtevatJunat.length; i++) {

      if (!haeCargoJunat && lahtevatJunat[i].kategoria == "Cargo") { continue; }
      if (haeCargoJunat && lahtevatJunat[i].kategoria != "Cargo") { continue; }
      if (lahtevatJunat[i].targetLahtoAika) {
        output += withLeadingZero(lahtevatJunat[i].targetLahtoAika.getHours()) + ":";
        output += withLeadingZero(lahtevatJunat[i].targetLahtoAika.getMinutes());

        if (lahtevatJunat[i].targetEro > 0) {
          output += "->*";
          output += withLeadingZero(lahtevatJunat[i].targetLiveArvio.getHours()) + ":";
          output += withLeadingZero(lahtevatJunat[i].targetLiveArvio.getMinutes()) + "*";
        }
      }

      output += " ";

      if (lahtevatJunat[i].kategoria == "Cargo") {
        output += e_no_entry;
      }
      if (lahtevatJunat[i].linja) {
        output += e_train2 + " " + lahtevatJunat[i].linja;
      } else {
        output += e_train + " " + lahtevatJunat[i].tyyppi;
      }
      output += " ";
      if (lahtevatJunat[i].targetraide) {
        output += "Track " + lahtevatJunat[i].targetraide + " : ";
      }

      output += lahtevatJunat[i].lahtopaikka.nimi + "-" + lahtevatJunat[i].maaranpaa.nimi + " ";

      if (lahtevatJunat[i].target2LahtoAika) {
        output += withLeadingZero(lahtevatJunat[i].target2LahtoAika.getHours()) + ":";
        output += withLeadingZero(lahtevatJunat[i].target2LahtoAika.getMinutes());
      }

      if (lahtevatJunat[i].targetTimeTaken) {
        output += " (" + helper.msToHumanReadable(lahtevatJunat[i].targetTimeTaken, true).trim() + ")";
      }

      if (lahtevatJunat[i].cancelled == true) {
        output += e_cross_mark;
      }

      output += ' [link](https://www.vr.fi/cs/vr/fi/juku#train=' + lahtevatJunat[i].nro + ')';

      output += "\r\n";
      trainAmount++;
      if (trainAmount == trainAmountMax) { break; }
    } // EOF for loop lahtevatJunat.length

    if (trainAmount <= 0) { return "Sorry didn't find any trains of that type"; }

    output = "*Here's next " + trainAmount + " trains departing from " + lahtevatJunat.targetAsema.nimi + "*" + output;
  } else {
    output += "Sorry, but I didn't find traindata from ";
    if (lahtevatJunat.targetAsema.nimi) { output += lahtevatJunat.targetAsema.nimi }
    else { output += lahtevatJunat.targetAsema.lyhenne; }
    if (lahtevatJunat.targetAsema2 != undefined) {
      output += " to ";
      if (lahtevatJunat.targetAsema2.nimi) { output += lahtevatJunat.targetAsema2.nimi }
      else { output += lahtevatJunat.targetAsema2.lyhenne; }
    }
  }
  return output;
};

haeAsemat = (callback) => {
  https.get("https://rata.digitraffic.fi/api/v1/metadata/stations", (response) => {
    let data = [];
    response.on('data', function (chunk) {
      data.push(chunk);
    }).on('end', function () {
      let buffer = Buffer.concat(data);
      const responsedata = JSON.parse(buffer.toString());

      for (i = 0; i < responsedata.length; i++) {
        asema = new Object(); // TODO: convert to use class
        asema.nimi = responsedata[i].stationName.toLowerCase();
        /**/
        if (asema.nimi.endsWith(" asema")) {
          asema.nimi = asema.nimi.slice(0, asema.nimi.length - 6);
        } else if (asema.nimi.endsWith("_(finljandski)")) {
          asema.nimi = asema.nimi.slice(0, asema.nimi.length - 14);
        } else if (asema.nimi.endsWith("_(leningradski)")) {
          asema.nimi = asema.nimi.slice(0, asema.nimi.length - 15);
        }
        /**/
        asema.nimi = capitalize(asema.nimi);
        asema.lyhenne = responsedata[i].stationShortCode;
        asema.tyyppi = responsedata[i].type;
        asema.matkustajalinja = responsedata[i].passengerTraffic;
        asema.UICCCode = responsedata[i].stationUICCode;
        asema.maakoodi = responsedata[i].countryCode;
        asema.lat = responsedata[i].latitude;
        asema.lon = responsedata[i].longitude;
        asemat.push(asema);
      }
      console.log("Found  " + asemat.length + " train-stations.");
      callback(asemat);
    });
  });
}

haeAsemat((_asemat) => {
  asemat = _asemat;
});

haePaikkaKokonimi = (lyhenne) => {
  const asema = searchStationByShorthandCode(lyhenne)
  return capitalize(asema.nimi);
}

searchStationByName = (name) => {
  for (let i = 0; i < asemat.length; i++) {
    if (asemat[i].nimi.toLowerCase() == name.toLowerCase()) {
      return asemat[i];
    } else if (asemat[i].nimi.toLowerCase() == (name + " asema").toLowerCase()) {
      return asemat[i];
    }
  }
  return null;
}

searchStationByShorthandCode = (shortcode) => {
  for (let i = 0; i < asemat.length; i++) {
    if (asemat[i].lyhenne.toLowerCase() == shortcode.toLowerCase()) {
      return asemat[i];
    }
  }
  return null;
}

searchStationByNameOrShorthandCode = (nameOrShortcode) => {
  let station = searchStationByName(nameOrShortcode);
  if (station) {
    return station;
  } else {
    return searchStationByShorthandCode(nameOrShortcode);
  }
}

parseJunat = (responsedata, lahto, maaranpaa) => {
  let junat = [];
  for (let i = 0; i < responsedata.length; i++) {
    /*
    "trainNumber": 9839,
    "departureDate": "2017-07-08",
    "operatorUICCode": 10,
    "operatorShortCode": "vr",
    "trainType": "HL",
    "trainCategory": "Commuter",
    "commuterLineID": "Z",
    "runningCurrently": false,
    "cancelled": false,
    "version": 229165807229,
    "timetableType": "REGULAR",
    "timetableAcceptanceDate": "2017-05-26T15:37:01.000Z",
    "timeTableRows": [ {}, {}, ...]
    */
    let juna = new Object(); // TODO: convert to use class
    juna.tyyppi = responsedata[i].trainType;
    juna.kategoria = responsedata[i].trainCategory;
    juna.ajossa = responsedata[i].runningCurrently;
    juna.peruutettu = responsedata[i].cancelled;
    juna.versio = responsedata[i].version;
    juna.linja = responsedata[i].commuterLineID;
    juna.nro = responsedata[i].trainNumber;
    juna.aikataulutyyppi = responsedata[i].timetableType;
    juna.aikataulu = responsedata[i].timeTableRows;
    juna.pysakit = [];
    if (juna.aikataulu) {
      for (j = 0; j < juna.aikataulu.length; j++) {
        let pysakki = new Object();
        let asema = searchStationByNameOrShorthandCode(juna.aikataulu[j].stationShortCode);
        pysakki.nimi = capitalize(asema.nimi);
        pysakki.lyhenne = asema.lyhenne;
        pysakki.lahtoaika = juna.aikataulu[j].scheduledTime;
        pysakki.type = juna.aikataulu[j].type;
        juna.pysakit.push(pysakki);
        if (pysakki.lyhenne == lahto.lyhenne && pysakki.type == "DEPARTURE") {
          juna.targetLahtoAika = new Date(juna.aikataulu[j].scheduledTime);
          juna.targetArvio = new Date(juna.aikataulu[j].actualTime);
          juna.targetLiveArvio = new Date(juna.aikataulu[j].liveEstimateTime);
          juna.targetEro = juna.aikataulu[j].differenceInMinutes;
          juna.targetraide = juna.aikataulu[j].commercialTrack;
        }
        if (maaranpaa && pysakki.lyhenne == maaranpaa.lyhenne && pysakki.type == "ARRIVAL") {
          juna.target2LahtoAika = new Date(juna.aikataulu[j].scheduledTime);
          juna.target2Arvio = new Date(juna.aikataulu[j].actualTime);
          juna.target2LiveArvio = new Date(juna.aikataulu[j].liveEstimateTime);
          juna.target2Ero = juna.aikataulu[j].differenceInMinutes;
          juna.target2raide = juna.aikataulu[j].commercialTrack;
        }
      }

      juna.lahtopaikka = new Object();
      juna.lahtopaikka.nimi = haePaikkaKokonimi(juna.aikataulu[0].stationShortCode);
      juna.lahtopaikka.lahtoaika = new Date(juna.aikataulu[0].scheduledTime);
      if (juna.aikataulu[0].actualTime) {
        juna.lahtopaikka.oikealahtoaika = new Date(juna.aikataulu[0].actualTime);
      } else {
        juna.lahtopaikka.arviolahtoaika = new Date(juna.aikataulu[0].liveEstimateTime);
      }
      juna.lahtopaikka.lahtoaikaero = juna.aikataulu[0].differenceInMinutes;

      juna.maaranpaa = new Object();
      juna.maaranpaa.nimi = haePaikkaKokonimi(juna.aikataulu[juna.aikataulu.length - 1].stationShortCode);
      juna.maaranpaa.lahtoaika = new Date(juna.aikataulu[juna.aikataulu.length - 1].scheduledTime);
      if (juna.aikataulu[0].actualTime) {
        juna.maaranpaa.oikealahtoaika = new Date(juna.aikataulu[juna.aikataulu.length - 1].actualTime);
      } else {
        juna.maaranpaa.arviolahtoaika = new Date(juna.aikataulu[juna.aikataulu.length - 1].liveEstimateTime);
      }
      juna.maaranpaa.lahtoaikaero = juna.aikataulu[juna.aikataulu.length - 1].differenceInMinutes;
    }

    if (juna.targetLahtoAika && juna.target2LahtoAika) {
      juna.targetTimeTaken = juna.targetLahtoAika.getTime() - juna.target2LahtoAika.getTime();
    }
    junat.push(juna);
  }

  //helper.writeToJsonAsync("junat.json", junat);

  // sort by departing time.
  junat.sort((a, b) => {
    return a.targetLahtoAika.getTime() - b.targetLahtoAika.getTime();
  });

  return junat;
}

luoAsema = (paikka) => {
  let asema = searchStationByNameOrShorthandCode(paikka);
  asema.nimi = capitalize(asema.nimi);
  return asema;
}

exports.haeAsemanTiedot = (asema, callBack) => {
  asema = luoAsema(asema);
  let output = e_station + " Station: " + asema.nimi;
  if (asema.maakoodi) { output += ", " + asema.maakoodi; }
  if (asema.lyhenne) {
    let link = "https://www.vr.fi/cs/vr/fi/juku#station=" + asema.lyhenne;
    link = encodeURI(link);
    output += " shortcode: " + asema.lyhenne + " [link](" + link + ")" + "\r\n";
  }
  if (asema.lat && asema.lon) {
    output += "latitude: " + asema.lat + ", longitude: " + asema.lon + "\r\n";
  }
  if (asema.matkustajalinja) {
    output += "PassengerTraffic: " + asema.matkustajalinja;
  }
  if (!asema.nimi || !asema.lyhenne) {
    output = "Can't find station with '";
    if (asema.nimi) { output += asema.nimi; }
    else { output += asema.lyhenne; }
    output += "'.";
  }
  callBack(output);
}

exports.haeAsemanJunat = (start, haeCargoJunat, trainAmount, callBack) => {
  const asema = luoAsema(start);

  if (asema) {
    const apiUrl = "https://rata.digitraffic.fi/api/v1/live-trains?station=" + asema.lyhenne + "&arrived_trains=0&arriving_trains=0&departed_trains=0&departing_trains=100&include_nonstopping=false";
    https.get(encodeURI(apiUrl), (response) => {
      let data = [];
      response
        .on('data', (chunk) => { data.push(chunk); })
        .on('end', () => {
          let buffer = Buffer.concat(data);
          const responsedata = JSON.parse(buffer.toString('utf-8'));

          let junat = undefined;
          if (responsedata.code != "TRAIN_NOT_FOUND") {
            junat = parseJunat(responsedata, asema, undefined);
          }

          if (junat) {
            junat.targetAsema = asema;
            output = tulostaJunienTiedot(junat, haeCargoJunat, trainAmount);
            callBack(output);
          } else {
            let output = "Couldn't find traindata for ";
            if (lahto.nimi) { output += lahto.nimi; }
            else { output += lahto.lyhenne; }
            callBack(output);
          }

        });

    }).on('error', (e) => {
      console.error(e);
    });
  } // EOF if asema.lyhenne != null

}

exports.haeJunatReitille = (start, end, trainAmount, haeCargoJunat, callBack) => {
  haeJunatReitille2(start, end, trainAmount, haeCargoJunat, (response) => callBack(response));
}

haeJunatReitille2 = (start, end, trainAmount, haeCargoJunat, callBack) => {
  const lahto = luoAsema(start);
  const maaranpaa = luoAsema(end);

  if (lahto != null && maaranpaa != null) {
    https.get(encodeURI("https://rata.digitraffic.fi/api/v1/schedules?departure_station=" + lahto.lyhenne + "&arrival_station=" + maaranpaa.lyhenne + "&limit=10"), (response) => {
      let data = [];
      response
        .on('data', (chunk) => { data.push(chunk); })
        .on('end', () => {
          let buffer = Buffer.concat(data);
          if (typeof buffer == "object") {
            const responsedata = JSON.parse(buffer.toString('utf-8'));
            junat = parseJunat(responsedata, lahto, maaranpaa);
            if (junat) {
              junat.targetAsema = lahto;
              junat.targetAsema2 = maaranpaa;
              output = tulostaJunienTiedot(junat, haeCargoJunat, trainAmount);
              callBack(output);
            } else {
              let output = "Couldn't find traindata for ";
              if (lahto.nimi) { output += lahto.nimi; }
              else { output += lahto.lyhenne; }
              output += " to ";
              if (maaranpaa.nimi) { output += maaranpaa.nimi; }
              else { output += maaranpaa.lyhenne; }
              callBack(output);
            }
          } else {
            callBack("Error happened while getting traindata, try again.");
          }
        });

    }).on('error', (e) => {
      console.log("error");
      console.error(e);
    });
  } else {
    let output = "Couldn't find traindata for ";
    if (lahto.nimi) { output += lahto.nimi; }
    else { output += lahto.lyhenne; }
    output += " to ";
    if (maaranpaa.nimi) { output += maaranpaa.nimi; }
    else { output += maaranpaa.lyhenne; }
    callBack(output);
  }
}


exports.addHomeWorkLocation = (homeWorkLocation, callback) => {
  if (!homeWorkLocation.userId) { callback("userId not found"); }
  else {
    if (!homeWorkLocations[homeWorkLocation.userId]) { homeWorkLocations[homeWorkLocation.userId] = {}; }

    if (homeWorkLocation.work) {
      homeWorkLocations[homeWorkLocation.userId].work = homeWorkLocation.work;
      helper.writeToJson('./data/workHomeStations.json', homeWorkLocations);
      callback("Set work location to " + homeWorkLocation.work);

    } else if (homeWorkLocation.home) {
      homeWorkLocations[homeWorkLocation.userId].home = homeWorkLocation.home;
      helper.writeToJson('./data/workHomeStations.json', homeWorkLocations);
      callback("Set home location to " + homeWorkLocation.home);

    } else { callback("no work or home given!"); }
  }
}

exports.getTrainsHomeWorkLocation = (directionAndUserId, callback) => {
  if (!directionAndUserId.direction) { callback("direction not given!"); }
  else if (!directionAndUserId.userId) { callback("userId not given!"); }
  else if (!homeWorkLocations[directionAndUserId.userId]
    || !homeWorkLocations[directionAndUserId.userId].home
    || !homeWorkLocations[directionAndUserId.userId].work) {
    callback("No work and/or home stations setup for user! Try commands /sethome and /setwork");
  }
  else {
    if (directionAndUserId.direction == "work") {
      haeJunatReitille2(homeWorkLocations[directionAndUserId.userId].home, homeWorkLocations[directionAndUserId.userId].work, 10, false, (response) => {
        callback(response);
      })
    } else {
      haeJunatReitille2(homeWorkLocations[directionAndUserId.userId].work, homeWorkLocations[directionAndUserId.userId].home, 10, false, (response) => {
        callback(response);
      })
    }
  }
}