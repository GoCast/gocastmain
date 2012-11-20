#!/bin/sh
server="dnle.gocast.it"
scp settings.js ec2-user@$server:scripts/
scp backupPrune.js ec2-user@$server:scripts/
scp serverBot/serverBot.js ec2-user@$server:scripts/
scp serverBot/nodeWB.js ec2-user@$server:scripts/
scp switchboard/switchboard.js ec2-user@$server:scripts/
scp logcatcher/logcatcher.js ec2-user@$server:scripts/
scp ../gocastjs/notifier.js ec2-user@$server:scripts/
