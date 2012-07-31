/**********************************************************\

  Auto-generated GCP.cpp

  This file contains the auto-generated main plugin object
  implementation for the GoCastPlayer project

\**********************************************************/

#include "GCPAPI.h"
#include "GCP.h"
#include "GCPWebrtcCenter.h"

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
    
    FBLOG_INFO_CUSTOM("GCP::StaticInitalize()", "Initing RtcCenter singleton...");
    if(NULL == GoCast::RtcCenter::Instance())
    {
        FBLOG_ERROR_CUSTOM("GCP::StaticInitialize()", "Failed to init RtcCenter singleton");
    }

    FBLOG_INFO_CUSTOM("GCP::StaticInitalize()", "Initing RtcCenter singleton DONE");
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
    
    FBLOG_INFO_CUSTOM("GCP::StaticDeinitalize()", "Destroying RtcCenter singleton...");
    if(NULL != GoCast::RtcCenter::Instance(true))
    {
        FBLOG_ERROR_CUSTOM("GCP::StaticDeinitialize()", "Failed to destroy RtcCenter singleton");
    }
 
    FBLOG_INFO_CUSTOM("GCP::StaticDeinitalize()", "Destroying RtcCenter singleton DONE");
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
        if(NULL == m_pRenderer.get())
        {
            FBLOG_INFO_CUSTOM("GCP::onWindowAttached()", "Creating video renderer...");
            
            m_pRenderer = webrtc::CreateVideoRenderer(new GoCast::GCPVideoRenderer(pWin));
            if("localPlayer" == static_cast<GCPAPI*>(getRootJSAPI().get())->HtmlId())
            {
                static_cast<GoCast::GCPVideoRenderer*>(m_pRenderer->renderer())->SetPreviewMode(true);
            }
            
            FBLOG_INFO_CUSTOM("GCP::onWindowAttached()", "Creating video renderer DONE");
        }
    }
    
    return true;
}

bool GCP::onWindowDetached(FB::DetachedEvent *evt, FB::PluginWindow *)
{
    return true;
}

bool GCP::onWindowRefresh(FB::RefreshEvent *evt, FB::PluginWindow *pWin)
{
    if(NULL != evt && NULL != pWin)
    {
        if(NULL != m_pRenderer.get())
        {
            static_cast<GoCast::GCPVideoRenderer*>(m_pRenderer->renderer())->OnWindowRefresh(evt);
        }
    }
    
    return true;
}
