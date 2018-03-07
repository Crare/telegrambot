// news.js
// YLE news rss: https://yle.fi/uutiset/rss

const https = require('https');
const xml2json = require('xml2json');

//fs = require('fs');

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

do_RequestData = (place, lang) => {
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
	return req;
}

exports.getProvinces = (callback) => {
	var output = "*Here is a list of provinces(maakunnat) with shortcodes in Finland:*\r\n";
	for(i = 0; i < news_by_province.length; i++) {
		output += "*" + news_by_province[i].shortcode + "* " + news_by_province[i].province + "\r\n";
	}
	callback(output);
}

exports.getYleNews = (place, lang, newsAmount, callback) => {
	var req = do_RequestData(place, lang);

	if(req.url != undefined) {

		https.get(req.url, (res) => {
		  var body = '';
		  res.on('data', (d) => {
		    body += d;
		  });

		  res.on('end', function() {
	      	//console.log(body);
	      	var data = JSON.parse(xml2json.toJson(body));
			var output = "";

	      	if(data != undefined) {

		    	var news = data.rss.channel.item;
				amountOfNews = 0;
				maxNews = newsAmount;
				stringMaxLength = 100;

				if(news != undefined) {
					for(i = 0; i < news.length; i++) {
						output += news[i].title.substring(0, stringMaxLength);
						if(news[i].title.length > stringMaxLength) {output += "...";}
						//output += "\r\n";
						o_str = "?origin=rss";
						output += " [link](" + news[i].link.substring(0,news[i].link.length - o_str.length) + ")\r\n\r\n";
						amountOfNews++;
						if(amountOfNews == maxNews) {break;}
					}
				}

				if(amountOfNews != undefined && amountOfNews > 0) {
					title = "*Here's " + amountOfNews + " ";
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

		    callback(output);

      	});

		}).on('error', (e) => {
		  console.error(e);
		});

	} else {
		var output = "Sorry, couldn't get news-data";
		callback(output);
	}

};
