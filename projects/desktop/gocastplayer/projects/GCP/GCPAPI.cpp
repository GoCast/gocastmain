/**********************************************************\

  Auto-generated GCPAPI.cpp

\**********************************************************/

#include "JSObject.h"
#include "variant_list.h"
#include "DOM/Document.h"
#include "global/config.h"

#include "GCPAPI.h"
#include "GCPWebrtcCenter.h"
#include "GCPMediaStream.h"

///////////////////////////////////////////////////////////////////////////////
/// @fn GCPPtr GCPAPI::getPlugin()
///
/// @brief  Gets a reference to the plugin that was passed in when the object
///         was created.  If the plugin has already been released then this
///         will throw a FB::script_error that will be translated into a
///         javascript exception in the page.
///////////////////////////////////////////////////////////////////////////////
GCPPtr GCPAPI::getPlugin()
{
    GCPPtr plugin(m_plugin.lock());
    if (!plugin) {
        throw FB::script_error("The plugin is invalid");
    }
    return plugin;
}

std::string GCPAPI::get_version()
{
    return FBSTRING_PLUGIN_VERSION;
}

std::string GCPAPI::get_readyState()
{
    return m_readyState;
}

FB::JSAPIPtr GCPAPI::get_source()
{
    return m_srcStream;
}

FB::JSObjectPtr GCPAPI::get_onaddstream()
{
    return m_onaddstreamCb;
}

FB::JSObjectPtr GCPAPI::get_onremovestream()
{
    return m_onremovestreamCb;
}

FB::JSObjectPtr GCPAPI::get_onreadystatechange()
{
    return m_onreadystatechangeCb;
}

void GCPAPI::set_onaddstream(const FB::JSObjectPtr &onaddstream)
{
    m_onaddstreamCb = onaddstream;
}

void GCPAPI::set_onremovestream(const FB::JSObjectPtr &onremovestream)
{
    m_onremovestreamCb = onremovestream;
}

void GCPAPI::set_onreadystatechange(const FB::JSObjectPtr &onreadystatechange)
{
    m_onreadystatechangeCb = onreadystatechange;
}

void GCPAPI::set_source(const FB::JSAPIPtr& stream)
{
    m_srcStream = stream;
    if(NULL != stream.get())
    {
        if("localPlayer" == m_htmlId.convert_cast<std::string>())
        {
            FBLOG_INFO_CUSTOM(funcstr("GCAPAPI::set_source", m_htmlId.convert_cast<std::string>()),
                              "Setting local video track renderer...");
			if(NULL != getPlugin()->Renderer().get())
			{
				GoCast::GCPVideoRenderer* pRenderer = dynamic_cast<GoCast::GCPVideoRenderer*>(getPlugin()->Renderer()->renderer());
				if(NULL != pRenderer)
				{
					pRenderer->SetPreviewMode(true);
				}

				(GoCast::RtcCenter::Instance())->SetLocalVideoTrackRenderer(getPlugin()->Renderer());
			}
        }
        else
        {
            FBLOG_INFO_CUSTOM(funcstr("GCAPAPI::set_source", m_htmlId.convert_cast<std::string>()),
                              "Setting remote video track renderer...");
            (GoCast::RtcCenter::Instance())->SetRemoteVideoTrackRenderer(m_htmlId.convert_cast<std::string>(),
		                                                                 getPlugin()->Renderer());
		}
    }
}

void GCPAPI::GetUserMedia(const FB::JSObjectPtr& mediaHints,
                          const FB::JSObjectPtr& succCb,
                          const FB::JSObjectPtr& failCb)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        FBLOG_ERROR_CUSTOM(funcstr("GCPAPI::GetUserMedia", m_htmlId.convert_cast<std::string>()),
                           "Failed to init RtcCenter singleton");
        failCb->InvokeAsync("", FB::variant_list_of("RtcCenter init failed"));
        return;
    }
    
	m_htmlId = "localPlayer";
    pCtr->GetUserMedia(mediaHints, succCb, failCb);
}

FB::variant GCPAPI::Init(const FB::variant& htmlId,
                         const FB::variant& iceConfig,
                         const FB::JSObjectPtr& iceCallback)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    m_htmlId = htmlId;
    m_iceCb = iceCallback;
    
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::Init",msg);
        return false;
    }
    
    if(false == pCtr->NewPeerConnection(m_htmlId.convert_cast<std::string>(),
                                        iceConfig.convert_cast<std::string>(),
                                        this))
    {
        m_readyState = "INVALID";
        return false;
    }
    
    m_readyState = pCtr->ReadyState(m_htmlId.convert_cast<std::string>());
    return true;
}

FB::variant GCPAPI::AddStream(const FB::JSAPIPtr& stream)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::AddStream",msg);
        return false;
    }

    return pCtr->AddStream(m_htmlId.convert_cast<std::string>(),
                           stream->GetProperty("label").convert_cast<std::string>());
}

FB::variant GCPAPI::RemoveStream(const FB::JSAPIPtr& stream)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::RemoveStream",msg);
        return false;
    }
    
    return pCtr->RemoveStream(m_htmlId.convert_cast<std::string>(),
                              stream->GetProperty("label").convert_cast<std::string>());
}

FB::variant GCPAPI::CreateOffer(const FB::JSObjectPtr& mediaHints)
{
    bool bVideo = false;
    bool bAudio = false;
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::CreateOffer",msg);
        return "";
    }
    
    if(true == mediaHints->GetProperty("video").convert_cast<bool>())
    {
        bVideo = true; 
    }
    
    if(true == mediaHints->GetProperty("audio").convert_cast<bool>())
    {
        bAudio = true;
    }
    
    return pCtr->CreateOffer(m_htmlId.convert_cast<std::string>(), webrtc::MediaHints(bAudio, bVideo));
}

FB::variant GCPAPI::CreateAnswer(const FB::variant& offer, const FB::JSObjectPtr& mediaHints)
{
    bool bVideo = false;
    bool bAudio = false;
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::CreateAnswer", msg);
        return "";
    }
    
    if(true == mediaHints->GetProperty("video").convert_cast<bool>())
    {
        bVideo = true; 
    }
    
    if(true == mediaHints->GetProperty("audio").convert_cast<bool>())
    {
        bAudio = true;
    }
    
    return pCtr->CreateAnswer(m_htmlId.convert_cast<std::string>(),
                              webrtc::MediaHints(bAudio, bVideo),
                              offer.convert_cast<std::string>());
}

void GCPAPI::SetLocalDescription(const FB::variant& action,
                                 const FB::variant& sdp,
                                 const FB::JSObjectPtr& succCb,
                                 const FB::JSObjectPtr& failCb)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    webrtc::JsepInterface::Action _action = ("OFFER" == action.convert_cast<std::string>())? 
                                            webrtc::JsepInterface::kOffer:
                                            webrtc::JsepInterface::kAnswer;
    
    if(false == pCtr->Inited())
    {
        FBLOG_ERROR_CUSTOM(funcstr("GCPAPI::SetLocalDescription", m_htmlId.convert_cast<std::string>()),
                           "Failed to init RtcCenter singleton");
        return;
    }
    
    pCtr->SetLocalDescription(m_htmlId.convert_cast<std::string>(),
                              _action,
                              sdp.convert_cast<std::string>(),
                              succCb,
                              failCb,
                              false);
}

FB::variant GCPAPI::SetRemoteDescription(const FB::variant& action, const FB::variant& sdp)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    webrtc::JsepInterface::Action _action = ("OFFER" == action.convert_cast<std::string>())? 
                                            webrtc::JsepInterface::kOffer:
                                            webrtc::JsepInterface::kAnswer;
    
    if(false == pCtr->Inited())
    {
        FBLOG_ERROR_CUSTOM(funcstr("GCPAPI::SetRemoteDescription", m_htmlId.convert_cast<std::string>()),
                           "Failed to init RtcCenter singleton");
        return false;
    }
    
    return pCtr->SetRemoteDescription(m_htmlId.convert_cast<std::string>(),
                                      _action,
                                      sdp.convert_cast<std::string>());    
}

FB::variant GCPAPI::ProcessIceMessage(const FB::variant& sdp)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        FBLOG_ERROR_CUSTOM(funcstr("GCPAPI::ProcessIceMessage", m_htmlId.convert_cast<std::string>()),
                           "Failed to init RtcCenter singleton");
        return false;
    }
    
    return pCtr->ProcessIceMessage(m_htmlId.convert_cast<std::string>(),
                                   sdp.convert_cast<std::string>());
}

FB::variant GCPAPI::StartIce()
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        FBLOG_ERROR_CUSTOM(funcstr("GCPAPI::StartIce", m_htmlId.convert_cast<std::string>()),
                           "Failed to init RtcCenter singleton");
        return false;
    }
    
    return pCtr->StartIce(m_htmlId.convert_cast<std::string>());    
}

FB::variant GCPAPI::DeletePeerConnection()
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        FBLOG_ERROR_CUSTOM(funcstr("GCPAPI::DeletePeerConnection", m_htmlId.convert_cast<std::string>()),
                           "Failed to init RtcCenter singleton");
        return false;
    }
    
    return pCtr->DeletePeerConnection(m_htmlId.convert_cast<std::string>());
}

void GCPAPI::OnStateChange(StateType state_changed)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        FBLOG_ERROR_CUSTOM(funcstr("GCPAPI::OnStateChange", m_htmlId.convert_cast<std::string>()),
                           "Failed to init RtcCenter singleton");
        return;
    }

    switch(state_changed)
    {
        case webrtc::PeerConnectionObserver::kReadyState:
        {
            m_readyState = pCtr->ReadyState(m_htmlId.convert_cast<std::string>());
            
            if(NULL != m_onreadystatechangeCb.get())
            {
                m_onreadystatechangeCb->InvokeAsync("", FB::variant_list_of());
            }
            
            std::string msg("ReadyState = ");
            msg += m_readyState;
            FBLOG_INFO_CUSTOM(funcstr("GCPAPI::OnStateChange", m_htmlId.convert_cast<std::string>()), msg);
            break;
        }
            
        default:
        {
            FBLOG_ERROR_CUSTOM(funcstr("GCPAPI::OnStateChange", m_htmlId.convert_cast<std::string>()),
                               "Unhandled state change");
            break;
        }
    }
}

void GCPAPI::OnAddStream(webrtc::MediaStreamInterface* pRemoteStream)
{
    talk_base::scoped_refptr<webrtc::MediaStreamInterface> pStream(pRemoteStream);

    (GoCast::RtcCenter::Instance())->AddRemoteStream(m_htmlId.convert_cast<std::string>(),pStream);
    if(NULL != m_onaddstreamCb.get())
    {
        std::string msg("Added remote stream [");
        msg += pStream->label();
        msg += "]...";
        FBLOG_INFO_CUSTOM(funcstr("GCPAPI::OnAddStream", m_htmlId.convert_cast<std::string>()), msg);
        m_onaddstreamCb->InvokeAsync("", FB::variant_list_of(GoCast::RemoteMediaStream::Create(pStream)));
    }
}

void GCPAPI::OnRemoveStream(webrtc::MediaStreamInterface* pRemoteStream)
{
    talk_base::scoped_refptr<webrtc::MediaStreamInterface> pStream(pRemoteStream);
    
    (GoCast::RtcCenter::Instance())->RemoveRemoteStream(m_htmlId.convert_cast<std::string>());
    if(NULL != m_onremovestreamCb.get())
    {
        std::string msg("Removed remote stream [");
        msg += pStream->label();
        msg += "]...";
        FBLOG_INFO_CUSTOM(funcstr("GCPAPI::OnRemoveStream", m_htmlId.convert_cast<std::string>()), msg);
        m_onremovestreamCb->InvokeAsync("", FB::variant_list_of(GoCast::RemoteMediaStream::Create(pStream)));
    }
    
}

void GCPAPI::OnIceCandidate(const webrtc::IceCandidateInterface* pCandidate)
{
    std::string candidateSdp("");
    bool bMoreComing = true;
    
    if(false == pCandidate->ToString(&candidateSdp))
    {
        candidateSdp = "";
    }
    
    if(NULL != m_iceCb.get())
    {
        std::string msg("New Ice Candidate [");
        msg += candidateSdp;
        msg += "]...";
        FBLOG_INFO_CUSTOM(funcstr("GCPAPI::OnIceCandidate", m_htmlId.convert_cast<std::string>()), msg);
        m_iceCb->InvokeAsync("", FB::variant_list_of(candidateSdp)(bMoreComing));
    }
}

void GCPAPI::OnIceComplete()
{
    if(NULL != m_iceCb.get())
    {
        FBLOG_INFO_CUSTOM(funcstr("GCPAPI::OnIceComplete", m_htmlId.convert_cast<std::string>()),
                          "ICE process complete");
        m_iceCb->InvokeAsync("", FB::variant_list_of("")(false));
    }
}
