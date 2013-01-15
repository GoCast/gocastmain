#!/bin/bash

dest=$1
echo "Publishing in dev mode to $dest"

# Copy html
scp -r html/* $dest/

# Copy images
scp -r img/* $dest/img/
scp -r ../../accounts/client/deps/twitter-bootstrap/img/* $dest/img/

# Copy css
scp -r css/* $dest/css/
scp ../../accounts/client/deps/twitter-bootstrap/css/bootstrap.css $dest/css/
scp ../../accounts/client/deps/font-awesome/css/font-awesome.css $dest/css/
scp -r ../../accounts/client/deps/font-awesome/font/* $dest/css/font/

# Copy js
scp -r js/* $dest/js/
scp ../../accounts/client/deps/twitter-bootstrap/js/bootstrap.js $dest/js/
scp ../../carousel/js/jquery-1.8.1.js $dest/js/

