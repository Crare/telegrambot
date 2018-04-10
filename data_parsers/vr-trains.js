// vr-trains.js made by Juho.
//documentation for train API: https://rata.digitraffic.fi/api/v1/doc/index.html
// TODO: rename these functions in english and cleanup.

const https = require('https');

var asemat = [];

// emojis unicode
var e_station =   '\u{1f689}';
var e_train   =   '\u{1f686}';
var e_train2   =  '\u{1F682}';
var e_snail   =   '\u{1f40c}';
var e_warning =   '\u{26a0}';
var e_no_entry =  '\u{26D4}';
var e_cross_mark ='\u{274C}';

capitalize = function(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function isAllUpperCase(word) {
  for(i = 0; i < word.length; i++) {
    if(word[i] != word[i].toUpperCase()) {
      return false;
    }
  }
  return true;
}

tulostaJunienTiedot = function(lahtevatJunat, haeCargoJunat, trainAmountMax) {
  var trainAmount = 0;
  var output = "";
  if(lahtevatJunat != undefined && lahtevatJunat.length > 0) {
    if(lahtevatJunat.targetAsema2 != undefined) {
      output += "* to " + lahtevatJunat.targetAsema2.nimi + "*";
    }
    output += "\r\n\r\n";

     for(i = 0; i < lahtevatJunat.length; i++) {

      if(!haeCargoJunat && lahtevatJunat[i].kategoria == "Cargo") { continue; }
      if(haeCargoJunat && lahtevatJunat[i].kategoria != "Cargo") {continue; }
         if(lahtevatJunat[i].targetLahtoAika != undefined) {
           output += " (" + lahtevatJunat[i].targetLahtoAika.getDate() + "." + (lahtevatJunat[i].targetLahtoAika.getMonth()+1) + ".) ";

           if(lahtevatJunat[i].targetLahtoAika.getHours() < 10) {
               output += "0";
             }
             output += lahtevatJunat[i].targetLahtoAika.getHours() + ":";

             if(lahtevatJunat[i].targetLahtoAika.getMinutes() < 10) {
               output += "0";
             }
             output += lahtevatJunat[i].targetLahtoAika.getMinutes();

           if (lahtevatJunat[i].targetEro > 0) { // targetEro != undefined
             output += "->*";
             if(lahtevatJunat[i].targetLiveArvio.getHours() < 10) {
               output += "0";
             }
             output += lahtevatJunat[i].targetLiveArvio.getHours() + ":";

             if(lahtevatJunat[i].targetLiveArvio.getMinutes() < 10) {
               output += "0";
             }
             output += lahtevatJunat[i].targetLiveArvio.getMinutes();

             output += "(+" + lahtevatJunat[i].targetEro + "min)*" + e_warning;
           }
         }
         //  output += " " + lahtevatJunat[i].targetLiveArvio.getHours() + ":" + lahtevatJunat[i].targetLiveArvio.getMinutes();

       output += " ";

       if(lahtevatJunat[i].kategoria == "Cargo") {
        output += e_no_entry;
       }
       if(lahtevatJunat[i].linja) {
         output += e_train2 + lahtevatJunat[i].linja;
       } else {
         output += e_train + lahtevatJunat[i].tyyppi;
       }
       output += " ";
       if (lahtevatJunat[i].targetraide != undefined) {
         output += "Track " + lahtevatJunat[i].targetraide + " : ";
       }
       output += lahtevatJunat[i].lahtopaikka.nimi + "-" + lahtevatJunat[i].maaranpaa.nimi;
       if(lahtevatJunat[i].target2LahtoAika != undefined) {
         output += " [";
         if(lahtevatJunat[i].target2LahtoAika.getHours() < 10) {
           output += "0";
         }
         output += lahtevatJunat[i].target2LahtoAika.getHours() + ":";

         if(lahtevatJunat[i].target2LahtoAika.getMinutes() < 10) {
           output += "0";
         }
         output += lahtevatJunat[i].target2LahtoAika.getMinutes();
         output += "]";
       } else {
         //console.log("lahtevatJunat.target2LahtoAika is undefined");
       }

       if(lahtevatJunat[i].cancelled == true) {
        output += e_cross_mark;
       }

       output += ' [link](https://www.vr.fi/cs/vr/fi/juku#train=' + lahtevatJunat[i].nro + ')';

       output += "\r\n";
       trainAmount++;
       if(trainAmount == trainAmountMax) {break;}
      } // EOF for loop lahtevatJunat.length

      if(trainAmount <= 0) {return "Sorry didn't find any trains of that type";}

      output = "*Here's next " + trainAmount + " trains departing from " + lahtevatJunat.targetAsema.nimi + "*" + output;
    } else {
      output += "Sorry, but I didn't find traindata from ";
      if(lahtevatJunat.targetAsema.nimi)
        {output += lahtevatJunat.targetAsema.nimi}
      else {output += lahtevatJunat.targetAsema.lyhenne;}
      if(lahtevatJunat.targetAsema2 != undefined) {
        output += " to ";
        if(lahtevatJunat.targetAsema2.nimi)
          {output += lahtevatJunat.targetAsema2.nimi}
        else {output += lahtevatJunat.targetAsema2.lyhenne;}
      }
    }
    return output;
};

haeAsemat = function(callback) {
  https.get("https://rata.digitraffic.fi/api/v1/metadata/stations", (response) => {
    var data = [];
    response.on('data', function(chunk) {
        data.push(chunk);
    }).on('end', function() {
        var buffer = Buffer.concat(data);
        var responsedata = JSON.parse(buffer.toString());

        for(i = 0; i < responsedata.length; i++) {
          asema = new Object();
          asema.nimi = responsedata[i].stationName.toLowerCase();
          if(asema.nimi.endsWith(" asema")) {
            asema.nimi = asema.nimi.slice(0, asema.nimi.length-6);
          } else if (asema.nimi.endsWith("_(finljandski)")) {
            asema.nimi = asema.nimi.slice(0, asema.nimi.length-14);
          } else if (asema.nimi.endsWith("_(leningradski)")) {
            asema.nimi = asema.nimi.slice(0, asema.nimi.length-15);
          }
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
        console.log("Juna-asemia löytyi yhteensä "+asemat.length+" kappaletta.");
        // console.log(asemat);
        callback(asemat);
    });
  });
}
haeAsemat((_asemat) => {
  asemat = _asemat;
});

haePaikkaKokonimi = function(lyhenne) {
  for(x = 0; x < asemat.length; x++) {
    if(asemat[x].lyhenne == lyhenne) {
      return asemat[x].nimi.charAt(0).toUpperCase() + asemat[x].nimi.slice(1); //capitalize
      break;
    }
  }
  return "";
}

haeAsemanLyhenne = function(aseman_nimi) {
  for(i = 0; i < asemat.length; i++) {
    if(asemat[i].nimi == aseman_nimi) {
      //console.log("lyhenne löytyi: " + asemat[i].lyhenne);
      return asemat[i].lyhenne;
    }
  }
  //console.log("juna-asemaa ei löytynyt");
  return null;
}

haeAsemanKokonimi = function(aseman_lyhenne) {
  for(i = 0; i < asemat.length; i++) {
    if(asemat[i].lyhenne == aseman_lyhenne) {
      //console.log("kokonimi löytyi: " + asemat[i].nimi);
      return asemat[i].nimi;
    }
  }
  //console.log("juna-asemalle ei löytynyt nimeä");
  return null;
}

parseJunat = function(responsedata, lahto, maaranpaa) {
  var junat = [];
  for(i = 0; i < responsedata.length; i++) {
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
    "timeTableRows":
    */
      juna = new Object();
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
      if(juna.aikataulu != undefined) {
        for(j = 0; j < juna.aikataulu.length; j++) {
          pysakki = new Object();
          pysakki.nimi = haePaikkaKokonimi(juna.aikataulu[j].stationShortCode);
          pysakki.lahtoaika = juna.aikataulu[j].scheduledTime;
          juna.pysakit.push(pysakki);
          if(pysakki.nimi == lahto.nimi) {
            juna.targetLahtoAika = new Date(juna.aikataulu[j].scheduledTime);
            juna.targetArvio = new Date(juna.aikataulu[j].actualTime);
            juna.targetLiveArvio = new Date(juna.aikataulu[j].liveEstimateTime);
            juna.targetEro = juna.aikataulu[j].differenceInMinutes;
            juna.targetraide = juna.aikataulu[j].commercialTrack;
          }
          if(maaranpaa != undefined && pysakki.nimi == maaranpaa.nimi) {
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
        if(juna.aikataulu[0].actualTime) {
          juna.lahtopaikka.oikealahtoaika = new Date(juna.aikataulu[0].actualTime);
        } else {
          juna.lahtopaikka.arviolahtoaika = new Date(juna.aikataulu[0].liveEstimateTime);
        }
        juna.lahtopaikka.lahtoaikaero = juna.aikataulu[0].differenceInMinutes;

        juna.maaranpaa = new Object();
        juna.maaranpaa.nimi = haePaikkaKokonimi(juna.aikataulu[juna.aikataulu.length-1].stationShortCode);
        juna.maaranpaa.lahtoaika = new Date(juna.aikataulu[juna.aikataulu.length-1].scheduledTime);
        if(juna.aikataulu[0].actualTime) {
          juna.maaranpaa.oikealahtoaika = new Date(juna.aikataulu[juna.aikataulu.length-1].actualTime);
        } else {
          juna.maaranpaa.arviolahtoaika = new Date(juna.aikataulu[juna.aikataulu.length-1].liveEstimateTime);
        }
        juna.maaranpaa.lahtoaikaero = juna.aikataulu[juna.aikataulu.length-1].differenceInMinutes;
      }
      junat.push(juna);
  }

  // sort by departing time.
  junat.sort(function(a, b) {
    return a.target2LahtoAika.getTime() - b.target2LahtoAika.getTime();
  });

  return junat;
}

function luoAsema(paikka) {
  asema = new Object();
  if(isAllUpperCase(paikka)) {
    asema.lyhenne = paikka;
  } else {
    asema.nimi = paikka;
  }
  if(asema.nimi == undefined) {
    asema.nimi = haeAsemanKokonimi(asema.lyhenne);
    //console.log(asema.nimi);
  }
  if(asema.nimi != null) {
    asema.nimi = asema.nimi.toLowerCase();
    asema.nimi = capitalize(asema.nimi);
    asema.lyhenne = haeAsemanLyhenne(asema.nimi);
  }
  return asema;
}

exports.haeAsemanTiedot = (asema, callBack)=> {
  asema = luoAsema(asema);
  var output = e_station + " Station: " + asema.nimi;
  if(asema.maakoodi) {
    output += ", " + asema.maakoodi;
  }
  if(asema.lyhenne) {
    let link = "https://www.vr.fi/cs/vr/fi/juku#station=" + asema.lyhenne;
    link = encodeURI(link);
    output += " shortcode: " + asema.lyhenne + " [link](" + link + ")" + "\r\n";
  }
  if(asema.lat && asema.lon) {
    output += "latitude: " + asema.lat + ", longitude: " + asema.lon + "\r\n";
  }
  if(asema.matkustajalinja != undefined) {
    output += "PassengerTraffic: " + asema.matkustajalinja;
  }
  if(!asema.nimi || !asema.lyhenne) {
    output = "Can't find station with '";
    if(asema.nimi) { output += asema.nimi; }
    else {output += asema.lyhenne;}
    output += "'.";
  }
  callBack(output);
}

exports.haeAsemanJunat = (start, haeCargoJunat, trainAmount, callBack) => {
  var asema = luoAsema(start);
    
  if(asema != null) {
     https.get(encodeURI("https://rata.digitraffic.fi/api/v1/live-trains?station=" + asema.lyhenne + "&arrived_trains=0&arriving_trains=0&departed_trains=0&departing_trains=100&include_nonstopping=false"), (response) => {
      var data = [];
      response.on('data', function(chunk) {
          data.push(chunk);
      }).on('end', function() {
          var buffer = Buffer.concat(data);
          var responsedata = JSON.parse(buffer.toString('utf-8'));

          var junat = undefined;
          if(responsedata.code != "TRAIN_NOT_FOUND") {
            junat = parseJunat(responsedata, asema, undefined);
          }

          if(junat != undefined) {
            junat.targetAsema = asema;
            output = tulostaJunienTiedot(junat, haeCargoJunat, trainAmount);
            callBack(output);
          } else {
            var output = "Couldn't find traindata for ";
            if(lahto.nimi) {output += lahto.nimi;}
            else {output += lahto.lyhenne;}
            callBack(output);
          }

      });

      }).on('error', (e) => {
        console.log("error");
        console.error(e);
      });
  } // EOF if asema.lyhenne != null

}

exports.haeJunatReitille = (start, end, trainAmount, haeCargoJunat, callBack) => {

  haeAsemat(function callb(response_asemat) {
    asemat = response_asemat;
    var lahto = luoAsema(start);
      var maaranpaa = luoAsema(end);

      if(lahto != null && maaranpaa != null) {
        https.get(encodeURI("https://rata.digitraffic.fi/api/v1/schedules?departure_station=" + lahto.lyhenne + "&arrival_station=" + maaranpaa.lyhenne + "&limit=10"), (response) => {
         var data = [];
         response.on('data', function(chunk) {
             data.push(chunk);
         }).on('end', function() {
             var buffer = Buffer.concat(data);
             console.log(typeof buffer);
             if (typeof buffer == "object") {
              var responsedata = JSON.parse(buffer.toString('utf-8'));
              // console.log(responsedata);
              junat = parseJunat(responsedata, lahto, maaranpaa);
               if(junat != undefined) {
                 junat.targetAsema = lahto;
                 junat.targetAsema2 = maaranpaa;
                 output = tulostaJunienTiedot(junat, haeCargoJunat, trainAmount);
                 //console.log(output);
                 callBack(output);
               } else {
                 var output = "Couldn't find traindata for ";
                 if(lahto.nimi) {output += lahto.nimi;}
                 else {output += lahto.lyhenne;}
                 output += " to ";
                 if(maaranpaa.nimi) {output += maaranpaa.nimi;}
                 else {output += maaranpaa.lyhenne;}
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
        var output = "Couldn't find traindata for ";
        if(lahto.nimi) {output += lahto.nimi;}
        else {output += lahto.lyhenne;}
        output += " to ";
        if(maaranpaa.nimi) {output += maaranpaa.nimi;}
        else {output += maaranpaa.lyhenne;}
        callBack(output);
      }
  }); 
  

}
