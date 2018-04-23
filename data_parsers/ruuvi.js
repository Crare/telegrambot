var PythonShell = require('python-shell');


exports.getRuuviTagData = (tag_id, callBack) => {
	var options = {
		// mode: 'text',
		// pythonPath: './',
		// pythonOptions: ['tag'], // get print results in real-time
		scriptPath: './data_parsers/',
		args: ['--tag', tag_id]
	};

	PythonShell.run('ruuvi.py', options, function (err, results) {
	  	if (err) {
	  		console.error(err);
	  		callBack(err);
	  	} else {
	  		// results is an array consisting of messages collected during execution
	  		console.log('results: %j', results);
	  		results = JSON.parse(results);
	  		let output = "";
	  		if(results.length > 0) {
		  		output = "<b>Ruuvitag " + ruuvitag.name + "</b>\r\n";
		  		output += "Temperature: " + results[0].temperature + "\r\n";
		  		output += "Humidity: " + results[0].humidity + "\r\n";
		  		output += "Pressure: " + results[0].pressure + "\r\n";
		  	} else {
		  		output = "Sorry! No tag found..";
		  	}
	  		callBack(output);
	  	}
	});
}