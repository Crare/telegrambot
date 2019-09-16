// http://apitest.foreca.net/?lon=24.934&lat=60.1755&key=API_KEY&format=json

const foreca_api_key = "API_KEY_HERE";

exports.haeForecaSaaPaikassa = (paikka, callBack) => {
  const req_url = "http://apitest.foreca.net/?lat=" + paikka.lat + "&lon=" + paikka.lon + "&key=" + foreca_api_key + "&format=json";
  console.log(req_url);

  http.get(req_url, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      const data = JSON.parse(body);
      console.log(data);
    });
  }).on('error', (e) => {
    console.log("Got an error: ", e);
  });
}