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
#include <iostream>

#define FBLOG_INFO_CUSTOM(func, msg) std::cout << func << " [INFO]: " << msg << std::endl;
#define FBLOG_ERROR_CUSTOM(func, msg) std::cout << func << " [ERROR]: " << msg << std::endl;

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

FB::JSObjectPtr GCPAPI::get_onaddstream()
{
    return m_onaddstreamCb;
}

FB::JSObjectPtr GCPAPI::get_onremovestream()
{
    return m_onremovestreamCb;
}

FB::JSAPIPtr GCPAPI::get_source()
{
    return m_srcStream;
}

void GCPAPI::set_onaddstream(const FB::JSObjectPtr &onaddstream)
{
    m_onaddstreamCb = onaddstream;
}

void GCPAPI::set_onremovestream(const FB::JSObjectPtr &onremovestream)
{
    m_onremovestreamCb = onremovestream;
}

void GCPAPI::set_source(const FB::JSAPIPtr& stream)
{
    m_srcStream = stream;
    
    if(NULL != stream.get())
    {
        talk_base::scoped_refptr<webrtc::MediaStreamInterface> pStream = static_cast<GoCast::RemoteMediaStream*>(stream.get())->RemoteMediaStreamInterface();
    
        if(0 < pStream->video_tracks()->count())
        {
            std::string msg("Rendering track [");
            msg += pStream->video_tracks()->at(0)->label();
            msg += "]...";
            FBLOG_INFO_CUSTOM("GCPAPI::set_source()", msg);
            pStream->video_tracks()->at(0)->SetRenderer(getPlugin()->Renderer());
        }
    }
}

void GCPAPI::GetUserMedia(const FB::JSObjectPtr& mediaHints,
                          const FB::JSObjectPtr& succCb,
                          const FB::JSObjectPtr& failCb)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::GetUserMedia()", "Failed to get RtcCenter singleton");
        failCb->InvokeAsync("", FB::variant_list_of("RtcCenter init failed"));
        return;
    }
    
    pCtr->GetUserMedia(mediaHints, succCb, failCb);
}

void GCPAPI::RenderStream(const FB::JSAPIPtr& pStream)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::RenderStream()", "Failed to get RtcCenter singleton");
        return;
    }
    
    pCtr->RenderStream(pStream, this, getPlugin()->Renderer());
}

FB::variant GCPAPI::Init(const FB::variant& iceConfig, const FB::JSObjectPtr& iceCallback)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::Init()", "Failed to get RtcCenter singleton");
        return false;
    }
    
    m_iceCb = iceCallback;
    return pCtr->NewPeerConnection(iceConfig.convert_cast<std::string>(), this);
}

void GCPAPI::AddStream(const FB::JSAPIPtr& stream)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::AddStream()", "Failed to get RtcCenter singleton");
        return;
    }

    pCtr->AddStream(this, static_cast<GoCast::MediaStream*>(stream.get())->LocalMediaStreamInterface());
}

void GCPAPI::RemoveStream(const FB::JSAPIPtr& stream)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::RemoveStream()", "Failed to get RtcCenter singleton");
        return;
    }
    
    pCtr->RemoveStream(this, static_cast<GoCast::MediaStream*>(stream.get())->LocalMediaStreamInterface());
}

FB::variant GCPAPI::CreateOffer(const FB::JSObjectPtr& mediaHints)
{
    bool bVideo = false;
    bool bAudio = false;
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::CreateOffer()", "Failed to get RtcCenter singleton");
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
    
    return pCtr->CreateOffer(this, webrtc::MediaHints(bAudio, bVideo));
}

FB::variant GCPAPI::CreateAnswer(const FB::variant& offer, const FB::JSObjectPtr& mediaHints)
{
    bool bVideo = false;
    bool bAudio = false;
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::CreateAnswer()", "Failed to get RtcCenter singleton");
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
    
    return pCtr->CreateAnswer(this, webrtc::MediaHints(bAudio, bVideo), offer.convert_cast<std::string>());
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
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::SetLocalDescription()", "Failed to get RtcCenter singleton");
        return;
    }
    
    pCtr->SetLocalDescription(this, _action, sdp.convert_cast<std::string>(), succCb, failCb, false);
}

void GCPAPI::SetRemoteDescription(const FB::variant& action, const FB::variant& sdp)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    webrtc::JsepInterface::Action _action = ("OFFER" == action.convert_cast<std::string>())? 
                                            webrtc::JsepInterface::kOffer:
                                            webrtc::JsepInterface::kAnswer;
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::SetRemoteDescription()", "Failed to get RtcCenter singleton");
        return;
    }
    
    pCtr->SetRemoteDescription(this, _action, sdp.convert_cast<std::string>());    
}

void GCPAPI::ProcessIceMessage(const FB::variant& sdp)
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::ProcessIceMessage()", "Failed to get RtcCenter singleton");
        return;
    }
    
    pCtr->ProcessIceMessage(this, sdp.convert_cast<std::string>());
}

void GCPAPI::StartIce()
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        FBLOG_ERROR_CUSTOM("GCPAPI::StartIce()", "Failed to get RtcCenter singleton");
        return;
    }
    
    pCtr->StartIce(this);    
}

void GCPAPI::OnAddStream(webrtc::MediaStreamInterface* pRemoteStream)
{
    talk_base::scoped_refptr<webrtc::MediaStreamInterface> pStream(pRemoteStream);
    
    if(NULL != m_onaddstreamCb.get())
    {
        std::string msg("Added remote stream [");
        msg += pStream->label();
        msg += "]...";
        FBLOG_INFO_CUSTOM("GCPAPI::OnAddStream()", pStream);
        m_onaddstreamCb->InvokeAsync("", FB::variant_list_of(GoCast::RemoteMediaStream::Create(pStream)));
    }
}

void GCPAPI::OnRemoveStream(webrtc::MediaStreamInterface* pRemoteStream)
{
    talk_base::scoped_refptr<webrtc::MediaStreamInterface> pStream(pRemoteStream);
    
    if(NULL != m_onremovestreamCb.get())
    {
        std::string msg("Removed remote stream [");
        msg += pStream->label();
        msg += "]...";
        FBLOG_INFO_CUSTOM("GCPAPI::OnRemoveStream()", msg);
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
        FBLOG_INFO_CUSTOM("GCPAPI::OnIceCandidate()", msg);
        m_iceCb->InvokeAsync("", FB::variant_list_of(candidateSdp)(bMoreComing));
    }
}

void GCPAPI::OnIceComplete()
{
    if(NULL != m_iceCb.get())
    {
        FBLOG_INFO_CUSTOM("GCPAPI::OnIceComplete()", "ICE process complete");
        m_iceCb->InvokeAsync("", FB::variant_list_of("")(false));
    }
}

void GCPAPI::DeletePeerConnection()
{
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL != pCtr)
    {
        pCtr->DeletePeerConnection(this);
    }
}
