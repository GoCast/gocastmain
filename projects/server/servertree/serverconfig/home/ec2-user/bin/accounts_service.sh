#!/bin/sh
echo Killing any existing accounts services
echo Current server PID is `pgrep -f "accounts_service.js"`
pkill -f "accounts_service.js"
echo Starting server...
node ~/scripts/accounts_service.js >>~/scripts/logs/accounts_service.log 2>&1 &
echo New server PID is `pgrep -f "accounts_service.js"`
echo Server started.
