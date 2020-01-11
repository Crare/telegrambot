#! /bin/bash
cd $(dirname "$0")


test="$(node bot_cronjob.js --message='running tests')"
sleep 1s


echo ""
echo "morning:"
test="$(node bot_cronjob.js --message='TEST 1/11 morning:' -m)"
sleep 1s

echo ""
echo "evening:"
test="$(node bot_cronjob.js --message='TEST 2/11 evening:' -e)"
sleep 1s

echo ""
echo "friday evening:"
test="$(node bot_cronjob.js --message='TEST 3/11 friday evening:' -e -f)"
sleep 1s

echo ""
echo "weather:"
test="$(node bot_cronjob.js --message='TEST 4/11 weather:' -W)"
sleep 1s

echo ""
echo "sunrise sunset:"
test="$(node bot_cronjob.js --message='TEST 5/11 sunrise sunset:' -s)"
sleep 1s

echo ""
echo "hours:"
test="$(node bot_cronjob.js --message='TEST 6/11 hours:' -h)"
sleep 1s

echo ""
echo "happenings:"
test="$(node bot_cronjob.js --message='TEST 7/11 happenings:' -H)"
sleep 1s

echo ""
echo "flagday:"
test="$(node bot_cronjob.js --message='TEST 8/11 flagday:' -F)"
sleep 1s

echo ""
echo "news:"
test="$(node bot_cronjob.js --message='TEST 9/11 news:' -N)"
sleep 1s

echo ""
echo "lunch week:"
test="$(node bot_cronjob.js --message='TEST 10/11 lunch week:' --l_week)"
sleep 1s

echo ""
echo "lunch today:"
test="$(node bot_cronjob.js --message='TEST 11/11 lunch today:' --l_today)"
sleep 1s

test="$(node bot_cronjob.js --message='running tests done')"