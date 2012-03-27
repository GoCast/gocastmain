/**********************************************************\

  Auto-generated GCP.h

  This file contains the auto-generated main plugin object
  implementation for the GoCastPlayer project

\**********************************************************/
#ifndef H_GCPPLUGIN
#define H_GCPPLUGIN

#include "PluginWindow.h"
#include "PluginEvents/MouseEvents.h"
#include "PluginEvents/AttachedEvent.h"

#include "PluginCore.h"

#include <deque>
#include <boost/thread.hpp>
#include "talk/app/webrtc/peerconnectionfactory.h"
#include "talk/base/scoped_ptr.h"
#include "talk/base/thread.h"
#include "Mac/GCPVideoRenderer.h"

#define WEBRTC_RESOURCES_INIT 0
#define WEBRTC_RESOURCES_DEINIT 1
#define WEBRTC_RES_WORKER_QUIT 2
#define START_LOCAL_VIDEO 3
#define STOP_LOCAL_VIDEO 4

FB_FORWARD_PTR(GCP)
class GCP : public FB::PluginCore
{
public:
    static void StaticInitialize();
    static void StaticDeinitialize();

public:
    static bool WebrtcResThreadWorker();
    static bool WebrtcResourcesInit();
    static bool WebrtcResourcesDeinit();
    static bool StartLocalVideo();
    static bool StopLocalVideo();
    
public:
    GCP();
    virtual ~GCP();

public:
    void onPluginReady();
    void shutdown();
    virtual FB::JSAPIPtr createJSAPI();
    // If you want your plugin to always be windowless, set this to true
    // If you want your plugin to be optionally windowless based on the
    // value of the "windowless" param tag, remove this method or return
    // FB::PluginCore::isWindowless()
    virtual bool isWindowless() { return false; }

    BEGIN_PLUGIN_EVENT_MAP()
        EVENTTYPE_CASE(FB::MouseDownEvent, onMouseDown, FB::PluginWindow)
        EVENTTYPE_CASE(FB::MouseUpEvent, onMouseUp, FB::PluginWindow)
        EVENTTYPE_CASE(FB::MouseMoveEvent, onMouseMove, FB::PluginWindow)
        EVENTTYPE_CASE(FB::MouseMoveEvent, onMouseMove, FB::PluginWindow)
        EVENTTYPE_CASE(FB::AttachedEvent, onWindowAttached, FB::PluginWindow)
        EVENTTYPE_CASE(FB::DetachedEvent, onWindowDetached, FB::PluginWindow)
        EVENTTYPE_CASE(FB::RefreshEvent, onWindowRefresh, FB::PluginWindow)
    END_PLUGIN_EVENT_MAP()

    /** BEGIN EVENTDEF -- DON'T CHANGE THIS LINE **/
    virtual bool onMouseDown(FB::MouseDownEvent *evt, FB::PluginWindow *);
    virtual bool onMouseUp(FB::MouseUpEvent *evt, FB::PluginWindow *);
    virtual bool onMouseMove(FB::MouseMoveEvent *evt, FB::PluginWindow *);
    virtual bool onWindowAttached(FB::AttachedEvent *evt, FB::PluginWindow *);
    virtual bool onWindowDetached(FB::DetachedEvent *evt, FB::PluginWindow *);
    virtual bool onWindowRefresh(FB::RefreshEvent *evt, FB::PluginWindow *);
    /** END EVENTDEF -- DON'T CHANGE THIS LINE **/
    
public:
    static int instCount;
    static boost::thread webrtcResThread;
    static boost::mutex deqMutex;
    static std::deque<int> wrtInstructions;
    static GoCast::GCPVideoRenderer* pLocalRenderer;
    static cricket::MediaEngineInterface* pWebrtcMediaEngine;
    static cricket::DeviceManagerInterface* pWebrtcDeviceManager;
    static talk_base::scoped_ptr<talk_base::Thread> pJingleWorkerThread;
    static talk_base::scoped_ptr<webrtc::PeerConnectionFactory> pWebrtcPeerConnFactory;
    
public:
    static std::string stunIP;
    static int stunPort;
    static FB::JSObjectPtr successCallback;
    static FB::JSObjectPtr failureCallback;
    
private:
    GoCast::GCPVideoRenderer* m_pRenderer;
    bool m_bLocal;
};


#endif

