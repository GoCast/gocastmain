#!/bin/bash

if [ `uname` = "Darwin" ]; then
    echo "Generating the GoCastPlayer plugin project (firebreath 1.6)..."
    deps/firebreath/prepmac.sh projects build -D CMAKE_OSX_ARCHITECTURES="i386" -D CMAKE_OSX_SYSROOT="/Developer/SDKs/MacOSX10.6.sdk"
fi
