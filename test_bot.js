// run this test bot with: node test_bot.js
// in chat where the bot is running send message "/id" or "/chatId" to chat.
// add chat id to your settings.json


const fs = require('fs')
settings = JSON.parse(fs.readFileSync('./settings.json'));

const Telegraf = require('telegraf');
bot_token = settings.test_bot_key;
const bot = new Telegraf(bot_token);


const flagdays = require('./data_parsers/flagdays.js');
const holidays = require('./data_parsers/holidays.js');

bot.command(['/chatId', '/id'], (ctx) => {
	console.log("This chat's id is: " + ctx.update.message.chat.id);
	ctx.reply("This chat's id is: " + ctx.update.message.chat.id);
});

bot.command(['/flag', '/flagday'], (ctx) => {
	console.log("flagday command called.");
	flagdays.getFlagdayToday((output)=> {
		ctx.reply(output);
	});
});

bot.command(['/hday', '/holiday'], (ctx) => {
	console.log("holiday command called.");
	holidays.getHolidayToday((output)=> {
		ctx.reply(output);
	});
});


console.log("bot running!");
bot.startPolling()
