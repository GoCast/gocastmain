#!/bin/bash

##########
# webrtc #
##########

WEBRTC_TAG="trunk"
WEBRTC_REV="1080"

mkdir -p deps
cd deps

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
fi

##############
# firebreath #
##############

if [[ $1 = "firebreath" || $* = "" ]]; then
    if [ ! -d firebreath ]; then
        echo "Cloning firebreath branch 1.6 from [git://github.com/firebreath/FireBreath.git]"
        git clone git://github.com/firebreath/FireBreath.git -b firebreath-1.6 firebreath
    fi
fi

#### COPY MODS ####

if [ `uname` = "Darwin" ]; then
    echo "Copying dep_mods/macosx to deps"
    cp -R ../dep_mods/macosx/* ./
else
    echo "Copying dep_mods/linux to deps"
    cp -R ../dep_mods/linux/* ./
fi

cd ..

