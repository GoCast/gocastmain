#!/bin/bash

if [ `uname` = "Darwin" ]; then
    echo "Generating the GoCastPlayer plugin project (firebreath 1.6)..."
    deps/firebreath/prepmac.sh projects build -D CMAKE_OSX_ARCHITECTURES="i386" -D CMAKE_OSX_SYSROOT="/Developer/SDKs/MacOSX10.7.sdk" -D CMAKE_OSX_DEPLOYMENT_TARGET=10.7 -D LIBWEBRTC_BUILD_CONFIG=$1
else
    if [ `uname` = "Linux" ]; then
        echo "Generating the GoCastPlayer plugin project (firebreath 1.6)..."
        deps/firebreath/prepmake.sh projects build -D LIBWEBRTC_BUILD_CONFIG=$1
    fi
fi
