#!/bin/sh

# set dest dir
dir="video.gocast.it:carousel"

# prompt user
read -p "Are you sure you want to publish to $dir?" yn
case $yn in
    [Yy]* ) break;;
    * ) exit;;
esac

# copy files
scp -r * ec2-user@$dir
scp ../../xmpp-peerconnection/callcast.js ec2-user@$dir/js
scp ../../gocastjs/webrtc/peerconnection.js ec2-user@$dir/js
scp ../../gocastjs/ui/*.js ec2-user@$dir/js
scp ../../gocastjs/ibb/ibb.js ec2-user@$dir/js
