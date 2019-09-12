// sunrise-sunset.js
// "https://api.sunrise-sunset.org/json?lat=60.9827&lng=25.6612&date=today";

const http = require('http');

var emoji_moon = '\u{1F31C}';
var emoji_sun  = '\u{02600}';

exports.getSunDataAtLocation = (place, callBack) => {

 	var req_url = "http://api.sunrise-sunset.org/json?lat=" + place.lat + "&lng=" + place.lng + "&date=today&formatted=0";
    http.get(req_url, function(res) {
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            var data = JSON.parse(body);
            if(data.status == "OK") {

	            var sunrise = new Date(data.results.sunrise);
	            var sunset = new Date(data.results.sunset);
	            var day_length_in_hours = ((data.results.day_length * 1000) / 3.6e+6); // return is secons some reason. convert it to ms and then to human-readable. (divide by 3.6e+6 == 1h in ms)

	            var output = "<b>Dusk till dawn at "+place.name+":</b> \r\n"
	            output += emoji_sun + "Sunrise at " + sunrise.getHours() + ":" + sunrise.getMinutes() + "\r\n";
	            output += emoji_moon + "Sunset at " + sunset.getHours() + ":" + sunset.getMinutes() + "\r\n";
	            output += "Day length is " + day_length_in_hours.toFixed(2) + " hours.";

	            callBack(output);
            } else {
            	callBack("Error happened while getting sun data.");
            }
        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
          errorCallBack(e);
    });

}