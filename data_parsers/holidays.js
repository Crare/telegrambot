
const fs = require('fs');

getHolidays = (callback) => {
	fs.readFile('./data_parsers/holidays_finland.json', 'utf8', (err, data) => {
		if(err) throw err;
		// console.log(data);
		data = JSON.parse(data);
		for(let i = 0; i < data.length; i++) {
			data[i].date = new Date(data[i].date);
		}
		callback(data);
	});
}

exports.getHolidayToday = (callback) => {
	getHolidays((holidays) => {
		let today = new Date();
		let holiday = undefined;
		for(let i = 0; i < holidays.length; i++) {
			if(holidays[i].date.getDate() == today.getDate() &&
				holidays[i].date.getMonth() == today.getMonth()) {
				holiday = holidays[i];
				console.log(holiday);
			}
		}
		if(holiday == undefined) {
			console.log("no holiday today.");
			output = "no holiday today.";
		} else {
			output = "holiday: " + holiday.holidayName;
		}
		callback(output);
	});
}