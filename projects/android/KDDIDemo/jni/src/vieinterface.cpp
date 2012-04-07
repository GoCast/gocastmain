#include "logging.h"
#include "video_render.h"
#include "vieinterface.h"
#include "voeinterface.h"

namespace GoCast
{
    WebrtcVieInterface::WebrtcVieInterface()
    : m_captureId(-1)
    , m_pVie(webrtc::VideoEngine::Create())
    , m_pCapModule(NULL)
    , m_pRenderModule(NULL)
    {
    }
    
    WebrtcVieInterface::~WebrtcVieInterface()
    {
        if(NULL != m_pVie)
        {
            webrtc::VideoEngine::Delete(m_pVie);
        }
    }
    
    bool WebrtcVieInterface::Init(WebrtcVoeInterface* pVoeIntf)
    {
        if(0 != Base()->Init())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "VieBase()->Init() failed");
            return false;
        }
        
        if(0 != Base()->SetVoiceEngine(pVoeIntf->Voe()))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->SetVoiceEngine() failed");
            return false;
        }
        
        if(false == AllocDefaultCaptureDevice())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "AllocDefaultCaptureDevice() failed");
            return false;
        }

        if(0 != Capture()->StartCapture(m_captureId))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Capture()->StartCapture() failed");
            return false;
        }
        
        return true;
    }
    
    bool WebrtcVieInterface::Deinit()
    {
        if(0 != Capture()->StopCapture(m_captureId))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Capture()->StopCapture() failed");
            return false;
        }
        
        if(false == DeallocDefaultCaptureDevice())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "DeallocDefaultCaptureDevice() failed");
            return false;
        }
        
        /*if(0 != Base()->Release())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->Release() failed");
            return false;
        }*/
        
        return true;
    }
    
    bool WebrtcVieInterface::AddChannel(int& channel, 
                                        int voiceChannel, 
                                        int recvPort,
                                        void* pRenderWin,
                                        float zIdx)
    {
        channel = -1;
        if(0 != Base()->CreateChannel(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->CreateChannel() failed");
            return false;
        }
        
        if(0 != Base()->ConnectAudioChannel(channel, voiceChannel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->ConnectAudioChannel() failed");
            return false;
        }

        if(0 != Capture()->ConnectCaptureDevice(m_captureId, channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Capture()->ConnectCaptureDevice() failed");
            return false;
        }

        webrtc::VideoCodec codec;
        memset(&codec, 0, sizeof(webrtc::VideoCodec));
        for(int i=0; i<(Codec()->NumberOfCodecs()); i++)
        {
            if(0 != Codec()->GetCodec(i, codec))
            {
                GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Codec()->GetCodec(send) failed");
                return false;
            }

            if(webrtc::kVideoCodecVP8 == codec.codecType)
            {
                codec.width = 176;
                codec.height = 144;
                codec.startBitrate = 100;
                codec.maxBitrate = 200;
                
                if(0 != Codec()->SetSendCodec(channel, codec))
                {
                    GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Codec()->SetSendCodec() failed");
                    return false;
                }

                break;
            }
        }
        
        if(0 != Network()->SetLocalReceiver(channel, recvPort))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Network()->SetLocalReceiver() failed");
            return false;
        }

        if(0 != RtpRtcp()->SetRTCPStatus(channel, webrtc::kRtcpCompound_RFC4585))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "RtpRtcp()->SetRTCPStatus() failed");
            return false;
        }            
        
        if(0 != RtpRtcp()->SetKeyFrameRequestMethod(channel, webrtc::kViEKeyFrameRequestPliRtcp))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "RtpRtcp()->SetKeyFrameRequestMethod() failed");
            return false;
        }                        
        
        if(0 != Base()->StartReceive(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->StartReceive() failed");
            return false;
        }
        
        if(false == AllocRenderModule(pRenderWin, zIdx))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "AllocRenderModule() failed");
            return false;
        }

        if(0 != Render()->AddRenderer(channel, pRenderWin, (int) zIdx, 0.0, 0.0, 1.0, 1.0))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Render()->AddRenderer() failed");
            return false;
        }

        if(0 != Render()->StartRender(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Render()->StartRender() failed");
            return false;
        }

        return true;
    }
    
    bool WebrtcVieInterface::ActivateChannel(const int channel,
                                             const std::string destIp,
                                             const int destPort)
    {
        if(0 != Network()->SetSendDestination(channel, destIp.c_str(), destPort))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Network()->SetSendDestination() failed");
            return false;
        }
        
        if(0 != Base()->StartSend(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->StartSend() failed");
            return false;
        }

        return true;
    }
    
    bool WebrtcVieInterface::RemoveChannel(const int channel)
    {
        if(0 != Base()->StopSend(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->StopSend() failed");
            return false;
        }
        
        if(0 != Render()->StopRender(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Render()->StopRender() failed");
            return false;
        }
        
        if(0 != Render()->RemoveRenderer(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Render()->RemoveRenderer() failed");
            return false;
        }
        
        if(false == DeallocRenderModule())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "DeallocRenderModule() failed");
            return false;
        }

        if(0 != Base()->StopReceive(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->StopReceive() failed");
            return false;
        }
        
        if(0 != Capture()->DisconnectCaptureDevice(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Capture()->DisconnectCaptureDevice() failed");
            return false;
        }
        
        if(0 != Base()->DisconnectAudioChannel(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->DisconnectAudioChannel() failed");
            return false;
        }

        if(0 != Base()->DeleteChannel(channel))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Base()->DeleteChannel() failed");
            return false;
        }

        return true;
    }
    
    webrtc::ViEBase* WebrtcVieInterface::Base()
    {
        return webrtc::ViEBase::GetInterface(m_pVie);
    }
    
    webrtc::ViECodec* WebrtcVieInterface::Codec()
    {
        return webrtc::ViECodec::GetInterface(m_pVie);
    }
    
    webrtc::ViECapture* WebrtcVieInterface::Capture()
    {
        return webrtc::ViECapture::GetInterface(m_pVie);
    }
    
    webrtc::ViERender* WebrtcVieInterface::Render()
    {
        return webrtc::ViERender::GetInterface(m_pVie);
    }

    webrtc::ViENetwork* WebrtcVieInterface::Network()
    {
        return webrtc::ViENetwork::GetInterface(m_pVie);
    }
    
    webrtc::ViERTP_RTCP* WebrtcVieInterface::RtpRtcp()
    {
        return webrtc::ViERTP_RTCP::GetInterface(m_pVie);
    }

    bool WebrtcVieInterface::AllocDefaultCaptureDevice()
    {
        webrtc::VideoCaptureModule::DeviceInfo* pDevInfo =
            webrtc::VideoCaptureFactory::CreateDeviceInfo(0);
        
        const unsigned int maxUniqueIdLen = 256;
        WebRtc_UWord8 uniqueId[maxUniqueIdLen];
        memset(uniqueId, 0, maxUniqueIdLen);
        
        const unsigned int maxDevNameLen = 128;
        WebRtc_UWord8 devName[maxDevNameLen];
        memset(devName, 0, maxDevNameLen);
        
        if(0 == pDevInfo->NumberOfDevices())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "No capture devices found");
            return false;
        }
        
        if(0 != pDevInfo->GetDeviceName(1, devName, maxDevNameLen, uniqueId, maxUniqueIdLen))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "pDevInfo->GetDeviceName() error");
            return false;
        }
        
        m_pCapModule = webrtc::VideoCaptureFactory::Create(4571, uniqueId);
        if(NULL == m_pCapModule)
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "webrtc::VideoCaptureFactory::Create() error");
            return false;
        }
        
        m_pCapModule->AddRef();
        
        if(0 != Capture()->AllocateCaptureDevice(*m_pCapModule, m_captureId))
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "Capture()->AllocateCaptureDevice() error");
            m_pCapModule->Release();
            m_pCapModule = NULL;
            m_captureId = -1;
            return false;
        }
        
        delete pDevInfo;
        return true;    
    }
    
    bool WebrtcVieInterface::DeallocDefaultCaptureDevice()
    {
        if(0 != Capture()->ReleaseCaptureDevice(m_captureId))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Capture()->ReleaseCaptureDevice() error");
            return false;
        }
        
        m_pCapModule->Release();
        m_pCapModule = NULL;
        m_captureId = -1;
        return true;
    }
    
    bool WebrtcVieInterface::AllocRenderModule(void* pWin, float zIdx)
    {
        m_pRenderModule = webrtc::VideoRender::CreateVideoRender(4561,
                                                                 pWin, 
                                                                 false, 
                                                                 webrtc::kRenderDefault);
        if(NULL == m_pRenderModule)
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "VideoRender::CreateVideoRender() failed");
            return false;
        }

        if(0 != Render()->RegisterVideoRenderModule(*m_pRenderModule))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Render()->RegisterVideoRenderModule() failed");
            return false;
        }

        return true;
    }
    
    bool WebrtcVieInterface::DeallocRenderModule()
    {
        if(0 != Render()->DeRegisterVideoRenderModule(*m_pRenderModule))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "Render()->DeRegisterVideoRenderModule() failed");
            return false;
        }

        webrtc::VideoRender::DestroyVideoRender(m_pRenderModule);
        m_pRenderModule = NULL;
        return true;
    }
}
