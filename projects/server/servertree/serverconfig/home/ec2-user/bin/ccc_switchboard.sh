#!/bin/sh
scr=~/ccc_scripts
unset STANFORDDNLE
export STANFORDCCC=1
echo Killing any existing switchboards
echo Current server PID is `pgrep -f "switchboard.js --ccc"`
pkill -f "switchboard.js --ccc"
echo Starting switchboard server...
node $scr/switchboard.js --ccc --debugcommands >>$scr/logs/switchboard.log 2>&1 &
echo New server PID is `pgrep -f "switchboard.js --ccc"`
echo Server started.
