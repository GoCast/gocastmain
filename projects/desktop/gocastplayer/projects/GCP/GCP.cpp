/**********************************************************\

  Auto-generated GCP.cpp

  This file contains the auto-generated main plugin object
  implementation for the GoCastPlayer project

\**********************************************************/

#include "GCPAPI.h"

#include "GCP.h"

#include <iostream>
#include "variant_list.h"
#include "talk/session/phone/webrtcvoiceengine.h"
#include "talk/session/phone/webrtcvideoengine.h"
#include "talk/p2p/client/basicportallocator.h"

bool GCP::bLocalVideoRunning = false;
int GCP::pluginInsts = 0;
boost::thread GCP::webrtcResThread;
boost::mutex GCP::deqMutex;
std::deque<int> GCP::wrtInstructions;
GoCast::GCPVideoRenderer* GCP::pLocalRenderer = NULL;
cricket::MediaEngineInterface* GCP::pWebrtcMediaEngine = NULL;
cricket::DeviceManagerInterface* GCP::pWebrtcDeviceManager = NULL;
talk_base::scoped_ptr<talk_base::Thread> GCP::pJingleWorkerThread;
talk_base::scoped_ptr<webrtc::PeerConnectionFactory> GCP::pWebrtcPeerConnFactory;

std::string GCP::stunIP = "stun.l.google.com";
int GCP::stunPort = 19302;
FB::JSObjectPtr GCP::successCallback;
FB::JSObjectPtr GCP::failureCallback;

bool GCP::WebrtcResThreadWorker()
{
    while(1)
    {
        int instruction = -1;
        boost::this_thread::sleep(boost::posix_time::milliseconds(200));
        
        {
            boost::mutex::scoped_lock lock_(GCP::deqMutex);
            if(false == (GCP::wrtInstructions).empty())
            {
                instruction = (GCP::wrtInstructions).front();
                (GCP::wrtInstructions).pop_front();
            }
        }
            
        if(WEBRTC_RESOURCES_INIT <= instruction)        
        {            
            switch(instruction)
            {
                case WEBRTC_RESOURCES_INIT:
                    (GCP::WebrtcResourcesInit)();
                    break;
                    
                case WEBRTC_RESOURCES_DEINIT:
                    (GCP::WebrtcResourcesDeinit)();
                    break;
                    
                case WEBRTC_RES_WORKER_QUIT:
                    return true;
                    
                case START_LOCAL_VIDEO:
                    (GCP::StartLocalVideo)();
                    break;
                    
                case STOP_LOCAL_VIDEO:
                    (GCP::StopLocalVideo)();
                    break;
                    
                case MUTE_LOCAL_VOICE:
                    if(NULL != (GCP::pWebrtcMediaEngine))
                    {
                        (GCP::pWebrtcMediaEngine)->SetMicMute(true);
                    }
                    
                    break;
                    
                case UNMUTE_LOCAL_VOICE:
                    if(NULL != (GCP::pWebrtcMediaEngine))
                    {
                        (GCP::pWebrtcMediaEngine)->SetMicMute(false);
                    }
                    
                    break;
            }
        }
    }
    
    return true;
}

bool GCP::WebrtcResourcesInit()
{
    // Instantiate jingle worker thread
    if(NULL == (GCP::pJingleWorkerThread).get())
    {
        (GCP::pJingleWorkerThread).reset(new talk_base::Thread());
        if(false == (GCP::pJingleWorkerThread)->SetName("FactoryWT", NULL) ||
           false == (GCP::pJingleWorkerThread)->Start())
        {
            (GCP::pJingleWorkerThread).reset();
            (GCP::failureCallback)->InvokeAsync("", FB::variant_list_of("Worker thread start error"));
            return false;
        }
        
        std::cout << "Inited Jingle Worker Thhread" << std::endl;
    }
    
    // Instantiate webrtc media engine
    if(NULL == GCP::pWebrtcMediaEngine)
    {
        GCP::pWebrtcMediaEngine = new cricket::CompositeMediaEngine
        <cricket::WebRtcVoiceEngine,
        cricket::WebRtcVideoEngine>();
        
        std::cout << "Inited Media Engine" << std::endl;
    }
    
    // Instantiate webrtc device manager
    if(NULL == GCP::pWebrtcDeviceManager)
    {
        GCP::pWebrtcDeviceManager = new cricket::DeviceManager();
        
        std::cout << "Inited Device Manager" << std::endl;

    }
    
    // Instantiate peer connection factory
    if(NULL == (GCP::pWebrtcPeerConnFactory).get())
    {
        (GCP::pWebrtcPeerConnFactory).reset(
            new webrtc::PeerConnectionFactory(
                new cricket::BasicPortAllocator(
                    new talk_base::BasicNetworkManager(),
                    talk_base::SocketAddress(GCP::stunIP, GCP::stunPort),
                    talk_base::SocketAddress(),
                    talk_base::SocketAddress(),
                    talk_base::SocketAddress()
                ),
                GCP::pWebrtcMediaEngine,
                GCP::pWebrtcDeviceManager,
                (GCP::pJingleWorkerThread).get()
            )
        );
        
        if(false == (GCP::pWebrtcPeerConnFactory)->Initialize())
        {
            (GCP::WebrtcResourcesDeinit)();
            (GCP::failureCallback)->InvokeAsync("", FB::variant_list_of("PeerConnectionFactory Init() fail"));
            return false;
        }
        
        std::cout << "Inited PeerConnection Factory" << std::endl;
    }
    
    //SetVideoOptions here
    cricket::Device camDevice;
    if(false == (GCP::pWebrtcDeviceManager)->GetVideoCaptureDevice("", &camDevice))
    {
        return false;
    }
    
    if(false == (GCP::pWebrtcMediaEngine)->SetVideoCaptureDevice(&camDevice))
    {
        return false;
    }      

    (GCP::successCallback)->InvokeAsync("", FB::variant_list_of("Init success"));
    return true;
    
}

bool GCP::WebrtcResourcesDeinit()
{
    std::cout << "Number of instances left: " << (GCP::pluginInsts) << std::endl; 
    if(1 < (GCP::pluginInsts))
    {
        std::cout << "Ignoring deinit >1 instances left" << std::endl;
        return true;
    }
    
    if(NULL != (GCP::pWebrtcPeerConnFactory).get())
    {
        (GCP::pWebrtcPeerConnFactory).reset();
    }
    
    if(NULL != (GCP::pJingleWorkerThread).get())
    {
        (GCP::pJingleWorkerThread).reset();
    }

    if(NULL != (GCP::pWebrtcMediaEngine))
    {
        GCP::pWebrtcMediaEngine = NULL;
    }
    
    if(NULL != (GCP::pWebrtcDeviceManager))
    {
        GCP::pWebrtcDeviceManager = NULL;
    }
    
    return true;
}

bool GCP::StartLocalVideo()
{
    if(NULL == (GCP::pWebrtcMediaEngine))
    {
        std::cout << "GCP: MediaEngine Null" << std::endl;
        return false;
    }
    
    if(false == (GCP::bLocalVideoRunning))
    {
        GCP::bLocalVideoRunning = true;
        (GCP::pWebrtcMediaEngine)->SetVideoCapture(true);
        
        if(NULL != (GCP::pLocalRenderer))
        {
            (GCP::pWebrtcMediaEngine)->SetLocalRenderer(GCP::pLocalRenderer);
        }        
    }
    
    return true;
}

bool GCP::StopLocalVideo()
{
    if(NULL == (GCP::pWebrtcMediaEngine))
    {
        std::cout << "GCP: MediaEngine Null" << std::endl;
        return false;
    }

    if(true == (GCP::bLocalVideoRunning))
    {
        GCP::bLocalVideoRunning = false;
        (GCP::pWebrtcMediaEngine)->SetLocalRenderer(NULL);
        (GCP::pWebrtcMediaEngine)->SetVideoCapture(false);
    }
    
    return true;
}

///////////////////////////////////////////////////////////////////////////////
/// @fn GCP::StaticInitialize()
///
/// @brief  Called from PluginFactory::globalPluginInitialize()
///
/// @see FB::FactoryBase::globalPluginInitialize
///////////////////////////////////////////////////////////////////////////////
void GCP::StaticInitialize()
{
    // Place one-time initialization stuff here; As of FireBreath 1.4 this should only
    // be called once per process
    
    GCP::webrtcResThread = boost::thread(&GCP::WebrtcResThreadWorker);
}

///////////////////////////////////////////////////////////////////////////////
/// @fn GCP::StaticInitialize()
///
/// @brief  Called from PluginFactory::globalPluginDeinitialize()
///
/// @see FB::FactoryBase::globalPluginDeinitialize
///////////////////////////////////////////////////////////////////////////////
void GCP::StaticDeinitialize()
{
    // Place one-time deinitialization stuff here. As of FireBreath 1.4 this should
    // always be called just before the plugin library is unloaded
    (GCP::wrtInstructions).push_back(WEBRTC_RES_WORKER_QUIT); 
    (GCP::webrtcResThread).join();
}

///////////////////////////////////////////////////////////////////////////////
/// @brief  GCP constructor.  Note that your API is not available
///         at this point, nor the window.  For best results wait to use
///         the JSAPI object until the onPluginReady method is called
///////////////////////////////////////////////////////////////////////////////
GCP::GCP()
: m_pRenderer(NULL)
{
}

///////////////////////////////////////////////////////////////////////////////
/// @brief  GCP destructor.
///////////////////////////////////////////////////////////////////////////////
GCP::~GCP()
{
    // This is optional, but if you reset m_api (the shared_ptr to your JSAPI
    // root object) and tell the host to free the retained JSAPI objects then
    // unless you are holding another shared_ptr reference to your JSAPI object
    // they will be released here.
    releaseRootJSAPI();
    m_host->freeRetainedObjects();
    
    boost::mutex::scoped_lock lock_(GCP::deqMutex);
    (GCP::pluginInsts)--;
    
    if(0 == (GCP::pluginInsts))
    {        
        if(NULL != (GCP::pWebrtcPeerConnFactory).get())
        {
            (GCP::wrtInstructions).push_back(WEBRTC_RESOURCES_DEINIT);
        }
    }
}

void GCP::onPluginReady()
{
    // When this is called, the BrowserHost is attached, the JSAPI object is
    // created, and we are ready to interact with the page and such.  The
    // PluginWindow may or may not have already fire the AttachedEvent at
    // this point.
}

void GCP::shutdown()
{
    // This will be called when it is time for the plugin to shut down;
    // any threads or anything else that may hold a shared_ptr to this
    // object should be released here so that this object can be safely
    // destroyed. This is the last point that shared_from_this and weak_ptr
    // references to this object will be valid    
}

///////////////////////////////////////////////////////////////////////////////
/// @brief  Creates an instance of the JSAPI object that provides your main
///         Javascript interface.
///
/// Note that m_host is your BrowserHost and shared_ptr returns a
/// FB::PluginCorePtr, which can be used to provide a
/// boost::weak_ptr<GCP> for your JSAPI class.
///
/// Be very careful where you hold a shared_ptr to your plugin class from,
/// as it could prevent your plugin class from getting destroyed properly.
///////////////////////////////////////////////////////////////////////////////
FB::JSAPIPtr GCP::createJSAPI()
{
    // m_host is the BrowserHost
    boost::mutex::scoped_lock lock_(GCP::deqMutex);
    (GCP::pluginInsts)++;
    return boost::make_shared<GCPAPI>(FB::ptr_cast<GCP>(shared_from_this()), m_host);
}

bool GCP::onMouseDown(FB::MouseDownEvent *evt, FB::PluginWindow *)
{
    //printf("Mouse down at: %d, %d\n", evt->m_x, evt->m_y);
    return false;
}

bool GCP::onMouseUp(FB::MouseUpEvent *evt, FB::PluginWindow *)
{
    //printf("Mouse up at: %d, %d\n", evt->m_x, evt->m_y);
    return false;
}

bool GCP::onMouseMove(FB::MouseMoveEvent *evt, FB::PluginWindow *)
{
    //printf("Mouse move at: %d, %d\n", evt->m_x, evt->m_y);
    return false;
}
bool GCP::onWindowAttached(FB::AttachedEvent *evt, FB::PluginWindow *pWin)
{
    // The window is attached; act appropriately
    if(NULL != pWin)
    {
        if(NULL == m_pRenderer)
        {
            m_pRenderer = new GoCast::GCPVideoRenderer(pWin, GOCAST_DEFAULT_RENDER_WIDTH, GOCAST_DEFAULT_RENDER_HEIGHT);
        }
    }
    
    return false;
}

bool GCP::onWindowDetached(FB::DetachedEvent *evt, FB::PluginWindow *)
{
    // The window is about to be detached; act appropriately
    if(NULL != m_pRenderer)
    {
        boost::mutex::scoped_lock lock_(GCP::deqMutex);
        
        std::cout << "localVideoRunning: " << (GCP::bLocalVideoRunning? "true": "false") << std::endl;
        if(m_pRenderer == (GCP::pLocalRenderer))
        {
            if(true == (GCP::bLocalVideoRunning))
            {
                (GCP::StopLocalVideo)();
            }
            
            GCP::pLocalRenderer = NULL;
        }
        
        delete m_pRenderer;
        m_pRenderer = NULL;
    }
        
    return false;
}

bool GCP::onWindowRefresh(FB::RefreshEvent *evt, FB::PluginWindow *pWin)
{
    if(NULL != evt && NULL != pWin)
    {
        if(NULL != m_pRenderer)
        {
            m_pRenderer->OnWindowRefresh(evt);
        }
    }
    
    return false;
}
