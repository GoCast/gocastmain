LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)
LOCAL_MODULE := libjingle
LOCAL_CPP_EXTENSION := .cc

LOCAL_SRC_FILES := \
    app/webrtc/peerconnectionfactory.cc \
    app/webrtc/peerconnectionimpl.cc \
    app/webrtc/peerconnectionproxy.cc \
    app/webrtc/webrtcsession.cc \
    app/webrtc/webrtcjson.cc \
    base/asyncfile.cc \
    base/asynchttprequest.cc \
    base/asyncsocket.cc \
    base/asynctcpsocket.cc \
    base/asyncudpsocket.cc \
    base/autodetectproxy.cc \
    base/base64.cc \
    base/basicpacketsocketfactory.cc \
    base/bytebuffer.cc \
    base/checks.cc \
    base/common.cc \
    base/diskcache.cc \
    base/event.cc \
    base/fileutils.cc \
    base/firewallsocketserver.cc \
    base/flags.cc \
    base/helpers.cc \
    base/host.cc \
    base/httpbase.cc \
    base/httpclient.cc \
    base/httpcommon.cc \
    base/httprequest.cc \
    base/json.cc \
    base/logging.cc \
    base/md5c.c \
    base/messagehandler.cc \
    base/messagequeue.cc \
    base/nethelpers.cc \
    base/network.cc \
    base/pathutils.cc \
    base/physicalsocketserver.cc \
    base/proxydetect.cc \
    base/proxyinfo.cc \
    base/ratetracker.cc \
    base/signalthread.cc \
    base/socketadapters.cc \
    base/socketaddress.cc \
    base/socketaddresspair.cc \
    base/socketpool.cc \
    base/socketstream.cc \
    base/ssladapter.cc \
    base/sslsocketfactory.cc \
    base/sslstreamadapter.cc \
    base/stream.cc \
    base/stringdigest.cc \
    base/stringencode.cc \
    base/stringutils.cc \
    base/task.cc \
    base/taskparent.cc \
    base/taskrunner.cc \
    base/thread.cc \
    base/time.cc \
    base/unixfilesystem.cc \
    base/urlencode.cc \
    base/worker.cc \
    p2p/base/constants.cc \
    p2p/base/p2ptransport.cc \
    p2p/base/p2ptransportchannel.cc \
    p2p/base/port.cc \
    p2p/base/pseudotcp.cc \
    p2p/base/rawtransport.cc \
    p2p/base/rawtransportchannel.cc \
    p2p/base/relayport.cc \
    p2p/base/session.cc \
    p2p/base/sessiondescription.cc \
    p2p/base/sessionmanager.cc \
    p2p/base/sessionmessages.cc \
    p2p/base/parsing.cc \
    p2p/base/stun.cc \
    p2p/base/stunport.cc \
    p2p/base/stunrequest.cc \
    p2p/base/tcpport.cc \
    p2p/base/transport.cc \
    p2p/base/transportchannel.cc \
    p2p/base/transportchannelproxy.cc \
    p2p/base/udpport.cc \
    p2p/client/basicportallocator.cc \
    p2p/client/httpportallocator.cc \
    p2p/client/socketmonitor.cc \
    session/phone/audiomonitor.cc \
    session/phone/call.cc \
    session/phone/channel.cc \
    session/phone/channelmanager.cc \
    session/phone/codec.cc \
    session/phone/currentspeakermonitor.cc \
    session/phone/devicemanager.cc \
    session/phone/filemediaengine.cc \
    session/phone/mediaengine.cc \
    session/phone/mediamessages.cc \
    session/phone/mediamonitor.cc \
    session/phone/mediasession.cc \
    session/phone/mediasessionclient.cc \
    session/phone/rtcpmuxfilter.cc \
    session/phone/rtpdump.cc \
    session/phone/rtputils.cc \
    session/phone/soundclip.cc \
    session/phone/srtpfilter.cc \
    session/phone/webrtcpassthroughrender.cc \
    session/phone/webrtcvideoengine.cc \
    session/phone/webrtcvideoframe.cc \
    session/phone/webrtcvoiceengine.cc \
    session/tunnel/pseudotcpchannel.cc \
    session/tunnel/tunnelsessionclient.cc \
    xmllite/qname.cc \
    xmllite/xmlbuilder.cc \
    xmllite/xmlconstants.cc \
    xmllite/xmlelement.cc \
    xmllite/xmlnsstack.cc \
    xmllite/xmlparser.cc \
    xmllite/xmlprinter.cc \
    xmpp/constants.cc \
    xmpp/jid.cc \
    xmpp/ratelimitmanager.cc \
    xmpp/saslmechanism.cc \
    xmpp/xmppclient.cc \
    xmpp/xmppengineimpl.cc \
    xmpp/xmppengineimpl_iq.cc \
    xmpp/xmpplogintask.cc \
    xmpp/xmppstanzaparser.cc \
    xmpp/xmpptask.cc

LOCAL_C_INCLUDES := \
    $(LOCAL_PATH)/.. \
    $(LOCAL_PATH)/../../../../src \
    $(LOCAL_PATH)/../../../../src/modules/interface \
    $(LOCAL_PATH)/../../../expat/files/lib \
    $(LOCAL_PATH)/../../../jsoncpp/include

LOCAL_CFLAGS := \
    -D_DEBUG \
    -DPOSIX \
    -DANDROID \
    -DWEBRTC_ANDROID \
    -DWEBRTC_RELATIVE_PATH \
    -DEXPAT_RELATIVE_PATH \
    -DJSONCPP_RELATIVE_PATH \
    -DHAVE_WEBRTC \
    -DHAVE_WEBRTC_VOICE \
    -DHAVE_WEBRTC_VIDEO \
    -DNO_SOUND_SYSTEM
#    -DFEATURE_ENABLE_SSL \
#    -DFEATURE_ENABLE_VOICEMAIL \
#    -DSAFE_TO_DEFINE_TALK_BASE_LOGGING_MACROS

LOCAL_LDLIBS := -llog

include $(BUILD_STATIC_LIBRARY)

