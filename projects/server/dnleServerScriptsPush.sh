#!/bin/sh
scp settings.js ec2-user@dnle.gocast.it:scripts/
scp serverBot/serverBot.js ec2-user@dnle.gocast.it:scripts/
scp switchboard/switchboard.js ec2-user@dnle.gocast.it:scripts/
scp logcatcher/logcatcher.js ec2-user@dnle.gocast.it:scripts/
scp ../gocastjs/notifier.js ec2-user@dnle.gocast.it:scripts/
