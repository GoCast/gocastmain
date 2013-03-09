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
mkdir -p $folder/js
mkdir -p $folder/css
mkdir -p $folder/img

echo "Copying contents to folder: $folder"

# Copy html
cp html/* $folder/

# Copy js
cp ../../server/carousel/js/jquery-1.8.1.js $folder/js/
cp ../../server/accounts/client/deps/twitter-bootstrap/js/bootstrap.js $folder/js/

# Copy css
cp css/index.css $folder/css/
cp ../../server/accounts/client/deps/twitter-bootstrap/css/bootstrap.css $folder/css/
cp ../../server/accounts/client/deps/font-awesome/css/font-awesome.css $folder/css/
cp ../../server/accounts/client/deps/font-awesome/font/* $folder/css/

# Copy images
cp ../../server/main_website/gocastit/img/gocastheaderlogo.png $folder/img/

echo "Generating timestamped html"

# Generate timestamped html
genTimestampedHtml $folder index.html html

if [ $mode = "publish" ]; then
    echo "Publish started to destination: $dest"
    scp -r $folder $dest/
    rm -rf $folder
    echo "Publish done"
fi
