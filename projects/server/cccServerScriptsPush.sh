#!/bin/sh
server="dnle.gocast.it"
scp settings.js ec2-user@$server:ccc_scripts/
scp serverBot/serverBot.js ec2-user@$server:ccc_scripts/
scp serverBot/nodeWB.js ec2-user@$server:ccc_scripts/
scp switchboard/switchboard.js ec2-user@$server:ccc_scripts/
scp logcatcher/logcatcher.js ec2-user@$server:ccc_scripts/
scp ../gocastjs/notifier.js ec2-user@$server:ccc_scripts/
