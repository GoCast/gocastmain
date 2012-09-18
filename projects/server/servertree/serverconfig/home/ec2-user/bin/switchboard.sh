#!/bin/sh
pkill -f switchboard\.js
node ~/switchboard.js --debugcommands >>~/switchboard.log 2>&1 &
