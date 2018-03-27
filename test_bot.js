// run this test bot with: node test_bot.js
// in chat where the bot is running send message "/id" or "/chatId" to chat.
// add chat id to your settings.json

const Telegraf = require('telegraf');
const bot = new Telegraf('533294352:AAHpzJ9WECS0--1XBEk95ab8c-eI9_kMmY4');


bot.command(['/chatId', '/id'], (ctx) => {
	ctx.reply("This chat's id is: " + ctx.update.message.chat.id);
});

console.log("bot running!");
bot.startPolling()
