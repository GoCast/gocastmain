#!/bin/sh

##########
# webrtc #
##########

WEBRTC_TAG="trunk"
WEBRTC_REV="1095"

if [[ $1 = "webrtc" || $* = "" ]]; then 
    echo "Checking for directory [webrtc]..."
    mkdir -p webrtc
    cd webrtc

    if [ ! -f .gclient ]; then
        echo "Running gclient config with targer url [http://webrtc.googlecode.com/svn/$WEBRTC_TAG/]"
        gclient config http://webrtc.googlecode.com/svn/"$WEBRTC_TAG"/
    fi

    if [ $WEBRTC_TAG != "trunk" ]; then
        if [ ! -L trunk ]; then
            echo "Creating a soft link [trunk] to the directory [stable]"
            ln -s stable trunk
        fi
    fi

    echo "Running [gclient sync -r $WEBRTC_REV --force] to obtain webrtc source..."
    gclient sync -r "$WEBRTC_REV" --force
    cd ..
    cp -R ../dep_mods/ ./
fi

