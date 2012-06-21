#!/bin/bash

##########
# webrtc #
##########

WEBRTC_TAG="trunk"
WEBRTC_REV="2407"

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

#############
# libjingle #
#############

if [[ $1 = "libjingle" || $* = "" ]]; then
    echo "Downloading [libjingle] and its dependencies..."
    cd webrtc/trunk

    echo "Patching webrtc_trunk.diff..."
    patch -p0 -i ../../../dep_mods/macosx/webrtc_trunk.diff
    cd chromium_deps

    echo "Patching chromium_deps.diff..."
    patch -p0 -i ../../../../dep_mods/macosx/chromium_deps.diff
    cd ../../

    echo "Running [gclient sync -r $WEBRTC_REV --force] to obtain webrtc source..."
    gclient sync -r "$WEBRTC_REV" --force
    cd trunk/third_party/libjingle
    
    echo "Patching libjingle.diff..."
    patch -p0 -i ../../../../../dep_mods/macosx/libjingle.diff
    cd source

    echo "Patching libjingle_source.diff..."
    patch -p0 -i ../../../../../../dep_mods/macosx/libjingle_source.diff
    cd ../../../../..
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

