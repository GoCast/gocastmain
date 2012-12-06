#!/bin/sh
echo Killing any existing file catcher
echo Current server PID is `pgrep -f "filecatcher.js --debugcommands"`
pkill -f "filecatcher.js --debugcommands"
echo Starting server...
node ~/scripts/filecatcher.js --debugcommands >>~/scripts/logs/filecatcher.log 2>&1 &
echo New server PID is `pgrep -f "filecatcher.js --debugcommands"`
echo Server started.

