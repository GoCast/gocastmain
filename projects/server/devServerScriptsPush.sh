#!/bin/sh
server="dev.gocast.it"
dest=ec2-user@$server:scripts/
scp settings.js $dest
scp backupPrune.js $dest
scp serverBot/serverBot.js $dest
scp serverBot/nodeWB.js $dest
scp switchboard/switchboard.js $dest
scp logcatcher/*.js $dest
scp ../gocastjs/nodejs/* $dest
scp accounts/server/* $dest
