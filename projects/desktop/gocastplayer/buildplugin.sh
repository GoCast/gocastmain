#!/bin/bash

if [ `uname` = "Darwin" ]; then
    echo "Building the GoCastPlayer plugin project ($1 - firebreath 1.6)..."
    cd build
    xcodebuild -project Firebreath.xcodeproj -target GCP -arch i386 -configuration $1
    cd ..
fi

