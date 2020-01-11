# Telegrambot

Telegrambot with daily messages and commands to get information, like train-timetable, weather, and news. It also enables making simple reminders. Now also supports ruuvi-tags bluetooth beacons to read temperature-, humidity- and pressure-data.

example command can be found by typing in chat where the bot is running by /help

## example images

(Timestamps in these telegram photos are in different time zone, than the actual bot.)

reminders

![alt tag](https://github.com/Crare/telegrambot/blob/master/example_images/snip1.PNG)
![alt tag](https://github.com/Crare/telegrambot/blob/master/example_images/snip6.PNG)

VR train timetable from point A to point B.

![alt tag](https://github.com/Crare/telegrambot/blob/master/example_images/snip3.PNG)

weather data

![alt tag](https://github.com/Crare/telegrambot/blob/master/example_images/snip4.PNG)

heads or tails

![alt tag](https://github.com/Crare/telegrambot/blob/master/example_images/snip5.PNG)

# api sources

Telegrambot API: https://core.telegram.org/bots/api

Telegraf.js API: http://telegraf.js.org/#/

Movies coming from TV, API from leffatykki: http://www.leffatykki.com/api

Sunrise sunset: https://api.sunrise-sunset.org/

Train data traffic in Finland: https://rata.digitraffic.fi/

Yle news: https://yle.fi/uutiset/rss

## Frameworks used

ruuvitag sensor for ruuvitags via python-shell: https://github.com/ttu/ruuvitag-sensor

python-shell - for using python scripts

xml2json - parsing xml to json

commander - command arguments

telegraf - telegrambot framework

# Setting up

- Set all api keys that are needed in the "settings_template.json".
- Add also your bot token keys for testing bot and production, can be same if you don't mind same bot being in production.
- Rename "settings_template".json as "settings.json".

## getting api keys

watson for speach recognition, you need api username and password for this.
https://www.ibm.com/watson/developer/

openweathermap for weather API, free one is enough.
http://openweathermap.org/price

giphy api for gifs
https://developers.giphy.com/

## install required packages

in main folder of the telegrambot run in terminal:

    npm install

setup your cahtId of the for the bot in your settings.json to testChatId and if you want to use same for production then there too.

## run bot by:

running locally from console:

    npm start

or production bot by:

    npm run productiontbot

running node script in background with forever.js:

    npm run foreverbot

stopping bot

    npm run stopbot

listing of running forever-scipts:

    forever list

## cronjob for daily messages:

You need to install forever npm package globally:

    npm install -g forever

You need to run bot_cronjob.js from crontab.

Example: open crontab in console

crontab -e

and add morning message for monday (# m h dom mon dow command)
dow = day of the week starts from sunday.

    00 7 * * 1 cd ~/git/telegrambot/ && node bot_cronjob.js --morning

testing bot_cronjob messages.

    node bot_cronjob.js --morning
    node bot_cronjob.js --evening
    node bot_cronjob.js --friday
    node bot_cronjob.js --weekend
    node bot_cronjob.js --diskspace

# arguments

Sends messages to production chat, without it goes to test chat.

    --production

Shows message tailored for specific time of day.

    --morning
    --evening
    --weekend

# Troubleshooting

Some functions don't work:

Check you have all the variables filled in settings.json

Check out errors in console log. run locally.

run test.sh for testing cronjob bot for daily messages work.

    ./test.sh
