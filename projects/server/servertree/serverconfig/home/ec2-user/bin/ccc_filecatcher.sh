#!/bin/sh
echo Killing any existing file catcher
echo Current server PID is `pgrep -f "ccc_filecatcher.js --debugcommands"`
pkill -f "ccc_filecatcher.js --debugcommands"
echo Starting server...
node ~/ccc_scripts/filecatcher.js --debugcommands >>~/ccc_scripts/logs/filecatcher.log 2>&1 &
echo New server PID is `pgrep -f "ccc_filecatcher.js --debugcommands"`
echo Server started.

