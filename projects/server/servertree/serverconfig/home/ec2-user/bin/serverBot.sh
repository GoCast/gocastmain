#!/bin/sh
echo Killing current running serverBot...
echo Current server PID is `pgrep -f "serverBot.js -main"`
pkill -f "serverBot.js -main"
echo Running new serverbot...
node ~/serverBot.js -main ~/etzchayim/xml/schedules.xml ~/friends/xml/schedules.xml >>~/serverBot.log 2>&1 &
echo New server PID is `pgrep -f "serverBot.js -main"`
