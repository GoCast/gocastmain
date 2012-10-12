#!/bin/sh
server="video.gocast.it"
scp settings.js ec2-user@$server:scripts/
scp serverBot/serverBot.js ec2-user@$server:scripts/
scp switchboard/switchboard.js ec2-user@$server:scripts/
scp logcatcher/logcatcher.js ec2-user@$server:scripts/
scp ../gocastjs/notifier.js ec2-user@$server:scripts/
