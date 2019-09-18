#! /bin/bash
cd $(dirname "$0")


test="$(node bot_cronjob.js --test --message='running tests')"
sleep 1s


echo ""
echo "morning:"
test="$(node bot_cronjob.js --test --message='TEST morning:' -m)"
sleep 1s

echo ""
echo "evening:"
test="$(node bot_cronjob.js --test --message='TEST evening:' -e)"
sleep 1s

echo ""
echo "friday evening:"
test="$(node bot_cronjob.js --test --message='TEST friday evening:' -e -f)"
sleep 1s

echo ""
echo "weather:"
test="$(node bot_cronjob.js --test --message='TEST weather:' -W)"
sleep 1s

echo ""
echo "sunrise sunset:"
test="$(node bot_cronjob.js --test --message='TEST sunrise sunset:' -s)"
sleep 1s

echo ""
echo "hours:"
test="$(node bot_cronjob.js --test --message='TEST hours:' -h)"
sleep 1s

echo ""
echo "happenings:"
test="$(node bot_cronjob.js --test --message='TEST happenings:' -H)"
sleep 1s

echo ""
echo "flagday:"
test="$(node bot_cronjob.js --test --message='TEST flagday:' -F)"
sleep 1s

echo ""
echo "news:"
test="$(node bot_cronjob.js --test --message='TEST news:' -N)"
sleep 1s

echo ""
echo "gif:"
test="$(node bot_cronjob.js --test --message='TEST gif:' -g)"
sleep 1s

echo ""
echo "lunch week:"
test="$(node bot_cronjob.js --test --message='TEST lunch week:' --l_week)"
sleep 1s

echo ""
echo "lunch today:"
test="$(node bot_cronjob.js --test --message='TEST lunch today:' --l_today)"
sleep 1s

test="$(node bot_cronjob.js --test --message='running tests done')"