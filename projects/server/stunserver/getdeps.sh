#!/bin/sh

##########
# libjingle #
##########

LIBJINGLE_TAG="trunk"
LIBJINGLE_REV="115"

if [[ $1 = "libjingle" || $* = "" ]]; then 
    echo "Checking for directory [libjingle]..."
    mkdir -p libjingle
    cd libjingle

    if [ ! -f .gclient ]; then
        echo "Running gclient config with targer url [http://libjingle.googlecode.com/svn/$LIBJINGLE_TAG/]"
        gclient config http://libjingle.googlecode.com/svn/"$LIBJINGLE_TAG"/
    fi

    if [ $LIBJINGLE_TAG != "trunk" ]; then
        if [ ! -L trunk ]; then
            echo "Creating a soft link [trunk] to the directory [stable]"
            ln -s stable trunk
        fi
    fi

    echo "Running [gclient sync -r $LIBJINGLE_REV --force] to obtain libjingle source..."
    gclient sync -r "$LIBJINGLE_REV" --force
    cd ..
#    cp -R ../dep_mods/ ./
fi

