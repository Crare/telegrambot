// http://www.leffatykki.com/xml/ilta/tvssa

const https = require('https');
const xml2json = require('xml2json');
const fs = require('fs');

exports.getAmpparitMoviesOnTV = (callback) => {
	let url = "https://feeds.feedburner.com/ampparit-tv-elokuvat-perus";
	https.get(url, (res) => {
		var body = '';
		res.on('data', (d) => {
			body += d;
		});

		res.on('end', function() {
			var data = JSON.parse(xml2json.toJson(body));
			//console.log(data);
			// fs.writeFile('ampparit_leffat.json', JSON.stringify(data), function (err) {
			//   	if (err) throw err;
			//   	console.log('Saved!');
			// });
			if(data != undefined && data.feed != undefined && data.feed.entry != undefined) {
				let movies = data.feed.entry;
				//console.log(movies);
				let output = "Movies coming up on TV:\r\n";
				let dayname = "";
				for(let i = 0; i < movies.length; i++) {
					//console.log(movies[i].title.$t);
					let when = movies[i].title.$t.substring(0, 15).trim();
					let what = movies[i].title.$t.substring(14, movies[i].title.$t.indexOf('@')).trim();
					let where = movies[i].title.$t.split('@')[1].trim();
					let link = movies[i].link.href;
					if(when.substring(0, 7) != dayname) {
						output += "<b>" + when.substring(0, 7) + "</b>\r\n";
						dayname =  when.substring(0, 7);
						console.log(dayname);
					}
					//console.log(when.substring(7, when.length-1) + " " + where + ": " + what);
					output += when.substring(7, when.length-1) + " " + where + ": <b>" + what + "</b> [<a href='" + link + "'>link</a>]\r\n";
				}
				callback(output);
			} else {
				callback("couldn't not get TV-data from Ampparit.");
			}
		});
	});
}

exports.getMoviesOnTV = (useHtmlMarkdown, only_today, callback) => { 

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

			if(data != undefined && data.today != undefined && data.today.movie != undefined) {
				//console.log(data);
				// fs.writeFile('tvssa.json', JSON.stringify(data), function (err) {
				//   	if (err) throw err;
				//   	console.log('Saved!');
				// });
				let output = "";
				if(useHtmlMarkdown) {
					output = "<b>Movies coming up in TV:</b> \r\n";
				} else {
					// else use normal markdown
					output = "*Movies coming up in TV:* \r\n";
				}
				//output += "[dd.MM. HH:mm (year, rating, channel) name.]\r\n";

				let today = new Date();
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
					if (only_today && date.getDate() == today.getDate()
						|| !only_today
						|| only_today && date.getDate() == today.getDate() + 1 && date.getHours() < 6) {
						if (date.getDate() != lastDate.getDate()){
							//console.log("-");
							lastDate = date;
							output += "-\r\n";
						}
						//console.log(day + "." + month + " " + hours + ":" + minutes + " (" + movies[i].broadcast.channel + ", " + movies[i].rating.value + ", " + movies[i].year + ") " +  movies[i].name);
						output += day + "." + month + ". " + hours + ":" + minutes + " (" + movies[i].year + ", " + movies[i].rating.value + ", " + movies[i].broadcast.channel + ") ";
						if(useHtmlMarkdown) {
							output += "<b>" +  movies[i].name + "</b> <a href='" + movies[i].item +  "'>link</a>" + "\r\n";
						} else {
							output += "*" +  movies[i].name + "* [link](" + movies[i].item +  ")" + "\r\n";
						}
					}
				}

				callback(output);
			} else {
				console.error("no data defined!");
				callback("error happened while getting TV results..");
			}
		});

	});

}
