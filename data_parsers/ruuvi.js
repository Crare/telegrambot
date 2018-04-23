var PythonShell = require('python-shell');


exports.getRuuviTagData = (tag, callBack) => {
	var options = {
		// mode: 'text',
		// pythonPath: './',
		// pythonOptions: ['tag'], // get print results in real-time
		scriptPath: './data_parsers/',
		args: ['--tag', tag.id]
	};

	PythonShell.run('ruuvi.py', options, function (err, results) {
	  	if (err) {
	  		console.error(err);
	  		callBack(err);
	  	} else {
	  		// results is an array consisting of messages collected during execution
	  		console.log('results: %j', results);
	  		let ruuvitag = JSON.parse(results[0].replace(/'/g, '"'));
	  		ruuvitag.name = tag.name;
	  		let output = "";
	  		if(results[0].length > 0) {
		  		output = "<b>Ruuvitag " + ruuvitag.name + "</b>\r\n";
		  		output += "Temperature: " + ruuvitag.temperature + "\r\n";
		  		output += "Humidity: " + ruuvitag.humidity + "\r\n";
		  		output += "Pressure: " + ruuvitag.pressure + "\r\n";
		  	} else {
		  		output = "Sorry! No tag found..";
		  	}
	  		callBack(output);
	  	}
	});
}