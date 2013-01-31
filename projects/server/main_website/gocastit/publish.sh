#!/bin/bash

function genTimestampedHtml() {
  echo "Generating timestamped html: $1/$2"
  curtime=`date +%s`
  sed s/GOCASTTIMESTAMP/$curtime/ $3/$2 >$1/$2
}

dest=$1
mode=$2
folder=$3

echo "Creating folder: $folder"

mkdir -p $folder
mkdir -p $folder/img
mkdir -p $folder/js
mkdir -p $folder/css
mkdir -p $folder/css/font

echo "Copying contents to folder: $folder"

# Copy html
cp html/* $folder/

# Copy images
cp img/* $folder/img/
cp ../../carousel/images/favicon.ico $folder/img/
cp ../../accounts/client/deps/twitter-bootstrap/img/* $folder/img/

# Copy css
cp css/* $folder/css/
cp ../../accounts/client/deps/twitter-bootstrap/css/bootstrap.css $folder/css/
cp ../../accounts/client/deps/font-awesome/css/font-awesome.css $folder/css/
cp ../../accounts/client/deps/font-awesome/font/* $folder/css/font/

# Copy js
cp js/* $folder/js/
cp ../../accounts/client/deps/twitter-bootstrap/js/bootstrap.js $folder/js/
cp ../../carousel/js/jquery-1.8.1.js $folder/js/

echo "Generating timestamped html"

# Generate timestamped html
genTimestampedHtml $folder index.html html

if [ $mode = "publish" ]; then
    echo "Publish started to destination: $dest"
    scp -r $folder $dest/
    rm -rf $folder
    echo "Publish done"
fi
