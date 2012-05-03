#!/bin/bash

if [ -f build/CMakeCache.txt ]; then
    echo "Removing build/CMakeCache.txt"
    rm -f build/CMakeCache.txt
fi

echo "Running [deps/firebreath/prepmake.sh projects build -D CMAKE_BUILD_TYPE=\"Release\"]..."
deps/firebreath/prepmake.sh projects build -D CMAKE_BUILD_TYPE="Release"

