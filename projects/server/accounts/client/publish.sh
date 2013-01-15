#!/bin/bash

dest=$1
echo "Publishing in dev mode to $dest"

# Copy html
scp -r html/* $dest/

# Copy css
scp -r css/* $dest/css/
scp deps/twitter-bootstrap/css/bootstrap.css $dest/css/
scp deps/font-awesome/css/font-awesome.css $dest/css/
scp -r deps/font-awesome/font/* $dest/css/font/

# Copy images
scp -r deps/twitter-bootstrap/img/* $dest/img/

# Copy js
scp -r js/* $dest/js/
scp -r deps/jquery-plugins/* $dest/js/
scp deps/twitter-bootstrap/js/bootstrap.js $dest/js/
scp ../../carousel/js/jquery-1.8.1.js $dest/js/

# Copy images
scp -r ../../main_website/gocastit/img/gocastheaderlogo.png $dest/img/

echo "Publishing done"
