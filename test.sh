#! /bin/bash
cd $(dirname "$0")


test="$(node bot_cronjob.js --message='running tests')"
sleep 1s


echo ""
echo "morning:"
test="$(node bot_cronjob.js --message='TEST 1/8 morning:' -m)"
sleep 1s

echo ""
echo "evening:"
test="$(node bot_cronjob.js --message='TEST 2/8 evening:' -e)"
sleep 1s

echo ""
echo "friday evening:"
test="$(node bot_cronjob.js --message='TEST 3/8 friday evening:' -e -f)"
sleep 1s

echo ""
echo "weather:"
test="$(node bot_cronjob.js --message='TEST 4/8 weather:' -W)"
sleep 1s

echo ""
echo "sunrise sunset:"
test="$(node bot_cronjob.js --message='TEST 5/8 sunrise sunset:' -s)"
sleep 1s

echo ""
echo "flagday:"
test="$(node bot_cronjob.js --message='TEST 6/8 flagday:' -F)"
sleep 1s

echo ""
echo "news:"
test="$(node bot_cronjob.js --message='TEST 7/8 news:' -N)"
sleep 1s

echo ""
echo "lunch week:"
test="$(node bot_cronjob.js --message='TEST 8/8 lunch week:' --l_week)"
sleep 1s

test="$(node bot_cronjob.js --message='running tests done')"