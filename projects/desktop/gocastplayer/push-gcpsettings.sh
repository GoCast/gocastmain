#!/bin/bash

echo "scp -r ../../xmpp-peerconnection/gcpsettings/* ec2-user@video.gocast.it:html/mmalavalli/$1/"
scp -r ../../xmpp-peerconnection/gcpsettings/* ec2-user@video.gocast.it:html/mmalavalli/$1/

echo "scp ../../gocastjs/webrtc/peerconnection.js ec2-user@video.gocast.it:html/mmalavalli/$1/"
scp ../../gocastjs/webrtc/peerconnection.js ec2-user@video.gocast.it:html/mmalavalli/$1/

echo "scp ../../server/carousel/css/jquery-ui.css ec2-user@video.gocast.it:html/mmalavalli/$1/style/"
scp ../../server/carousel/css/jquery-ui.css ec2-user@video.gocast.it:html/mmalavalli/$1/style/

echo "scp ../../server/carousel/js/jquery-ui.js ec2-user@video.gocast.it:html/mmalavalli/$1/"
scp ../../server/carousel/js/jquery-ui.js ec2-user@video.gocast.it:html/mmalavalli/$1/

echo "scp ../../server/carousel/js/jquery-1.8.1.js ec2-user@video.gocast.it:html/mmalavalli/$1/"
scp ../../server/carousel/js/jquery-1.8.1.js ec2-user@video.gocast.it:html/mmalavalli/$1/

