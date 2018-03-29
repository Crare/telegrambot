# Telegrambot
Telegrambot with daily messages and commands to get information, like train-timetable, weather, and news. It also enables making simple reminders. Also it supports voice messages in english language. Voice message is sent to Microsoft Watson voice-recoqnition API and it tries to detect what you said.

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

random gif or semi-random with tag.

![alt tag](https://github.com/Crare/telegrambot/blob/master/example_images/snip7.PNG)

# api sources
Telegrambot API: https://core.telegram.org/bots/api

Telegraf.js API: http://telegraf.js.org/#/

Giphy gifs: https://developers.giphy.com/

Movies coming from TV, API from leffatykki: http://www.leffatykki.com/api

Sunrise sunset: https://api.sunrise-sunset.org/

Train data traffic in Finland: https://rata.digitraffic.fi/

Watson speach recognition: https://www.ibm.com/watson/developer/

Yle news: https://yle.fi/uutiset/rss

## unused apis currently

and/or elisa viihde API: https://github.com/enyone/elisaviihde

there is also a test of foreca weather that is unused: http://apitest.foreca.net/


# Setting up
* Set all api keys that are needed in the "settings_template.json".
* Add also your bot token keys for testing bot and production, can be same if you don't mind same bot being in production.
* Rename "settings_template".json as "settings.json".

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
    
## get chatId by running test_bot.js
    node test_bot.js
then send message to chat with the bot:
    /chatId
add the id given by the bot to your settings.json to testChatId and if you wanna use same for production then there too.

## run bot by:
    node bot_commands.js
  
  or test bot by:
  
    node bot_commands.js --test

## cronjob for daily messages:
  You could use forever.js for running node in the background.
  command example:
  
    forever start bot_cronjob.js --cronjob --MorningMessage
    
  or test bot:
  
    forever start bot_cronjob.js --test --MorningMessage
 # arguments
 Sends messages to production chat.
 
    --cronjob
    
 Sends messages as test to testChat.
 
    --test
    
 Shows message tailored for specific time of day.
 
    --morningMessage
    --eveningMessage
    --weekendMessage
    
 Displays diskspace at /var/www/html/ used,total,free space.
 
    --diskspace
