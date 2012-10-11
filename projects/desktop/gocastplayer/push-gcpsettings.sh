#!/bin/bash

function genIndexHtml() {
  curtime=`date +%s`
  index_html=`cat $1/index.html`
  index_html_ts=${index_html//GOCASTTIMESTAMP/$curtime}
  echo "$index_html_ts" > index.html
}

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

echo "Generating index.html..."
genIndexHtml ../../xmpp-peerconnection/gcpsettings
echo "Generating index.html... DONE"

echo "Copying index.html to server..."
scp index.html ec2-user@video.gocast.it:html/mmalavalli/$1/
echo "Copying index.html to server... DONE"

rm -f index.html

