// news.js
// exports getProvinces(), getYleNews() & getHelpMessage()
// YLE news rss: https://yle.fi/uutiset/rss

const https = require('https');
const xml2json = require('xml2json');

news_by_province = [	{province: "Etelä-Karjala", 	url: "18-141372", shortcode: "EK"},
						{province: "Etelä-Pohjanmaa", 	url: "18-146311", shortcode: "EP"},
						{province: "Etelä-Savo", 		url: "18-141852", shortcode: "ES"},
						{province: "Kainuu", 			url: "18-141399", shortcode: "KA"},
						{province: "Kanta-Häme", 		url: "18-138727", shortcode: "KH"},
						{province: "Keski-Pohjanmaa", 	url: "18-135629", shortcode: "KP"},
						{province: "Keski-Suomi", 		url: "18-148148", shortcode: "KS"},
						{province: "Kymenlaakso", 		url: "18-131408", shortcode: "KY"},
						{province: "Lappi", 			url: "18-139752", shortcode: "LA"},
						{province: "Pirkanmaa", 		url: "18-146831", shortcode: "PI"},
						{province: "Pohjanmaa", 		url: "18-148149", shortcode: "PO"},
						{province: "Pohjois-Karjala", 	url: "18-141936", shortcode: "PK"},
						{province: "Pohjois-Pohjanmaa", url: "18-148154", shortcode: "PP"},
						{province: "Pohjois-Savo", 		url: "18-141764", shortcode: "PS"},
						{province: "Päijät-Häme", 		url: "18-141401", shortcode: "PH"},
						{province: "Satakunta", 		url: "18-139772", shortcode: "SA"},
						{province: "Uusimaa", 			url: "18-147345", shortcode: "UU"},
						{province: "Varsinais-Suomi", 	url: "18-135507", shortcode: "VS"}
					];

parseNewsData = (data, newsAmount, req, output_callback) => {
	var news = data.rss.channel.item;
	amountOfNews = 0;
	maxNews = newsAmount;
	stringMaxLength = 100;
	var output = "";
	if(data != undefined) {
		if(news != undefined) {
			for(i = 0; i < news.length; i++) {
				output += news[i].title.substring(0, stringMaxLength);
				if(news[i].title.length > stringMaxLength) {output += "...";}
				o_str = "?origin=rss";
				output += " [link](" + news[i].link.substring(0,news[i].link.length - o_str.length) + ")\r\n\r\n";
				amountOfNews++;
				if(amountOfNews == maxNews) {break;}
			}
		}

		if(amountOfNews != undefined && amountOfNews > 0) {
			let title = "*Here's " + amountOfNews + " ";
			title += "recent news";
			if(req.province) {title += " for " + req.province;}
				if(req.publisher) {title += " from " + req.publisher;}
				if(req.lang) {title += " in " + req.lang;}
			title += ":* \r\n\r\n";
			output = title + output;
		} else {
			output = "Sorry, couldn't get news-data";
				if(req.province) {output += " for " + req.province;}
				if(req.publisher) {output += " from "+req.publisher;}
				if(req.lang) {output += " in " + req.lang;}
		}
  	} else {
  		output = "Sorry, couldn't get news-data";
  		if(place && place.province) {output += " for " + place.province + " ";}
  		if(req.publisher) {output += "from "+req.publisher;}
  	}
  	output_callback(output);
}

setupRequestData = (place, lang) => {
	var req = new Object();
	req.url = "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=";

	if(lang != undefined) {
		if (lang.toLowerCase() == "en") {
			req.url += "YLE_NEWS";
			req.lang = "English";
			req.publisher = "YLE NEWS";
		} else if (lang.toLowerCase() == "fi") {
			req.url += "YLE_UUTISET";
			req.lang = "Finnish";
			req.publisher = "YLE UUTISET";
		} else if (lang.toLowerCase() == "sa") {
			req.url += "YLE_SAPMI";
			req.lang = "Sápmi";
			req.publisher = "YLE SÁPMI";
		} else if (lang.toLowerCase() == "ru") {
			req.url += "YLE_NOVOSTI";
			req.lang = "Russian";
			req.publisher = "YLE NOVOSTI";
		} else if (lang.toLowerCase() == "simplefi") {
			req.url += "YLE_SELKOUUTISET";
			req.lang = "Simple Finnish";
			req.publisher = "YLE SELKOUUTISET";
		}
	} else {
		req.url += "YLE_NEWS";
		req.lang = "English";
		req.publisher = "YLE NEWS";
	}

	if(place != undefined) {
		if(place.province != undefined) {
			for(i = 0; i < news_by_province.length; i++) {
				if(news_by_province[i].province.toLowerCase() == place.province.toLowerCase()) {
					req.url += "&concepts=" + news_by_province[i].url;
					req.province = news_by_province[i].province;
					break;
				} else if (news_by_province[i].shortcode == place.province.toUpperCase()) {
					req.url += "&concepts=" + news_by_province[i].url;
					req.province = news_by_province[i].province;
					break;
				}
			}
		}
	}
	console.log(req);
	return req;
}

// return help message about commands
exports.getHelpMessage = (callback) => {
	var output = "/n /news is a command to get news data from YLE. \r\n";
    output += "Can be given two parameter in any order: language and province(maakunta).\r\n";
    output += "Possible languages are: 'en', fi', 'ru', 'sa', 'simplefi'.\r\n";
    output += "For example: '/n fi päijät-häme' return news-data for Päijät-Häme in Finnish.\r\n";
    output += "You can also use shortcodes for provinces. Päijät-Häme = PH. \r\n";
    output += "To get list of provinces in Finland try: /p or /provinces \r\n";
    callback(output);
}

// gets provinces in finland to use for requesting news data.
exports.getProvinces = (callback) => {
	var output = "*Here is a list of provinces(maakunnat) with shortcodes in Finland:*\r\n";
	for(i = 0; i < news_by_province.length; i++) {
		output += "*" + news_by_province[i].shortcode + "* " + news_by_province[i].province + "\r\n";
	}
	callback(output);
}

// gets yle news for province with lang
exports.getYleNews = (province, lang, newsAmount, callback) => {

	// parse input little bit.
	let place = new Object();
  	if(lang.toLowerCase() == "en" ||
   		lang.toLowerCase() == "fi" ||
   		lang.toLowerCase() == "ru" ||
   		lang.toLowerCase() == "sa" ||
   		lang.toLowerCase() == "simplefi") {

   		lang = lang.toLowerCase();
		
		place.province = province;
		var req = setupRequestData(place, lang); // setup request data.

		// do the actual request.
		if(req.url != undefined) {

			https.get(req.url, (res) => {

				var body = ''; // store data body

				// collect each data stream
				res.on('data', (d) => {
				    body += d;
				});

				// end of data stream, parse data to news return output to callback.
				res.on('end', function() {
			      	var data = JSON.parse(xml2json.toJson(body));
					parseNewsData(data, newsAmount, req, function(output) {
						callback(output);
					})
		      	});

			}).on('error', (e) => {
			  console.error(e);
			});

		} else {
			var output = "Sorry, couldn't get news-data.";
			callback(output);
		}

  	} else {
  		var output = "Possible languages are 'en', 'fi', 'ru', 'sa' and 'simplefi'.";
		callback(output);
  	}
};
