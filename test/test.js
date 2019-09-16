const assert = require('assert');
const settings = require('./settings.json');

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('Sunrise sunset', () => {
  describe('/sunrise', () => {
    it('should return -1 when the value is not present', () => {

      place = { nimi: settings.sun_place_name, countrycode: settings.countrycode, lat: settings.sun_at_lat, lng: settings.sun_at_lon };

      sunrise_sunset.getSunDataAtLocation(place, function (sun_data) {
        let output = "<b>Dusk till dawn at Lahti, Finland:</b> \r\n";
        output += sun_data;
        const chatId = ctx.update.message.chat.id;
        const extras = { parse_mode: 'Html' };
        bot.telegram.sendMessage(chatId, output, extras).then(() => {
          console.log("Message sent.");
        })
      });

      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});