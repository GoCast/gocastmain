#### BUILD LIBSRTP ####

cd trunk/third_party/libsrtp
if [ ! -f crypto/include/config.h ]; then
    ./configure CFLAGS="-m32 -arch i386" LDFLAGS="-m32 -arch i386"
fi
make
cd ../../..



#### BUILD WEBRTC LIBS ####

trunk/build/gyp_chromium --depth=trunk trunk/webrtc.gyp
cd trunk
if [[ $1 = "clean" ]]; then
    xcodebuild -project webrtc.xcodeproj -target All -configuration Debug clean
    xcodebuild -project webrtc.xcodeproj -target All -configuration Release clean
fi

xcodebuild -project webrtc.xcodeproj -target All -configuration Debug
xcodebuild -project webrtc.xcodeproj -target All -configuration Release



#### BUILD MONOLITHIC LIBRARY ####

thelibs=( libjingle_app.a libjsoncpp.a libvideo_capture_module.a libwebrtc_utility.a libaudio_coding_module.a libCNG.a libG711.a libG722.a libiSAC.a libPCM16B.a libNetEq.a libvad.a libsystem_wrappers.a libwebrtc_video_coding.a libwebrtc_i420.a libwebrtc_vp8.a libwebrtc_vplib.a libvideo_render_module.a libvideo_engine_core.a libwebrtc_jpeg.a libjpeg_turbo.a libmedia_file.a librtp_rtcp.a libudp_transport.a libvideo_processing.a libaudio_conference_mixer.a libaudio_device.a libaudio_processing.a libaudioproc_debug_proto.a libaec.a libapm_util.a libaecm.a libagc.a libns.a libjingle_p2p.a libvoice_engine_core.a libprotobuf_lite.a libiLBC.a libresampler.a libiSACFix.a libjingle.a libvpx.a libexpat.a libsignal_processing.a )

mkdir -p xcodebuild/Debug
mkdir -p xcodebuild/Release

cd xcodebuild/Debug
rm -f libwebrtc_Debug.a
libtool -static -arch_only i386 -o libwebrtc_Debug.a ${thelibs[@]:0}

cd ../Release
rm -f libwebrtc_Release.a
libtool -static -arch_only i386 -o libwebrtc_Release.a ${thelibs[@]:0}
cd ../../..

