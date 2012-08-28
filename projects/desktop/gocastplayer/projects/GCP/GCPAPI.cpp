/**********************************************************\

  Auto-generated GCPAPI.cpp

\**********************************************************/

#include "JSObject.h"
#include "variant_list.h"
#include "DOM/Document.h"
#include "global/config.h"

#include "GCPAPI.h"
#include "GCPMediaStream.h"
#include "GCPWebrtcCenter.h"

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

FB::variant GCPAPI::get_volume()
{
    int level;
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    bool bSpkMuted = false;
    
    if(false == pCtr->Inited() || false == pCtr->GetSpkVol(&level))
    {
        level = -1;
    }
    
    if(false == pCtr->GetSpkMute(&bSpkMuted))
    {
        level = -1;
    }
    else if(true == bSpkMuted)
    {
        level = 0;
    }
    
    return level;
}

FB::variant GCPAPI::get_micvolume()
{
    int level;
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited() || false == pCtr->GetMicVol(&level))
    {
        level = -1;
    }
    
    return level;
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

FB::VariantMap GCPAPI::get_videoinopts()
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    m_videoDevices.clear();
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton...";
        FBLOG_ERROR_CUSTOM("GCPAPI::get_videoinopts", msg);
    }
    else
    {
        pCtr->QueryVideoDevices(m_videoDevices);
    }
    
    return m_videoDevices;
}

FB::VariantList GCPAPI::get_audioinopts()
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    m_audioInDevices.clear();
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton...";
        FBLOG_ERROR_CUSTOM("GCPAPI::get_audioinopts", msg);
    }
    else
    {
        pCtr->QueryAudioDevices(m_audioInDevices);
    }
    
    return m_audioInDevices;
}

FB::VariantList GCPAPI::get_audiooutopts()
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    m_audioOutDevices.clear();
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton...";
        FBLOG_ERROR_CUSTOM("GCPAPI::get_audiooutopts", msg);
    }
    else
    {
        pCtr->QueryAudioDevices(m_audioOutDevices, false);
    }
    
    return m_audioOutDevices;    
}

FB::VariantList GCPAPI::get_logentries()
{
    return GoCast::JSLogger::Instance()->LogEntries();
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
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Setting video track renderer...";
        FBLOG_INFO_CUSTOM("GCAPAPI::set_source", msg);

        if("localPlayer" == m_htmlId.convert_cast<std::string>())
        {            
			if(NULL != getPlugin()->Renderer().get())
			{
				GoCast::GCPVideoRenderer* pRenderer = 
                    dynamic_cast<GoCast::GCPVideoRenderer*>(getPlugin()->Renderer()->renderer());
				if(NULL != pRenderer)
				{
					pRenderer->SetPreviewMode(true);
				}

				(GoCast::RtcCenter::Instance())->SetLocalVideoTrackRenderer(getPlugin()->Renderer());
			}
        }
        else
        {
            (GoCast::RtcCenter::Instance())->SetRemoteVideoTrackRenderer(m_htmlId.convert_cast<std::string>(),
		                                                                 getPlugin()->Renderer());
		}
    }
}

void GCPAPI::set_volume(FB::variant volume)
{
    int level = volume.convert_cast<int>();
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(level > 255) level = 255;
    if(level < 0)   level = 0;
    if(true == pCtr->Inited())
    {
        pCtr->SetSpkVol(level); 
    }
}

void GCPAPI::set_micvolume(FB::variant volume)
{
    int level = volume.convert_cast<int>();
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(level > 255) level = 255;
    if(level < 0)   level = 0;
    if(true == pCtr->Inited())
    {
        pCtr->SetMicVol(level); 
    }
}

void GCPAPI::GetUserMedia(const FB::JSObjectPtr& mediaHints,
                          const FB::JSObjectPtr& succCb,
                          const FB::JSObjectPtr& failCb)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
	m_htmlId = "localPlayer";
    
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton...";
        FBLOG_ERROR_CUSTOM("GCPAPI::GetUserMedia", msg);
        
        if(NULL != failCb.get())
        {
            failCb->InvokeAsync("", FB::variant_list_of("RtcCenter init failed"));
        }
        return;
    }
    
    pCtr->GetUserMedia(mediaHints, succCb, failCb, false);
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
        FBLOG_ERROR_CUSTOM("GCPAPI::AddStream", msg);
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
        FBLOG_ERROR_CUSTOM("GCPAPI::RemoveStream", msg);
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
        FBLOG_ERROR_CUSTOM("GCPAPI::CreateOffer", msg);
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
    
    return pCtr->CreateOffer(m_htmlId.convert_cast<std::string>(),
                             webrtc::MediaHints(bAudio, bVideo));
}

FB::variant GCPAPI::CreateAnswer(const FB::variant& offer, const FB::JSObjectPtr& mediaHints)
{
    bool bVideo = false;
    bool bAudio = false;
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if("localPlayer" == m_htmlId.convert_cast<std::string>())
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::CreateAnswer",
                           "localPlayer: Not allowed to call createAnswer()");
        return "";
    }
    
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
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton...";
        FBLOG_ERROR_CUSTOM("GCPAPI::SetLocalDescription", msg);
        
        if(NULL != failCb.get())
        {
            failCb->InvokeAsync("", FB::variant_list_of("RtcCenter init failed"));
        }
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
    
    if("localPlayer" == m_htmlId.convert_cast<std::string>())
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::SetRemoteDescription",
                           "localPlayer: Not allowed to call setRemoteDescription()");
        return false;
    }

    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::SetRemoteDescription", msg);
        return false;
    }
    
    return pCtr->SetRemoteDescription(m_htmlId.convert_cast<std::string>(),
                                      _action, sdp.convert_cast<std::string>());    
}

FB::variant GCPAPI::ProcessIceMessage(const FB::variant& sdp)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if("localPlayer" == m_htmlId.convert_cast<std::string>())
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::ProcessIceMessage",
                           "localPlayer: Not allowed to call processIceMessage()");
        return false;
    }

    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::ProcessIceMessage", msg);
        return false;
    }
    
    return pCtr->ProcessIceMessage(m_htmlId.convert_cast<std::string>(),
                                   sdp.convert_cast<std::string>());
}

FB::variant GCPAPI::StartIce()
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if("localPlayer" == m_htmlId.convert_cast<std::string>())
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::StartIce",
                           "localPlayer: Not allowed to call startIce()");
        return false;
    }

    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::StartIce", msg);
        return false;
    }
    
    return pCtr->StartIce(m_htmlId.convert_cast<std::string>());    
}

FB::variant GCPAPI::DeletePeerConnection()
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::DeletePeerConnection", msg);
        return false;
    }
    
    if("localPlayer" == m_htmlId.convert_cast<std::string>())
    {
        GoCast::JSLogger::Instance()->ClearLogFunction();
    }
    
    return pCtr->DeletePeerConnection(m_htmlId.convert_cast<std::string>());
}

void GCPAPI::LogFunction(const FB::JSObjectPtr& func)
{
    GoCast::JSLogger::Instance()->LogFunction(func);
}

void GCPAPI::OnStateChange(StateType state_changed)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(false == pCtr->Inited())
    {
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": Failed to init RtcCenter singleton";
        FBLOG_ERROR_CUSTOM("GCPAPI::OnStateChange", msg);
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
            
            std::string msg = m_htmlId.convert_cast<std::string>();
            msg += ": ReadyState = ";
            msg += m_readyState;
            FBLOG_INFO_CUSTOM("GCPAPI::OnStateChange", msg);
            break;
        }
            
        default:
        {
            std::string msg = m_htmlId.convert_cast<std::string>();
            msg += ": Unhandled state change";
            FBLOG_INFO_CUSTOM("GCPAPI::OnStateChange", msg);
            break;
        }
    }
}

void GCPAPI::OnAddStream(webrtc::MediaStreamInterface* pRemoteStream)
{
    talk_base::scoped_refptr<webrtc::MediaStreamInterface> pStream(pRemoteStream);

    (GoCast::RtcCenter::Instance())->AddRemoteStream(m_htmlId.convert_cast<std::string>(),pStream);

    std::string msg = m_htmlId.convert_cast<std::string>();
    msg += ": Added remote stream [";
    msg += pStream->label();
    msg += "]...";
    FBLOG_INFO_CUSTOM("GCPAPI::OnAddStream", msg);

    if(NULL != m_onaddstreamCb.get())
    {
        m_onaddstreamCb->InvokeAsync("", FB::variant_list_of(GoCast::RemoteMediaStream::Create(pStream)));
    }
}

void GCPAPI::OnRemoveStream(webrtc::MediaStreamInterface* pRemoteStream)
{
    talk_base::scoped_refptr<webrtc::MediaStreamInterface> pStream(pRemoteStream);
    
    (GoCast::RtcCenter::Instance())->RemoveRemoteStream(m_htmlId.convert_cast<std::string>());

    std::string msg = m_htmlId.convert_cast<std::string>();
    msg += ": Removed remote stream [";
    msg += pStream->label();
    msg += "]...";
    FBLOG_INFO_CUSTOM("GCPAPI::OnRemoveStream", msg);
    
    if(NULL != m_onremovestreamCb.get())
    {
        m_onremovestreamCb->InvokeAsync("", FB::variant_list_of(GoCast::RemoteMediaStream::Create(pStream)));
    }
    
}

void GCPAPI::OnIceCandidate(const webrtc::IceCandidateInterface* pCandidate)
{
    std::string candidateSdp("");
    bool bMoreComing = true;
    
    if("BLOCKED" == m_readyState)
    {
        return;
    }
    
    if(false == pCandidate->ToString(&candidateSdp))
    {
        candidateSdp = "";
    }
    
    if(std::string::npos != candidateSdp.find(" tcp "))
    {
        m_readyState = "BLOCKED";
        
        std::string msg = m_htmlId.convert_cast<std::string>();
        msg += ": ReadyState = BLOCKED...";
        FBLOG_INFO_CUSTOM("GCPAPI::OnIceCandidate", msg);
        
        if(NULL != m_onreadystatechangeCb.get())
        {
            m_onreadystatechangeCb->InvokeAsync("", FB::variant_list_of());
        }
        
        return;
    }
    
    std::string msg = m_htmlId.convert_cast<std::string>();
    msg += ": New Ice Candidate [";
    msg += candidateSdp;
    msg += "]...";
    FBLOG_INFO_CUSTOM("GCPAPI::OnIceCandidate", msg);

    if(NULL != m_iceCb.get())
    {
        m_iceCb->InvokeAsync("", FB::variant_list_of(candidateSdp)(bMoreComing));
    }
}

void GCPAPI::OnIceComplete()
{
    std::string msg = m_htmlId.convert_cast<std::string>();
    msg += ": ICE process complete...";
    FBLOG_INFO_CUSTOM("GCPAPI::OnIceComplete", msg);

    if(NULL != m_iceCb.get())
    {
        m_iceCb->InvokeAsync("", FB::variant_list_of("")(false));
    }
}
