/**********************************************************\

  Auto-generated GCPAPI.h

\**********************************************************/
#ifndef H_GCPAPI
#define H_GCPAPI

#include <string>
#include <boost/weak_ptr.hpp>
#include "JSAPIAuto.h"
#include "BrowserHost.h"
#include "GCP.h"

#include "talk/app/webrtc/peerconnection.h"

class GCPAPI;

class SetSDPObserver : public webrtc::SetSessionDescriptionObserver
{
public:
    SetSDPObserver(GCPAPI* pJsapi);
    virtual ~SetSDPObserver();
    virtual void OnSuccess();
    virtual void OnFailure(const std::string& error);
    
private:
    GCPAPI* m_pJsapi;
};

class CreateSDPObserver : public webrtc::CreateSessionDescriptionObserver
{
public:
    CreateSDPObserver(GCPAPI* pJsapi);
    virtual ~CreateSDPObserver();
    virtual void OnSuccess(webrtc::SessionDescriptionInterface* desc);
    virtual void OnFailure(const std::string& error);
    
private:
    GCPAPI* m_pJsapi;
};

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
//    : m_readyState("PRENEW")
    : m_plugin(plugin)
    , m_host(host)
    , m_htmlId("")
    , m_pSetLocalSDPObserver(new talk_base::RefCountedObject<SetSDPObserver>(this))
    , m_pCreateOfferSDPObserver(new talk_base::RefCountedObject<CreateSDPObserver>(this))
    , m_pSetRemoteSDPObserver(new talk_base::RefCountedObject<SetSDPObserver>(this))
    , m_pCreateAnswerSDPObserver(new talk_base::RefCountedObject<CreateSDPObserver>(this))
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
        registerMethod("addIceCandidate", make_method(this, &GCPAPI::AddIceCandidate));
        registerMethod("deinit", make_method(this, &GCPAPI::DeletePeerConnection));
        
        // Config plugin js log function
        registerMethod("logFunction", make_method(this, &GCPAPI::LogFunction));
        
        // Properties
        registerProperty("version", make_property(this, &GCPAPI::get_version));
        //registerProperty("readyState", make_property(this, &GCPAPI::get_readyState));
        registerProperty("onaddstream", make_property(this, &GCPAPI::get_onaddstream,
                                                            &GCPAPI::set_onaddstream));
        registerProperty("onremovestream", make_property(this, &GCPAPI::get_onremovestream,
                                                               &GCPAPI::set_onremovestream));
        //registerProperty("onreadystatechange", make_property(this, &GCPAPI::get_onreadystatechange,
        //                                                           &GCPAPI::set_onreadystatechange));
        registerProperty("source", make_property(this, &GCPAPI::get_source, &GCPAPI::set_source));
        //registerProperty("volume", make_property(this, &GCPAPI::get_volume, &GCPAPI::set_volume));
        //registerProperty("micvolume", make_property(this, &GCPAPI::get_micvolume, &GCPAPI::set_micvolume));
        //registerProperty("videoinopts", make_property(this, &GCPAPI::get_videoinopts));
        //registerProperty("audioinopts", make_property(this, &GCPAPI::get_audioinopts));
        //registerProperty("audiooutopts", make_property(this, &GCPAPI::get_audiooutopts));
        registerProperty("logentries", make_property(this, &GCPAPI::get_logentries)); 
    }

    ///////////////////////////////////////////////////////////////////////////////
    /// @fn GCPAPI::~GCPAPI()
    ///
    /// @brief  Destructor.  Remember that this object will not be released until
    ///         the browser is done with it; this will almost definitely be after
    ///         the plugin is released.
    ///////////////////////////////////////////////////////////////////////////////
    virtual ~GCPAPI();

    GCPPtr getPlugin();

    // Property get methods
    std::string get_version();
    //std::string get_readyState();
    FB::JSObjectPtr get_onaddstream();
    FB::JSObjectPtr get_onremovestream();
    //FB::JSObjectPtr get_onreadystatechange();
    FB::JSAPIPtr get_source();
    //FB::variant get_volume();
    //FB::variant get_micvolume();
    //FB::VariantMap get_videoinopts();
    //FB::VariantList get_audioinopts();
    //FB::VariantList get_audiooutopts();
    FB::VariantList get_logentries();
    
    // Property set methods
    void set_onaddstream(const FB::JSObjectPtr& onaddstream);
    void set_onremovestream(const FB::JSObjectPtr& onremovestream);
    //void set_onreadystatechange(const FB::JSObjectPtr& onreadystatechange);
    void set_source(const FB::JSAPIPtr& stream);
    //void set_volume(FB::variant volume);
    //void set_micvolume(FB::variant volume);
    
    // C++ member get methods
    std::string HtmlId() const { return m_htmlId.convert_cast<std::string>(); }
    
    //---------------------- UserMedia Methods ---------------------
    void GetUserMedia(const FB::JSObjectPtr& mediaHints,
                      const FB::JSObjectPtr& succCb,
                      const FB::JSObjectPtr& failCb);
    
    //---------------------- PeerConnection Methods ---------------------
    FB::variant Init(const FB::variant& htmlId,
                     const FB::variant& iceConfig,
                     const FB::JSObjectPtr& iceCallback);
    FB::variant AddStream(const FB::JSAPIPtr& stream);
    FB::variant RemoveStream(const FB::JSAPIPtr& stream);
    void CreateOffer(const FB::JSObjectPtr& succCb, const FB::JSObjectPtr& failCb);
    void CreateAnswer(const FB::JSObjectPtr& succCb, const FB::JSObjectPtr& failCb);
    void SetLocalDescription(const FB::variant& action,
                             const FB::variant& sdp,
                             const FB::JSObjectPtr& succCb,
                             const FB::JSObjectPtr& failCb);
    void SetRemoteDescription(const FB::variant& action,
                              const FB::variant& sdp,
                              const FB::JSObjectPtr& succCb,
                              const FB::JSObjectPtr& failCb);
    FB::variant AddIceCandidate(const FB::variant& sdpMid,
                                const FB::variant& sdpMlineIndex,
                                const FB::variant& sdp);
    FB::variant DeletePeerConnection();
    
    //---------------------- JS Log Config Method -------------------------
    void LogFunction(const FB::JSObjectPtr& func);
    
    //---------------------- Javascript SDP Callback Call Methods ----------------
    void InvokeSetSDPSuccessCallback();
    void InvokeSetSDPFailureCallback(const std::string& error);
    void InvokeCreateSDPSuccessCallback(webrtc::SessionDescriptionInterface* desc);
    void InvokeCreateSDPFailureCallback(const std::string& error);
    
private:
    // --------------------- PeerConnectionObserver Methods -----------------
    virtual void OnError() {};
    //virtual void OnMessage(const std::string& msg) {};
    //virtual void OnSignalingMessage(const std::string& msg) {};    
    virtual void OnStateChange(StateType state_changed) {};
    virtual void OnAddStream(webrtc::MediaStreamInterface* pRemoteStream);
    virtual void OnRemoveStream(webrtc::MediaStreamInterface* pRemoteStream);
    virtual void OnIceCandidate(const webrtc::IceCandidateInterface* pCandidate);
    //virtual void OnIceComplete() {};
    
private:
    //std::string m_readyState;
    FB::JSObjectPtr m_iceCb;
    FB::JSObjectPtr m_onaddstreamCb;
    FB::JSObjectPtr m_onremovestreamCb;
    //FB::JSObjectPtr m_onreadystatechangeCb;
    FB::JSObjectPtr m_oncreatesdpsuccessCb;
    FB::JSObjectPtr m_oncreatesdpfailureCb;
    FB::JSObjectPtr m_onsetsdpsuccessCb;
    FB::JSObjectPtr m_onsetsdpfailureCb;
    
private:
    GCPWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;
    FB::JSAPIPtr m_srcStream;
    FB::variant m_htmlId;
    SetSDPObserver* m_pSetLocalSDPObserver;
    CreateSDPObserver* m_pCreateOfferSDPObserver;
    SetSDPObserver* m_pSetRemoteSDPObserver;
    CreateSDPObserver* m_pCreateAnswerSDPObserver;
    
    //FB::VariantMap m_videoDevices;
    //FB::VariantList m_audioInDevices;
    //FB::VariantList m_audioOutDevices;
};

#endif // H_GCPAPI
