#!/bin/sh
scr=~/ccc_scripts
unset STANFORDDNLE
export STANFORDCCC=1
echo Killing any existing log catcher
echo Current server PID is `pgrep -f "logcatcher.js --ccc --debugcommands"`
pkill -f "logcatcher.js --ccc --debugcommands"
echo Starting server...
node $scr/logcatcher.js --ccc --debugcommands >>$scr/logs/logcatcher.log 2>&1 &
echo New server PID is `pgrep -f "logcatcher.js --ccc --debugcommands"`
echo Server started.
