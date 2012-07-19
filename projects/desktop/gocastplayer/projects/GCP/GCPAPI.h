/**********************************************************\

  Auto-generated GCPAPI.h

\**********************************************************/

#include <string>
#include <boost/weak_ptr.hpp>
#include "JSAPIAuto.h"
#include "BrowserHost.h"
#include "GCP.h"

#include "talk/app/webrtc/peerconnection.h"

#ifndef H_GCPAPI
#define H_GCPAPI

class GCPAPI : public FB::JSAPIAuto, public webrtc::PeerConnectionObserver
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
    GCPAPI(const GCPPtr& plugin, const FB::BrowserHostPtr& host)
    : m_readyState("PRENEW")
    , m_plugin(plugin)
    , m_host(host)
    , m_htmlId("localPlayer")
    {
        // API for getting local media (if used, corresponding plugin instance
        // shouldn't call any of the peerconnection APIS)
        registerMethod("getUserMedia", make_method(this, &GCPAPI::GetUserMedia));
        
        // PeerConnection APIs
        registerMethod("init", make_method(this, &GCPAPI::Init));
        registerMethod("addStream", make_method(this, &GCPAPI::AddStream));
        registerMethod("removeStream", make_method(this, &GCPAPI::RemoveStream));
        registerMethod("createOffer", make_method(this, &GCPAPI::CreateOffer));
        registerMethod("createAnswer", make_method(this, &GCPAPI::CreateAnswer));
        registerMethod("setLocalDescription", make_method(this, &GCPAPI::SetLocalDescription));
        registerMethod("setRemoteDescription", make_method(this, &GCPAPI::SetRemoteDescription));
        registerMethod("processIceMessage", make_method(this, &GCPAPI::ProcessIceMessage));
        registerMethod("startIce", make_method(this, &GCPAPI::StartIce));
        
        // Properties
        registerProperty("version", make_property(this, &GCPAPI::get_version));
        registerProperty("readyState", make_property(this, &GCPAPI::get_readyState));
        registerProperty("onaddstream", make_property(this, &GCPAPI::get_onaddstream,
                                                            &GCPAPI::set_onaddstream));
        registerProperty("onremovestream", make_property(this, &GCPAPI::get_onremovestream,
                                                               &GCPAPI::set_onremovestream));
        registerProperty("onreadystatechange", make_property(this, &GCPAPI::get_onreadystatechange,
                                                                   &GCPAPI::set_onreadystatechange));
        registerProperty("source", make_property(this, &GCPAPI::get_source, &GCPAPI::set_source));
    }

    ///////////////////////////////////////////////////////////////////////////////
    /// @fn GCPAPI::~GCPAPI()
    ///
    /// @brief  Destructor.  Remember that this object will not be released until
    ///         the browser is done with it; this will almost definitely be after
    ///         the plugin is released.
    ///////////////////////////////////////////////////////////////////////////////
    virtual ~GCPAPI() {
        DeletePeerConnection();
    }

    GCPPtr getPlugin();

    // Property get methods
    std::string get_version();
    std::string get_readyState();
    FB::JSObjectPtr get_onaddstream();
    FB::JSObjectPtr get_onremovestream();
    FB::JSObjectPtr get_onreadystatechange();
    FB::JSAPIPtr get_source();
    
    // Property set methods
    void set_onaddstream(const FB::JSObjectPtr& onaddstream);
    void set_onremovestream(const FB::JSObjectPtr& onremovestream);
    void set_onreadystatechange(const FB::JSObjectPtr& onreadystatechange);
    void set_source(const FB::JSAPIPtr& stream);
    
    //---------------------- UserMedia Methods ---------------------
    void GetUserMedia(const FB::JSObjectPtr& mediaHints,
                      const FB::JSObjectPtr& succCb,
                      const FB::JSObjectPtr& failCb);
    
    //---------------------- PeerConnection Methods ---------------------
    FB::variant Init(const FB::variant& htmlId,
                     const FB::variant& iceConfig,
                     const FB::JSObjectPtr& iceCallback);
    void AddStream(const FB::JSAPIPtr& stream);
    void RemoveStream(const FB::JSAPIPtr& stream);
    FB::variant CreateOffer(const FB::JSObjectPtr& mediaHints);
    FB::variant CreateAnswer(const FB::variant& offer, const FB::JSObjectPtr& mediaHints);
    void SetLocalDescription(const FB::variant& action,
                             const FB::variant& sdp,
                             const FB::JSObjectPtr& succCb,
                             const FB::JSObjectPtr& failCb);
    void SetRemoteDescription(const FB::variant& action, const FB::variant& sdp);
    void ProcessIceMessage(const FB::variant& sdp);
    void StartIce();
    
private:
    // --------------------- PeerConnectionObserver Methods -----------------
    virtual void OnError() {};
    virtual void OnMessage(const std::string& msg) {};
    virtual void OnSignalingMessage(const std::string& msg) {};    
    virtual void OnStateChange(StateType state_changed);
    virtual void OnAddStream(webrtc::MediaStreamInterface* pRemoteStream);
    virtual void OnRemoveStream(webrtc::MediaStreamInterface* pRemoteStream);
    virtual void OnIceCandidate(const webrtc::IceCandidateInterface* pCandidate);
    virtual void OnIceComplete();

private:
    void DeletePeerConnection();
    
private:
    std::string m_readyState;
    FB::JSObjectPtr m_iceCb;
    FB::JSObjectPtr m_onaddstreamCb;
    FB::JSObjectPtr m_onremovestreamCb;
    FB::JSObjectPtr m_onreadystatechangeCb;
    
private:
    GCPWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;
    FB::JSAPIPtr m_srcStream;
    FB::variant m_htmlId;
};

#endif // H_GCPAPI
