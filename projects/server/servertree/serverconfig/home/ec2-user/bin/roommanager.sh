#!/bin/sh
echo Killing any existing room managers
echo Current server PID is `pgrep -f "serverBot.js -roommanager"`
pkill -f "serverBot.js -roommanager"
echo Starting server...
node ~/scripts/serverBot.js -roommanager >>~/scripts/logs/roommanager.log 2>&1 &
echo New server PID is `pgrep -f "serverBot.js -roommanager"`
echo Server started.
