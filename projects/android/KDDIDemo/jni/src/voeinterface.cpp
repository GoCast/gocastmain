#include <sstream>
#include "voeinterface.h"
#include "logging.h"

namespace GoCast
{
    WebrtcVoeInterface::WebrtcVoeInterface()
    : m_pVoe(webrtc::VoiceEngine::Create())
    {
    }
    
    WebrtcVoeInterface::~WebrtcVoeInterface()
    {
        if(NULL != m_pVoe)
        {
            webrtc::VoiceEngine::Delete(m_pVoe);
        }
    }
    
    bool WebrtcVoeInterface::Init()
    {
        int res = Base()->Init();
        if(0 != res)
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->Init() failed");
            return false;
        }
        
        res = Apm()->SetNsStatus(true);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Apm()->SetNsStatus(true) failed");
            return false;
        }
        
        res = Apm()->SetAgcStatus(true);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Apm()->SetAgcStatus(true) failed");
            return false;            
        }
        
        res = Apm()->SetEcStatus(true, webrtc::kEcAecm);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Apm()->SetEcStatus(true, aecm) failed");
            return false;
        }
        
        res = Apm()->SetAecmMode(webrtc::kAecmSpeakerphone, true);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Apm()->SetAecmMode(spkphone, true) failed");
            return false;
        }
        
        return true;
    }
    
    bool WebrtcVoeInterface::Deinit()
    {
        int res = Base()->Terminate();
        if(0 != res)
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->Terminate() failed");
            return false;            
        }
        
        return true;
    }
    
    bool WebrtcVoeInterface::AddChannel(int& channel, int recvPort)
    {        
        channel = -1;
        channel = Base()->CreateChannel();
        if(0 > channel)
        {
            std::stringstream sstrm;
            sstrm << "Base()->CreateChannel() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;
        }

        webrtc::CodecInst codec;
        Codec()->GetCodec(0, codec);
        int res = Codec()->SetSendCodec(channel, codec);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->SetSendCodec() error");
            return false;            
        }
        
        res = Base()->SetLocalReceiver(channel, recvPort);
        if(0 != res)
        {
            std::stringstream sstrm;
            sstrm << "Base()->SetLocalReceiver() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;            
        }
        
        res = Base()->StartReceive(channel);
        if(0 != res)
        {
            std::stringstream sstrm;
            sstrm << "Base()->StartReceive() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;            
        }
        
        res = Base()->StartPlayout(channel);
        if(0 != res)
        {
            std::stringstream sstrm;
            sstrm << "Base()->StartPlayout() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;            
        }
        
        return true;
    }
    
    bool WebrtcVoeInterface::ActivateChannel(const int channel,
                                             const std::string destIp,
                                             const int destPort)
    {
        int res = Base()->SetSendDestination(channel, destPort, destIp.c_str());
        if(0 != res)
        {
            std::stringstream sstrm;
            sstrm << "Base()->SetSendDestination() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;            
        }
        
        res = Base()->StartSend(channel);
        if(0 != res)
        {
            std::stringstream sstrm;
            sstrm << "Base()->StartSend() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;            
        }

        return true;
    }
    
    bool WebrtcVoeInterface::RemoveChannel(const int channel)
    {
        int res = Base()->StopPlayout(channel);
        if(0 != res)
        {
            std::stringstream sstrm;
            sstrm << "Base()->StopPlayout() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;            
        }

        res = Base()->StopReceive(channel);
        if(0 != res)
        {
            std::stringstream sstrm;
            sstrm << "Base()->StopReceive() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;
        }
        
        res = Base()->StopSend(channel);
        if(0 != res)
        {
            std::stringstream sstrm;
            sstrm << "Base()->StopSend() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;
        }
        
        res = Base()->DeleteChannel(channel);
        if(0 != res)
        {
            std::stringstream sstrm;
            sstrm << "Base()->DeleteChannel() error: " << Base()->LastError();
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", sstrm.str().c_str());
            return false;
        }
        
        return true;
    }
    
    webrtc::VoiceEngine* WebrtcVoeInterface::Voe()
    {
        return m_pVoe;
    }
    
    webrtc::VoEBase* WebrtcVoeInterface::Base()
    {
        return webrtc::VoEBase::GetInterface(m_pVoe);
    }
    
    webrtc::VoECodec* WebrtcVoeInterface::Codec()
    {
        return webrtc::VoECodec::GetInterface(m_pVoe);
    }
    
    webrtc::VoEAudioProcessing* WebrtcVoeInterface::Apm()
    {
        return webrtc::VoEAudioProcessing::GetInterface(m_pVoe);
    }
}
