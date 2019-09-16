// get restaurant lunch menu

const https = require('https');

let amica_piikeidas_url = "https://www.amica.fi/modules/json/json/Index?costNumber=3238&language=fi";

getAmicaMenu = (todayOnly, callback) => {
	https.get(amica_piikeidas_url, (res) => {
		let body = ''; // store data body

		// collect each data stream
		res.on('data', (d) => {
		    body += d;
		});

		// end of data stream, parse data to news return output to callback.
		res.on('end', function() {
	      	const data = JSON.parse(body);
	      	let output = "";

	      	let today = new Date();
	      	for(let i = 0; i < data.MenusForDays.length; i++) {
	      		let date = new Date(data.MenusForDays[i].Date);
	      		if(todayOnly) {// only todays menu
		      		if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth()) {
			      		output += date.getDate() + "." + date.getMonth() + "." + "\r\n";
			      		for(let j = 0; j < data.MenusForDays[i].SetMenus.length; j++) {
			      			for(let h = 0; h < data.MenusForDays[i].SetMenus[j].Components.length; h++) {
			      				output += data.MenusForDays[i].SetMenus[j].Components[h] + "\r\n";
			      			}
			      			output += "\r\n";
			      		}
		      		}
		      	} else {
		      		output += date.getDate() + "." + date.getMonth() + "." + "\r\n";
		      		for(let j = 0; j < data.MenusForDays[i].SetMenus.length; j++) {
		      			for(let h = 0; h < data.MenusForDays[i].SetMenus[j].Components.length; h++) {
		      				output += data.MenusForDays[i].SetMenus[j].Components[h] + "\r\n";
		      			}
		      			output += "\r\n";
		      		}
		      	}
	      	}
	      	// parse *-marks
	      	output = output.replace(/\*/g, '+');
	      	// add title
	      	output = "*Amica Piikeidas*\r\n" + output;
			callback(output);
      	});
	}).on('error', (e) => {
	  	console.error(e);
	  	callback(e);
	});
}

exports.getMenuToday = (callback) => {
	getAmicaMenu(true, (output) => {
		callback(output);
	});
}

exports.getMenuForWeek = (callback) => {
	getAmicaMenu(false, (output) => {
		callback(output);
	});
}
