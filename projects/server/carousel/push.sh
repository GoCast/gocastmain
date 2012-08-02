#!/bin/sh
scp -r * ec2-user@video.gocast.it:carousel
scp ../../xmpp-peerconnection/callcast.js ec2-user@video.gocast.it:carousel/js
scp ../../gocastjs/webrtc/peerconnection.js ec2-user@video.gocast.it:carousel/js

