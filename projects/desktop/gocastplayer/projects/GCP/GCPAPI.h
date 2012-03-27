/**********************************************************\

  Auto-generated GCPAPI.h

\**********************************************************/

#include <string>
#include <sstream>
#include <boost/weak_ptr.hpp>
#include "JSAPIAuto.h"
#include "BrowserHost.h"
#include "GCP.h"

//#include "talk/app/webrtc/peerconnection.h"

#ifndef H_GCPAPI
#define H_GCPAPI

class GCPAPI : public FB::JSAPIAuto
{
public:
    ////////////////////////////////////////////////////////////////////////////
    /// @fn GCPAPI::GCPAPI(const GCPPtr& plugin, const FB::BrowserHostPtr host)
    ///
    /// @brief  Constructor for your JSAPI object.
    ///         You should register your methods, properties, and events
    ///         that should be accessible to Javascript from here.
    ///
    /// @see FB::JSAPIAuto::registerMethod
    /// @see FB::JSAPIAuto::registerProperty
    /// @see FB::JSAPIAuto::registerEvent
    ////////////////////////////////////////////////////////////////////////////
    GCPAPI(const GCPPtr& plugin, const FB::BrowserHostPtr& host, const bool bLocal) :
        m_plugin(plugin), m_host(host), m_bLocal(bLocal)
    {
        registerMethod("echo",      make_method(this, &GCPAPI::echo));
        registerMethod("testEvent", make_method(this, &GCPAPI::testEvent));
        
        if(true == m_bLocal)
        {
            registerMethod("initLocalResources", make_method(this, &GCPAPI::InitLocalResources));
            registerMethod("deinitLocalResources", make_method(this, &GCPAPI::DeinitLocalResources));
            registerMethod("startLocalVideo", make_method(this, &GCPAPI::StartLocalVideo));
            registerMethod("stopLocalVideo", make_method(this, &GCPAPI::StopLocalVideo));
        }
        else
        {
            ;
        }
        
        // Read-write property
        registerProperty("testString",
                         make_property(this,
                                       &GCPAPI::get_testString,
                                       &GCPAPI::set_testString));
        
        // Read-only property
        registerProperty("version",
                         make_property(this,
                                       &GCPAPI::get_version));        
    }

    ///////////////////////////////////////////////////////////////////////////////
    /// @fn GCPAPI::~GCPAPI()
    ///
    /// @brief  Destructor.  Remember that this object will not be released until
    ///         the browser is done with it; this will almost definitely be after
    ///         the plugin is released.
    ///////////////////////////////////////////////////////////////////////////////
    virtual ~GCPAPI() {};

    GCPPtr getPlugin();

    // Read/Write property ${PROPERTY.ident}
    std::string get_testString();
    void set_testString(const std::string& val);

    // Read-only property ${PROPERTY.ident}
    std::string get_version();

    // Method echo
    FB::variant echo(const FB::variant& msg);
    
    // Event helpers
    FB_JSAPI_EVENT(test, 0, ());
    FB_JSAPI_EVENT(echo, 2, (const FB::variant&, const int));

    // Method test-event
    void testEvent();


    
public:
    //---------------------- Plugin Properties ------------------
    
    
    //---------------------- Plugin Methods ---------------------
    FB::variant InitLocalResources(const std::string& stunIP,
                                   const int stunPort,
                                   FB::JSObjectPtr pSuccCallback,
                                   FB::JSObjectPtr pFailCallback);
    FB::variant DeinitLocalResources();
    FB::variant StartLocalVideo();
    FB::variant StopLocalVideo();

private:
    GCPWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;
    std::string m_testString;
    bool m_bLocal;
    
/*private:
    FB::JSObjectPtr m_jsCallbackOnSignalingMessage;
    FB::JSObjectPtr m_jsCallbackOnAddStream;
    FB::JSObjectPtr m_jsCallbackOnRemoveStream;
    FB::JSObjectPtr m_jsCallbackOnLogMessage;    
    talk_base::scoped_ptr<webrtc::PeerConnection> m_pWebrtcPeerConn;*/
};

#endif // H_GCPAPI
