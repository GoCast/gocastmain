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

class GCPAPI : public FB::JSAPIAuto//, public webrtc::PeerConnectionObserver
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
    GCPAPI(const GCPPtr& plugin, const FB::BrowserHostPtr& host) :
        m_plugin(plugin), m_host(host)
    {
        // API for getting local media (if used, corresponding plugin instance
        // shouldn't call any of the peerconnection APIS)
        registerMethod("getUserMedia", make_method(this, &GCPAPI::GetUserMedia));
        
        // Read-only property
        registerProperty("version", make_property(this, &GCPAPI::get_version));        
    }

    ///////////////////////////////////////////////////////////////////////////////
    /// @fn GCPAPI::~GCPAPI()
    ///
    /// @brief  Destructor.  Remember that this object will not be released until
    ///         the browser is done with it; this will almost definitely be after
    ///         the plugin is released.
    ///////////////////////////////////////////////////////////////////////////////
    virtual ~GCPAPI() {
    };

    GCPPtr getPlugin();

    // Read-only property ${PROPERTY.ident}
    std::string get_version();
    
    //---------------------- Plugin Methods ---------------------
    void GetUserMedia(const FB::JSObjectPtr& mediaHints,
                      const FB::JSObjectPtr& succCb,
                      const FB::JSObjectPtr& failCb);
        
private:
    GCPWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;
};

#endif // H_GCPAPI
