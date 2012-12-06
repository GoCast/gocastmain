#!/bin/sh
scr=~/ccc_scripts
unset STANFORDDNLE
export STANFORDCCC=1
echo Killing current running serverBot...
echo Current server PID is `pgrep -f "serverBot.js --ccc -main"`
pkill -f "serverBot.js --ccc -main"
echo Running new serverbot...
node $scr/serverBot.js --ccc -main >>$scr/logs/serverBot.log 2>&1 &
echo New server PID is `pgrep -f "serverBot.js --ccc -main"`
