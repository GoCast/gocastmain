#!/bin/bash

if [ `uname` = "Darwin" ]; then
    echo "Building (Webrtc+Libjingle) monolithic library..."
    cd deps/webrtc/trunk/src/build
    echo "xcodebuild -project merge_libs.xcodeproj -target merged_lib -configuration $1 -sdk macosx10.6 GCC_ENABLE_CPP_RTTI=YES"
    xcodebuild -project merge_libs.xcodeproj -target merged_lib -configuration $1 -sdk macosx10.6 GCC_ENABLE_CPP_RTTI=YES
    cd ../../../../..
fi

