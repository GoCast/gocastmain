#!/bin/sh
server="dev.gocast.it"
dest=ec2-user@$server:scripts/
scp inviteemail.tmpl.html settings.js backupPrune.js serverBot/serverBot.js serverBot/nodeWB.js switchboard/switchboard.js logcatcher/*.js ../gocastjs/nodejs/* accounts/server/* $dest
