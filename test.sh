#! /bin/bash
cd $(dirname "$0")

echo ""
echo "morning message"
test="$(node bot_cronjob.js --test -n -m)"

echo ""
echo "evening message"
test="$(node bot_cronjob.js --test -n -e)"

echo ""
echo "friday message"
test="$(node bot_cronjob.js --test -n -f)"

echo ""
echo "weekend message"
test="$(node bot_cronjob.js --test -n -w)"

echo ""
echo "weather"
test="$(node bot_cronjob.js --test -n -W)"

echo ""
echo "weather 2 days"
test="$(node bot_cronjob.js --test -n -W --w_days 2)"

echo ""
echo "sunrise"
test="$(node bot_cronjob.js --test -n -s)"

echo ""
echo "trains"
test="$(node bot_cronjob.js --test -n -t)"

echo ""
echo "happening"
test="$(node bot_cronjob.js --test -n -h)"

echo ""
echo "holiday"
test="$(node bot_cronjob.js --test -n -H)"

echo ""
echo "Movies"
test="$(node bot_cronjob.js --test -n -M)"

echo ""
echo "Flagday"
test="$(node bot_cronjob.js --test -n -F)"

echo ""
echo "News"
test="$(node bot_cronjob.js --test -n -N)"

echo ""
echo "gif"
test="$(node bot_cronjob.js --test -n -g)"

echo ""
echo "multiple"
test="$(node bot_cronjob.js --test -n -eWshHFNMg)"

echo ""
echo "trains HKI TPE"
test="$(node bot_cronjob.js --test -n -t --t_from HKI --t_to TPE)"

echo ""
echo "trains Pasila Lahti 5"
test="$(node bot_cronjob.js --test -n -t --t_from Pasila --t_to Lahti --t_amount 5)"

echo ""
echo "trains Lahti Pasila weather at Lahti lat lon"
test="$(node bot_cronjob.js --test -n -W --w_name Lahti --lat 60.98267 --lon 25.66151)"

echo ""
echo "trains Lahti Pasila weather at Helsinki lat lon"
test="$(node bot_cronjob.js --test -n -W --w_name Helsinki --lat 60.192059 --lon 24.945831)"
