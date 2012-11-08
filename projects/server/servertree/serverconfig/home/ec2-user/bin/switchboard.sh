#!/bin/sh
echo Killing any existing switchboards
echo Current server PID is `pgrep -f "switchboard.js --debugcommands"`
pkill -f "switchboard.js --debugcommands"
echo Starting switchboard server...
node ~/scripts/switchboard.js --debugcommands >>~/scripts/logs/switchboard.log 2>&1 &
echo New server PID is `pgrep -f "switchboard.js --debugcommands"`
echo Server started.
