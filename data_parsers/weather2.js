// http://apitest.foreca.net/?lon=24.934&lat=60.1755&key=API_KEY&format=json

var foreca_api_key = "API_KEY_HERE";

exports.haeForecaSaaPaikassa = (paikka, callBack) => {
  var req_url = "http://apitest.foreca.net/?lat="+paikka.lat+"&lon="+paikka.lon+"&key="+foreca_api_key+"&format=json";
  console.log(req_url);

  http.get(req_url, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var data = JSON.parse(body);
      console.log(data);
    });
  }).on('error', function(e){
    console.log("Got an error: ", e);
  });
}