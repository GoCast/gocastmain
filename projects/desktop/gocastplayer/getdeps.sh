#!/bin/bash

#############
# libjingle #
#############

WEBRTC_REV=4527
mkdir -p deps
cd deps

if [[ $1 = "webrtc" || $* = "" ]]; then 
    echo "Checking for directory [webrtc]..."
    mkdir -p webrtc
    cd webrtc

    if [ ! -f .gclient ]; then
        echo "Running gclient config with target url [http://webrtc.googlecode.com/svn/trunk/]"
        gclient config http://webrtc.googlecode.com/svn/trunk/
    fi

    echo "Running [gclient sync -r $WEBRTC_REV --force] to obtain webrtc source..."
    gclient sync -r "$WEBRTC_REV" --force
    cd ..

    if [[ $* = "" || $2 = "applypatch" ]]; then
        echo "Patching webrtc source..."
        patch -p0 -i ../dep_mods/common/webrtc.diff
    fi
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

cd ..

