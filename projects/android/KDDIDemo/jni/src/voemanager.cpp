#include "voemanager.h"
#include "logging.h"

namespace GoCast
{
    VoEManager::VoEManager()
    : m_pVoE(webrtc::VoiceEngine::Create())
    , m_pVoEBase(NULL)
    , m_pVoECodec(NULL)
    , m_pVoEApm(NULL)
    {
    }

    VoEManager::~VoEManager()
    {
        if(NULL != m_pVoEBase)
        {
            m_pVoEBase->Release();
        }

        if(NULL != m_pVoECodec)
        {
            m_pVoECodec->Release();
        }

        if(NULL != m_pVoEApm)
        {
            m_pVoEApm->Release();
        }

        webrtc::VoiceEngine::Delete(m_pVoE);
    }

    bool VoEManager::GetSubAPIs(int subapiFlag)
    {
        if((NULL == m_pVoEBase) && (subapiFlag&BASE_SUBAPI))
        {
            m_pVoEBase = webrtc::VoEBase::GetInterface(m_pVoE);
            if(NULL == m_pVoEBase)
            {
                GOCAST_LOG_ERROR("VOETEST-NDK", "VoEBase::GetInterface() failed");
                return false;
            }
        }

        if((NULL == m_pVoECodec) && (subapiFlag&CODEC_SUBAPI))
        { 
            m_pVoECodec = webrtc::VoECodec::GetInterface(m_pVoE);
            if(NULL == m_pVoECodec)
            {
                GOCAST_LOG_ERROR("VOETEST-NDK", "VoECodec::GetInterface() failed");
                return false;
            }
        }

        if((NULL == m_pVoEApm) && (subapiFlag&APM_SUBAPI))
        { 
            m_pVoEApm = webrtc::VoEAudioProcessing::GetInterface(m_pVoE);
            if(NULL == m_pVoEApm)
            {
                GOCAST_LOG_ERROR("VOETEST-NDK", "VoEAudioProcessing::GetInterface() failed");
                return false;
            }
        }

        return true;
    }

    bool VoEManager::BaseAPIInit()
    {
        int res = m_pVoEBase->Init();
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->Init() failed");
            return false;
        }

        res = m_pVoEBase->RegisterVoiceEngineObserver(*this);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->RegisterVoiceEngineObserver() failed");
            return false;
        }

        return true;
    }
            
    bool VoEManager::BaseAPIDeinit()
    {
        m_pVoEBase->DeRegisterVoiceEngineObserver();

        int res = m_pVoEBase->Terminate();
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->Terminate() failed");
            return false;
        }

        return true;
    }
            
    bool VoEManager::BaseAPIAddChannel(const std::string& destIp,
                                       const int sendPort,
                                       const int recvPort,
                                       int& channel)
    {
        channel = m_pVoEBase->CreateChannel();
        if(0 > channel)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->CreateChannel() failed");
            return false;
        }

        int res = m_pVoEBase->SetSendDestination(channel, sendPort, destIp.c_str());
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->SetSendDestination() failed");
            return false;
        }

        res = m_pVoEBase->SetLocalReceiver(channel, recvPort);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->SetLocalReceiver() failed");
            return false;
        }

        return true;
    }

    bool VoEManager::BaseAPIRemChannel(int channel)
    {
        int res = m_pVoEBase->DeleteChannel(channel);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->DeleteChannel() failed");
            return false;
        }

        return true;
    }

    bool VoEManager::BaseAPIActivateChannel(int channel)
    {
        int res = m_pVoEBase->StartSend(channel);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->StartSend() failed");
            return false;
        }

        res = m_pVoEBase->StartReceive(channel);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->StartReceive() failed");
            return false;
        }

        res = m_pVoEBase->StartPlayout(channel);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->StartPlayout() failed");
            return false;
        }

        return true;
    }
    
    bool VoEManager::BaseAPIDeactivateChannel(int channel)
    {
        int res = m_pVoEBase->StopSend(channel);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->StopSend() failed");
            return false;
        }

        res = m_pVoEBase->StopReceive(channel);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->StopReceive() failed");
            return false;
        }

        res = m_pVoEBase->StopPlayout(channel);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEBase->StopPlayout() failed");
            return false;
        }

        return true;
    }

    bool VoEManager::CodecAPISetChannelCodec(int channel,
                                             int codecId)
    {
        webrtc::CodecInst codec;
        int res;

        m_pVoECodec->GetCodec(codecId, codec);
        res = m_pVoECodec->SetSendCodec(channel, codec);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoECodec->SetSendCodec() failed");
            return false;
        }

        return true;
    }
            
    bool VoEManager::ApmAPISetNsStatus(bool bEnable)
    {
        int res = m_pVoEApm->SetNsStatus(bEnable);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEApm->SetNsStatus() failed");
            return false;
        }

        return true;
    }
            
    bool VoEManager::ApmAPISetAgcStatus(bool bEnable)
    {
        int res = m_pVoEApm->SetAgcStatus(bEnable);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEApm->SetAgcStatus() failed");
            return false;
        }

        return true;
    }
            
    bool VoEManager::ApmAPISetEcStatus(bool bEnable, webrtc::EcModes mode)
    {
        int res = m_pVoEApm->SetEcStatus(bEnable, mode);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEApm->SetEcStatus() failed");
            return false;
        }

        return true;
    }
            
    bool VoEManager::ApmAPISetAecmMode(webrtc::AecmModes mode,
                                       bool bEnableCNG)
    {
        int res = m_pVoEApm->SetAecmMode(mode, bEnableCNG);
        if(0 != res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "m_pVoEApm->SetAecmMode() failed");
            return false;
        }

        return true;
    }

    void VoEManager::CallbackOnError(const int channel, const int errCode)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "Channel error");
    }
}

