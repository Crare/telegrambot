const assert = require('assert');
const settings = require('./settings.json');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('Sunrise sunset', function() {
  describe('/sunrise', function() {
    it('should return -1 when the value is not present', function() {

      place = { nimi: settings.sun_place_name, countrycode: settings.countrycode, lat: settings.sun_at_lat, lng: settings.sun_at_lon};
      
      sunrise_sunset.getSunDataAtLocation(place, function(sun_data) {
        var output = "<b>Dusk till dawn at Lahti, Finland:</b> \r\n";
            output += sun_data;
        var chatId = ctx.update.message.chat.id;
        var extras = {parse_mode: 'Html'};
        bot.telegram.sendMessage(chatId, output, extras).then(function() {
          console.log("Message sent.");
        })
      });

      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});