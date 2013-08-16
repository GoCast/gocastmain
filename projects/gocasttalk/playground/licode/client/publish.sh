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

echo "Copying contents to folder: $folder"

# Copy html
cp *.html $folder/

# Copy js
cp js/*.js $folder/js/

echo "Generating timestamped html"

# Generate timestamped html
genTimestampedHtml $folder index.html .

if [ $mode = "publish" ]; then
    echo "Publish started to destination: $dest"
    scp -r $folder $dest/
    rm -rf $folder
    echo "Publish done"
fi
