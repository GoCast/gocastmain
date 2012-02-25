vars = {
    "googlecode_url": "http://%s.googlecode.com/svn",
    "chromium_trunk": "http://src.chromium.org/svn/trunk",
    "chromium_git": "http://git.chromium.org",
    "chromium_revision": "120526",
    "webrtc_revision": "1767",
    "webrtc_tag": "stable",
    "libjingle_revision": "115",
    "deps_path": "android-peerconnection/jni/deps/",
}

deps = {
    Var("deps_path") + "webrtc/src": (Var("googlecode_url") % "webrtc") + "/" + Var("webrtc_tag") + "/src@" + Var("webrtc_revision"),
    Var("deps_path") +  "webrtc/tools": (Var("googlecode_url") % "webrtc") + "/" + Var("webrtc_tag") + "/tools@" + Var("webrtc_revision"),
    Var("deps_path") + "webrtc/test": (Var("googlecode_url") % "webrtc") + "/" + Var("webrtc_tag") + "/test@" + Var("webrtc_revision"),
    Var("deps_path") + "webrtc/third_party/google-gflags": (Var("googlecode_url") % "webrtc") + "/" + Var("webrtc_tag") + "/third_party/google-gflags@" + Var("webrtc_revision"),
    Var("deps_path") + "webrtc/third_party/libvpx": (Var("googlecode_url") % "webrtc") + "/" + Var("webrtc_tag") + "/third_party/libvpx@" + Var("webrtc_revision"),
    Var("deps_path") + "webrtc/build": Var("chromium_trunk") + "/src/build@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/testing": Var("chromium_trunk") + "/src/testing@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/testing/gtest": (Var("googlecode_url") % "googletest") + "/trunk@573",
    Var("deps_path") + "webrtc/testing/gmock": (Var("googlecode_url") % "googlemock") + "/trunk@386",
    Var("deps_path") + "webrtc/tools/gyp": (Var("googlecode_url") % "gyp") + "/trunk@1187",
    
    # Needed to build common.gypi
    Var("deps_path") + "webrtc/tools/win/supalink": Var("chromium_trunk") + "/src/tools/win/supalink@" + Var("chromium_revision"),

    Var("deps_path") + "webrtc/tools/clang/scripts": Var("chromium_trunk") + "/src/tools/clang/scripts@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/tools/python": Var("chromium_trunk") + "/src/tools/python@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/tools/valgrind": Var("chromium_trunk") + "/src/tools/valgrind@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/third_party/protobuf": Var("chromium_trunk") + "/src/third_party/protobuf@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/third_party/libvpx/source/libvpx": Var("chromium_git") + /webm/libvpx.git@e479379a",
    Var("deps_path") + "webrtc/third_party/libjpeg_turbo": Var("chromium_trunk") + "/deps/third_party/linjpeg_turbo@119959",
    Var("deps_path") + "webrtc/third_party/libjpeg": Var("chromium_trunk") + "/src/third_party/libjpeg@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/third_party/yasm": Var("chromium_trunk") + "/src/third_party/yasm@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/third_party/expat": Var("chromium_trunk") + "/src/third_party/expat@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/third_party/google-flags/src": (Var("googlecode_url") % "google-flags") + "/trunk/src@45",
    Var("deps_path") + "webrtc/third_party/yasm/source/patched-yasm": Var("chromium_trunk") + "/deps/third_party/yasm/patched-yasm@73761",

    # Used by libjpeg_turbo
    Var("deps_path") + "webrtc/third_party/yasm/binaries": Var("chromium_trunk") + "/deps/third_party/yasm/binaries@74228",

    # TODO: roll to rev 164 after fixed by dev guys
    Var("deps_path") + "webrtc/third_party/libyuv": (Var("googlecode_url") % "libyuv") + "/trunk@121",

    Var("deps_path") + "webrtc/third_party/libjingle/source": (Var("googlecode_url") % "libjingle") + "/trunk/@" + Var("libjingle_revision"),
    Var("deps_path") + "webrtc/third_party/libsrtp": Var("chromium_trunk") + "/deps/third_party/libsrtp@119742",
    Var("deps_path") + "webrtc/third_party/jsoncpp": Var("chromium_trunk") + "/src/third_party/jsoncpp@" + Var("chromium_revision"),
    Var("deps_path") + "webrtc/third_party/jsoncpp/source": "http://jsoncpp.svn.sourceforge.net/svnroot/jsoncpp/trunk/jsoncpp@248",
}

deps_os = {
    "win": {
        Var("deps_path") + "webrtc/third_party/cygwin": Var("chromium_trunk") + "/deps/third_party/cygwin@66844",
    }
}

hooks = [
    {
        "pattern": ".",
        "action": ["python", "webrtc/tools/create_supplement_gypi.py", "webrtc/src/supplement.gypi"],
    },
    {
        "pattern": ".",
        "action": ["python", "webrtc/tools/clang/scripts/update.py", "--mac-only"],
    },
]
