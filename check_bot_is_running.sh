#! /bin/bash
cd $(dirname "$0")

running="$(forever list | grep bot_commands.js)"

echo $running

if [ "$running" != "" ]
then
	echo "bot is running."
else
	echo "bot is not running, starting.."
	if [ "$1" == "test" ]
	then
		echo "running test bot"
		# forever start bot_commands.js
		npm run forevertestbot
	else
		# forever start bot_commands.js --test
		npm run foreverbot
	fi
	echo "done! Bot is running now!"
fi

# you can check that is bot running and if not this script will restart it. (remove test at the end for production)
# by adding this to crontab (restarts bot on sundays 12:00 if it's down.): 
# 00 12 * * 0 cd ~/git/telegrambot/ && ./check_bot_is_running test
