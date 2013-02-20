#!/bin/sh
server="video.gocast.it"
dest=ec2-user@$server:scripts/
scp settings.js backupPrune.js serverBot/serverBot.js serverBot/nodeWB.js switchboard/switchboard.js logcatcher/*.js ../gocastjs/nodejs/* accounts/server/* $dest

