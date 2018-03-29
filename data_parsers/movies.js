// http://www.leffatykki.com/xml/ilta/tvssa

const https = require('https');
const xml2json = require('xml2json');
const fs = require('fs');


exports.getMoviesOnTV = (callback) => { 

	"use strict";

	let url = "https://www.leffatykki.com/xml/ilta/tvssa";

	https.get(url, (res) => {

		var body = '';
		res.on('data', (d) => {
			body += d;
		});

		res.on('end', function() {
			var data = JSON.parse(xml2json.toJson(body));
			var output = "";

			if(data != undefined) {
				// fs.writeFile('tvssa.json', JSON.stringify(data), function (err) {
				//   	if (err) throw err;
				//   	console.log('Saved!');
				// });

				let output = "Movies coming up in TV: \r\n";
				output += "[dd.MM HH:mm (channel, rating, year) name.]\r\n";

				let tomorrowMessage = false;
				let movies = data.today.movie;
				let lastDate = new Date();
				for(let i = 0; i < movies.length; i++) {
					let date = new Date(movies[i].broadcast.date);
					let month = (date.getMonth()+1) >= 10 ? (date.getMonth()+1) : "0" + (date.getMonth()+1);
					let day = date.getDate() >= 10 ? date.getDate() : "0" + date.getDate();
					let hours = date.getHours() >= 10 ? date.getHours() : "0" + date.getHours();
					let minutes = date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes();
					let now = new Date();
					if (date.getDate() != lastDate.getDate()){
						console.log("-");
						lastDate = date;
						output += "-\r\n";
					}
					console.log(day + "." + month + " " + hours + ":" + minutes + " (" + movies[i].broadcast.channel + ", " + movies[i].rating.value + ", " + movies[i].year + ") " +  movies[i].name);
					output += day + "." + month + " " + hours + ":" + minutes + " (" + movies[i].broadcast.channel + ", " + movies[i].rating.value + ", " + movies[i].year + ") " +  movies[i].name + "\r\n";
				}

				callback(output);
			} else {
				console.error("no data defined!");
				callback("error happened while getting TV results..");
			}
		});

	});

}
