/**********************************************************\

  Auto-generated GCPAPI.h

\**********************************************************/

#include <string>
#include <sstream>
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
    GCPAPI(const GCPPtr& plugin, const FB::BrowserHostPtr& host) :
        m_plugin(plugin), m_host(host), m_destJid("")//, m_bStopPollingReadyState(false)
    {
        registerMethod("echo",      make_method(this, &GCPAPI::echo));
        registerMethod("testEvent", make_method(this, &GCPAPI::testEvent));
        
        // APIs for local media (available only with first loaded plugin instance
        registerMethod("initLocalResources", make_method(this, &GCPAPI::InitLocalResources));
        registerMethod("deinitLocalResources", make_method(this, &GCPAPI::DeinitLocalResources));
        registerMethod("startLocalVideo", make_method(this, &GCPAPI::StartLocalVideo));
        registerMethod("stopLocalVideo", make_method(this, &GCPAPI::StopLocalVideo));
        registerMethod("muteLocalVoice", make_method(this, &GCPAPI::MuteLocalVoice));
        
        // APIs for webrtc peer connection
        registerMethod("addStream", make_method(this, &GCPAPI::AddStream));
        registerMethod("removeStream", make_method(this, &GCPAPI::RemoveStream));
        registerMethod("processSignalingMessage", make_method(this, &GCPAPI::ProcessSignalingMessage));
        registerMethod("close", make_method(this, &GCPAPI::Close));
        registerMethod("init", make_method(this, &GCPAPI::Init));
        registerMethod("connect", make_method(this, &GCPAPI::Connect));            

        registerProperty("onlogmessage",make_property(this, &GCPAPI::get_logCallback,
                                                      &GCPAPI::set_logCallback));
        registerProperty("onaddstream",make_property(this, &GCPAPI::get_onAddStreamCallback,
                                                     &GCPAPI::set_onAddStreamCallback));
        registerProperty("onremovestream",make_property(this, &GCPAPI::get_onRemoveStreamCallback,
                                                        &GCPAPI::set_onRemoveStreamCallback));
        registerProperty("onsignalingmessage",make_property(this, &GCPAPI::get_onSignalingMessageCallback,
                                                                &GCPAPI::set_onSignalingMessageCallback));
        registerProperty("onreadystatechange",make_property(this, &GCPAPI::get_onReadyStateChangeCallback,
                                                            &GCPAPI::set_onReadyStateChangeCallback));
        
        
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
    virtual ~GCPAPI() {
        if(NULL != m_pWebrtcPeerConn.get())
        {
            Close();
        }
    };

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
    //logCallback
    FB::JSObjectPtr get_logCallback();
    void set_logCallback(const FB::JSObjectPtr& pJSCallback);
    
    //onAddStreamCallback
    FB::JSObjectPtr get_onAddStreamCallback();
    void set_onAddStreamCallback(const FB::JSObjectPtr& pJSCallback);
    
    //onRemoveStreamCallback
    FB::JSObjectPtr get_onRemoveStreamCallback();
    void set_onRemoveStreamCallback(const FB::JSObjectPtr& pJSCallback);
    
    //onSignalingMessageCallback
    FB::JSObjectPtr get_onSignalingMessageCallback();
    void set_onSignalingMessageCallback(const FB::JSObjectPtr& pJSCallback);
    
    FB::JSObjectPtr get_onReadyStateChangeCallback();
    void set_onReadyStateChangeCallback(const FB::JSObjectPtr& pJSCallback);
    
    //---------------------- Plugin Methods ---------------------
    FB::variant InitLocalResources(const std::string& stunIP,
                                   const int stunPort,
                                   FB::JSObjectPtr pSuccCallback,
                                   FB::JSObjectPtr pFailCallback);
    FB::variant DeinitLocalResources();
    FB::variant StartLocalVideo();
    FB::variant StopLocalVideo();
    FB::variant MuteLocalVoice(bool bEnable);
    FB::variant Init(const std::string& destJid);
    FB::variant Connect();
    FB::variant AddStream(const std::string& streamId, bool bVideo);
    FB::variant RemoveStream(const std::string& streamId);
    FB::variant ProcessSignalingMessage(const std::string& message);
    FB::variant Close();
    
    //-------------- PeerConnection Observer Methods -----------------------
    virtual void OnAddStream(const std::string& streamId, bool bVideo);
    virtual void OnRemoveStream(const std::string& streamId, bool bVideo);
    virtual void OnSignalingMessage(const std::string& message);
    virtual void OnReadyStateChange(const webrtc::PeerConnection::ReadyState& readyState);

/*private:
    void StartPollingReadyState();
    void StopPollingReadyState();
    
public:
    void PollReadyState();*/
        
private:
    GCPWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;
    std::string m_testString;
    
private:
    std::string m_destJid;
    FB::JSObjectPtr m_jsCallbackOnSignalingMessage;
    FB::JSObjectPtr m_jsCallbackOnAddStream;
    FB::JSObjectPtr m_jsCallbackOnRemoveStream;
    FB::JSObjectPtr m_jsCallbackOnLogMessage;
    FB::JSObjectPtr m_jsCallbackOnReadyStateChange;
    talk_base::scoped_ptr<webrtc::PeerConnection> m_pWebrtcPeerConn;

private:
    /*webrtc::PeerConnection::ReadyState m_curReadyState;
    boost::thread m_pollReadyStateThread;
    boost::mutex m_pollReadyStateMutex;
    bool m_bStopPollingReadyState;*/
};

#endif // H_GCPAPI
