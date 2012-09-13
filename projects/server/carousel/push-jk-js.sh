#!/bin/sh

# set dest dir
dir="video.gocast.it:html/jk"

# copy files
scp ./js/* ec2-user@$dir/js
scp ../../xmpp-peerconnection/callcast.js ec2-user@$dir/js
scp ../../gocastjs/webrtc/peerconnection.js ec2-user@$dir/js
scp ../../gocastjs/ui/* ec2-user@$dir/js
scp ../../gocastjs/ibb/ibb.js ec2-user@$dir/js

