#!/bin/sh
scp strophejs-plugins/disco/strophe.disco.js ec2-user@video.gocast.it:html/scripts
scp strophejs-plugins/jingle/strophe.jingle.js ec2-user@video.gocast.it:html/scripts
scp strophejs-plugins/muc/strophe.muc.js ec2-user@video.gocast.it:html/scripts
scp ./strophe.roster.js ec2-user@video.gocast.it:html/scripts
scp ./strophe.webrtcClient.js ec2-user@video.gocast.it:html/scripts
scp *.html *.js *.css ec2-user@video.gocast.it:html
scp callcast.js ec2-user@video.gocast.it:/var/www/scripts

