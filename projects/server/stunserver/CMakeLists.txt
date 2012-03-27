###################

PROJECT( libjingle ) # if you want to

cmake_minimum_required(VERSION 2.4)

###################
###################

set(LINSOURCES
               libjingle/trunk/talk/base/latebindingsymboltable.cc
               libjingle/trunk/talk/base/linux.cc
               libjingle/trunk/talk/base/linuxfdwalk.c
               libjingle/trunk/talk/base/libdbusglibsymboltable.cc
               libjingle/trunk/talk/session/phone/libudevsymboltable.cc
               libjingle/trunk/talk/session/phone/linuxdevicemanager.cc
               libjingle/trunk/talk/session/phone/v4llookup.cc
               libjingle/trunk/talk/sound/alsasoundsystem.cc
               libjingle/trunk/talk/sound/alsasymboltable.cc
               libjingle/trunk/talk/sound/linuxsoundsystem.cc
               libjingle/trunk/talk/sound/pulseaudiosoundsystem.cc
               libjingle/trunk/talk/sound/pulseaudiosymboltable.cc
)

set(MACSOURCES
               libjingle/trunk/talk/base/macasyncsocket.cc
               libjingle/trunk/talk/base/macconversion.cc
               libjingle/trunk/talk/base/macsocketserver.cc
               libjingle/trunk/talk/base/macutils.cc
               libjingle/trunk/talk/base/macwindowpicker.cc
               libjingle/trunk/talk/base/scoped_autorelease_pool.mm
#               libjingle/trunk/talk/session/phone/carbonvideorenderer.cc
#               libjingle/trunk/talk/session/phone/macdevicemanager.cc
#               libjingle/trunk/talk/session/phone/macdevicemanagermm.mm
)

set(POSIXSOURCES
               libjingle/trunk/talk/base/unixfilesystem.cc
               libjingle/trunk/talk/base/opensslidentity.cc
               libjingle/trunk/talk/base/opensslstreamadapter.cc
               libjingle/trunk/talk/base/posix.cc
               libjingle/trunk/talk/base/sslidentity.cc
               libjingle/trunk/talk/base/sslstreamadapter.cc
)

set(WINSOURCES
               libjingle/trunk/talk/base/diskcache_win32.cc
               libjingle/trunk/talk/base/schanneladapter.cc
               libjingle/trunk/talk/base/win32.cc
               libjingle/trunk/talk/base/win32regkey.cc
               libjingle/trunk/talk/base/win32filesystem.cc
               libjingle/trunk/talk/base/win32securityerrors.cc
               libjingle/trunk/talk/base/win32socketserver.cc
               libjingle/trunk/talk/base/win32socketinit.cc
               libjingle/trunk/talk/base/win32window.cc
               libjingle/trunk/talk/base/win32windowpicker.cc
               libjingle/trunk/talk/base/winfirewall.cc
               libjingle/trunk/talk/base/winping.cc
               libjingle/trunk/talk/session/phone/win32devicemanager.cc
               libjingle/trunk/talk/session/phone/gdivideorenderer.cc
)

set(COMMONSOURCES
               libjingle/trunk/talk/base/asyncfile.cc
               libjingle/trunk/talk/base/asynchttprequest.cc
               libjingle/trunk/talk/base/asyncsocket.cc
               libjingle/trunk/talk/base/asynctcpsocket.cc
               libjingle/trunk/talk/base/asyncudpsocket.cc
               libjingle/trunk/talk/base/autodetectproxy.cc
               libjingle/trunk/talk/base/bandwidthsmoother.cc
               libjingle/trunk/talk/base/base64.cc
               libjingle/trunk/talk/base/basicpacketsocketfactory.cc
               libjingle/trunk/talk/base/bytebuffer.cc
               libjingle/trunk/talk/base/checks.cc
               libjingle/trunk/talk/base/common.cc
               libjingle/trunk/talk/base/cpuid.cc
               libjingle/trunk/talk/base/cpumonitor.cc
               libjingle/trunk/talk/base/diskcache.cc
               libjingle/trunk/talk/base/event.cc
               libjingle/trunk/talk/base/filelock.cc
               libjingle/trunk/talk/base/fileutils.cc
               libjingle/trunk/talk/base/firewallsocketserver.cc
               libjingle/trunk/talk/base/flags.cc
               libjingle/trunk/talk/base/helpers.cc
               libjingle/trunk/talk/base/host.cc
               libjingle/trunk/talk/base/httpbase.cc
               libjingle/trunk/talk/base/httpclient.cc
               libjingle/trunk/talk/base/httpcommon.cc
               libjingle/trunk/talk/base/httprequest.cc
               libjingle/trunk/talk/base/httpserver.cc
               libjingle/trunk/talk/base/ipaddress.cc
               libjingle/trunk/talk/base/logging.cc
               libjingle/trunk/talk/base/md5c.c
               libjingle/trunk/talk/base/messagehandler.cc
               libjingle/trunk/talk/base/messagequeue.cc
               libjingle/trunk/talk/base/multipart.cc
               libjingle/trunk/talk/base/natserver.cc
               libjingle/trunk/talk/base/natsocketfactory.cc
               libjingle/trunk/talk/base/nattypes.cc
               libjingle/trunk/talk/base/nethelpers.cc
               libjingle/trunk/talk/base/network.cc
               libjingle/trunk/talk/base/openssladapter.cc
               libjingle/trunk/talk/base/optionsfile.cc
               libjingle/trunk/talk/base/pathutils.cc
               libjingle/trunk/talk/base/physicalsocketserver.cc
               libjingle/trunk/talk/base/proxydetect.cc
               libjingle/trunk/talk/base/proxyinfo.cc
               libjingle/trunk/talk/base/proxyserver.cc
               libjingle/trunk/talk/base/ratetracker.cc
               libjingle/trunk/talk/base/sharedexclusivelock.cc
               libjingle/trunk/talk/base/signalthread.cc
               libjingle/trunk/talk/base/socketadapters.cc
               libjingle/trunk/talk/base/socketaddress.cc
               libjingle/trunk/talk/base/socketaddresspair.cc
               libjingle/trunk/talk/base/socketpool.cc
               libjingle/trunk/talk/base/socketstream.cc
               libjingle/trunk/talk/base/ssladapter.cc
               libjingle/trunk/talk/base/sslsocketfactory.cc
               libjingle/trunk/talk/base/stream.cc
               libjingle/trunk/talk/base/stringdigest.cc
               libjingle/trunk/talk/base/stringencode.cc
               libjingle/trunk/talk/base/stringutils.cc
               libjingle/trunk/talk/base/systeminfo.cc
               libjingle/trunk/talk/base/task.cc
               libjingle/trunk/talk/base/taskparent.cc
               libjingle/trunk/talk/base/taskrunner.cc
               libjingle/trunk/talk/base/testclient.cc
               libjingle/trunk/talk/base/thread.cc
               libjingle/trunk/talk/base/timeutils.cc
               libjingle/trunk/talk/base/timing.cc
               libjingle/trunk/talk/base/transformadapter.cc
               libjingle/trunk/talk/base/urlencode.cc
               libjingle/trunk/talk/base/versionparsing.cc
               libjingle/trunk/talk/base/virtualsocketserver.cc
               libjingle/trunk/talk/base/worker.cc
               libjingle/trunk/talk/p2p/base/constants.cc
               libjingle/trunk/talk/p2p/base/p2ptransport.cc
               libjingle/trunk/talk/p2p/base/p2ptransportchannel.cc
               libjingle/trunk/talk/p2p/base/parsing.cc
               libjingle/trunk/talk/p2p/base/port.cc
               libjingle/trunk/talk/p2p/base/portallocator.cc
               libjingle/trunk/talk/p2p/base/portallocatorsessionproxy.cc
               libjingle/trunk/talk/p2p/base/portproxy.cc
               libjingle/trunk/talk/p2p/base/pseudotcp.cc
               libjingle/trunk/talk/p2p/base/relayport.cc
               libjingle/trunk/talk/p2p/base/relayserver.cc
               libjingle/trunk/talk/p2p/base/rawtransport.cc
               libjingle/trunk/talk/p2p/base/rawtransportchannel.cc
               libjingle/trunk/talk/p2p/base/session.cc
               libjingle/trunk/talk/p2p/base/sessiondescription.cc
               libjingle/trunk/talk/p2p/base/sessionmanager.cc
               libjingle/trunk/talk/p2p/base/sessionmessages.cc
               libjingle/trunk/talk/p2p/base/stun.cc
               libjingle/trunk/talk/p2p/base/stunport.cc
               libjingle/trunk/talk/p2p/base/stunrequest.cc
               libjingle/trunk/talk/p2p/base/stunserver.cc
               libjingle/trunk/talk/p2p/base/tcpport.cc
               libjingle/trunk/talk/p2p/base/transport.cc
               libjingle/trunk/talk/p2p/base/transportchannel.cc
               libjingle/trunk/talk/p2p/base/transportchannelproxy.cc
               libjingle/trunk/talk/p2p/base/udpport.cc
               libjingle/trunk/talk/p2p/client/basicportallocator.cc
               libjingle/trunk/talk/p2p/client/connectivitychecker.cc
               libjingle/trunk/talk/p2p/client/httpportallocator.cc
               libjingle/trunk/talk/p2p/client/socketmonitor.cc
               libjingle/trunk/talk/session/tunnel/pseudotcpchannel.cc
               libjingle/trunk/talk/session/tunnel/tunnelsessionclient.cc
               libjingle/trunk/talk/session/tunnel/securetunnelsessionclient.cc
               libjingle/trunk/talk/session/phone/audiomonitor.cc
               libjingle/trunk/talk/session/phone/call.cc
               libjingle/trunk/talk/session/phone/channel.cc
               libjingle/trunk/talk/session/phone/channelmanager.cc
               libjingle/trunk/talk/session/phone/codec.cc
               libjingle/trunk/talk/session/phone/currentspeakermonitor.cc
               libjingle/trunk/talk/session/phone/devicemanager.cc
               libjingle/trunk/talk/session/phone/dummydevicemanager.cc
               libjingle/trunk/talk/session/phone/filemediaengine.cc
               libjingle/trunk/talk/session/phone/filevideocapturer.cc
               libjingle/trunk/talk/session/phone/mediaengine.cc
               libjingle/trunk/talk/session/phone/mediamessages.cc
               libjingle/trunk/talk/session/phone/mediamonitor.cc
               libjingle/trunk/talk/session/phone/mediarecorder.cc
               libjingle/trunk/talk/session/phone/mediasession.cc
               libjingle/trunk/talk/session/phone/mediasessionclient.cc
               libjingle/trunk/talk/session/phone/rtpdump.cc
               libjingle/trunk/talk/session/phone/rtputils.cc
               libjingle/trunk/talk/session/phone/rtcpmuxfilter.cc
               libjingle/trunk/talk/session/phone/soundclip.cc
               libjingle/trunk/talk/session/phone/srtpfilter.cc
               libjingle/trunk/talk/session/phone/ssrcmuxfilter.cc
               libjingle/trunk/talk/session/phone/streamparams.cc
               libjingle/trunk/talk/session/phone/videoadapter.cc
               libjingle/trunk/talk/session/phone/videocapturer.cc
               libjingle/trunk/talk/session/phone/videocommon.cc
               libjingle/trunk/talk/session/phone/videoframe.cc
               libjingle/trunk/talk/sound/nullsoundsystem.cc
               libjingle/trunk/talk/sound/nullsoundsystemfactory.cc
               libjingle/trunk/talk/sound/platformsoundsystem.cc
               libjingle/trunk/talk/sound/platformsoundsystemfactory.cc
               libjingle/trunk/talk/sound/soundsysteminterface.cc
               libjingle/trunk/talk/sound/soundsystemproxy.cc
               libjingle/trunk/talk/xmllite/qname.cc
               libjingle/trunk/talk/xmllite/xmlbuilder.cc
               libjingle/trunk/talk/xmllite/xmlconstants.cc
               libjingle/trunk/talk/xmllite/xmlelement.cc
               libjingle/trunk/talk/xmllite/xmlnsstack.cc
               libjingle/trunk/talk/xmllite/xmlparser.cc
               libjingle/trunk/talk/xmllite/xmlprinter.cc
               libjingle/trunk/talk/xmpp/constants.cc
               libjingle/trunk/talk/xmpp/hangoutpubsubclient.cc
               libjingle/trunk/talk/xmpp/iqtask.cc
               libjingle/trunk/talk/xmpp/jid.cc
               libjingle/trunk/talk/xmpp/moduleimpl.cc
               libjingle/trunk/talk/xmpp/mucroomconfigtask.cc
               libjingle/trunk/talk/xmpp/mucroomhistorytask.cc
               libjingle/trunk/talk/xmpp/mucroomlookuptask.cc
               libjingle/trunk/talk/xmpp/pubsubclient.cc
               libjingle/trunk/talk/xmpp/pubsub_task.cc
               libjingle/trunk/talk/xmpp/pubsubtasks.cc
               libjingle/trunk/talk/xmpp/receivetask.cc
               libjingle/trunk/talk/xmpp/saslmechanism.cc
               libjingle/trunk/talk/xmpp/xmppclient.cc
               libjingle/trunk/talk/xmpp/xmppengineimpl.cc
               libjingle/trunk/talk/xmpp/xmppengineimpl_iq.cc
               libjingle/trunk/talk/xmpp/xmpplogintask.cc
               libjingle/trunk/talk/xmpp/xmppstanzaparser.cc
               libjingle/trunk/talk/xmpp/xmpptask.cc
   )


###################
###################

SET (CMAKE_RUNTIME_OUTPUT_DIRECTORY
        .
        CACHE PATH
        "Single output for all executables"
        )

SET (CMAKE_LIBRARY_OUTPUT_DIRECTORY
        .
        CACHE PATH
        "Single output for all libraries"
        )

SET (CMAKE_ARCHIVE_OUTPUT_DIRECTORY
        .
        CACHE PATH
        "Single output for all libraries"
        )

INCLUDE_DIRECTORIES( 
               libjingle/trunk/talk/third_party/libudev
               libjingle/trunk/talk/third_party/expat-2.0.1/lib
               libjingle/trunk
)
#               "third_party/srtp/include
#               "third_party/srtp/crypto/include
#               "third_party/openssl/include

option (DEBUG_BUILD "Build with debug mode on.")

if (DEBUG_BUILD)
  add_definitions(-g3 -DDEBUG -D_DEBUG)
endif (DEBUG_BUILD)

add_definitions(
			-DFEATURE_ENABLE_VOICEMAIL
            -DEXPAT_RELATIVE_PATH
#        	-DSRTP_RELATIVE_PATH
        	-DXML_STATIC
)

# Both Mac and Linux are posix and we aren't planning to allow Windows...so....
add_definitions(
	-DPOSIX
    -DHASHNAMESPACE=__gnu_cxx
    -DHASH_NAMESPACE=__gnu_cxx
    -DDISABLE_DYNAMIC_CAST
    -DHAVE_OPENSSL_SSL_H=1
    # The POSIX standard says we have to define this.
    -D_REENTRANT
)
set(CMAKE_CXX_FLAGS
    "-Wno-non-virtual-dtor -Wno-ctor-dtor-privacy -fno-rtti"
)
set(CMAKE_C_FLAGS
    "-Wall -Werror -Wno-switch -fno-exceptions -fvisibility=hidden"
# -gdwarf-2"
)

message(STATUS "cmake_system_processor is: ${CMAKE_SYSTEM_PROCESSOR}")

if(CMAKE_SYSTEM_NAME MATCHES "Darwin")
   SET(SOURCES ${COMMONSOURCES} ${MACSOURCES} ${POSIXSOURCES})
   add_definitions(-Wno-deprecated-declarations)
   add_definitions(-m32 -arch i386 -fasm-blocks -isysroot /Developer/SDKs/MacOSX10.6.sdk)
   SET (CMAKE_EXE_LINKER_FLAGS 
        "-Wl -search_paths_first -m32 -arch i386 -dead_strip -mmacosx-version-min=10.6 -ObjC -isysroot /Developer/SDKs/MacOSX10.6.sdk")
   add_definitions(-DOSX)
   SET(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wno-unused-variable")
   
   find_library(CRYPTO crypto)
   find_library(SSL ssl)
   set(LIBS ${CRYPTO} ${SSL})
   
else()

  SET(SOURCES ${COMMONSOURCES} ${LINSOURCES} ${POSIXSOURCES})

  SET(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -ffunction-sections -fdata-sections")
  add_definitions(-DLINUX)
  SET (CMAKE_EXE_LINKER_FLAGS 
    "-Wl,--gc-sections -Wl,--as-needed  -Wl,--start-group")

  find_library(PT_LIB pthread)
  find_library(DL dl)
  find_library(RT rt)
  set(LIBS ${PT_LIB} ${DL} ${RT})
  
  if(CMAKE_SYSTEM_PROCESSOR MATCHES "x86_64")
    add_definitions(-m64 -fPIC)
    SET (CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -m64")
  else()
    add_definitions(-m32)
    SET (CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -m32")
  endif()
endif()

ADD_LIBRARY(libjingle ${SOURCES})

ADD_EXECUTABLE(stunserver libjingle/trunk/talk/p2p/base/stunserver_main.cc)
TARGET_LINK_LIBRARIES(stunserver libjingle ${LIBS})

###################
