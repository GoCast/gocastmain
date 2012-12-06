#!/bin/sh
scr=~/ccc_scripts
unset STANFORDDNLE
export STANFORDCCC=1
echo Killing any existing room managers
echo Current server PID is `pgrep -f "serverBot.js --ccc -roommanager"`
pkill -f "serverBot.js --ccc -roommanager"
echo Starting server...
node $scr/serverBot.js --ccc -roommanager >>$scr/logs/roommanager.log 2>&1 &
echo New server PID is `pgrep -f "serverBot.js --ccc -roommanager"`
echo Server started.
