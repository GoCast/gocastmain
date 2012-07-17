#!/bin/sh
#copy html/scripts deleted
#copy test pages commented out
#scp *.html *.js *.css ec2-user@video.gocast.it:html
scp callcast.js ec2-user@video.gocast.it:/var/www/scripts

