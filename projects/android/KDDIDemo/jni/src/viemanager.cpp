#include <sstream>
#include "logging.h"
#include "viemanager.h"
#include "video_render.h"
#include "vie_errors.h"

#define BASE_SUBAPI     0x0001
#define CAPTUREC_SUBAPI 0x0002
#define RENDER_SUBAPI   0x0004

namespace GoCast
{
    ViEManager::ViEManager()
    : m_pViE(webrtc::VideoEngine::Create())
    , m_pViEBase(NULL)
    , m_pViECapture(NULL)
    , m_pViERender(NULL)
    , m_pCapModule(NULL)
    , m_pRenderModule(NULL)
    , m_captureId(-1)
    {
    }

    ViEManager::~ViEManager()
    {
        if(NULL != m_pViEBase)
        {
            m_pViEBase->Release();
        }

        if(NULL != m_pViECapture)
        {
            m_pViECapture->Release();
        }

        if(NULL != m_pViERender)
        {
            m_pViERender->Release();
        }

        webrtc::VideoEngine::Delete(m_pViE);
    }

    bool ViEManager::GetSubAPIs(int subapiFlag)
    {
        if((NULL == m_pViEBase) && (subapiFlag|BASE_SUBAPI))
        {
            if(NULL == (m_pViEBase = webrtc::ViEBase::GetInterface(m_pViE)))
            {
                GOCAST_LOG_ERROR("VIETEST-NDK", "ViEBase::GetInterface failed");
                return false;
            }

            if(NULL == (m_pViECapture = webrtc::ViECapture::GetInterface(m_pViE)))
            {
                GOCAST_LOG_ERROR("VIETEST-NDK", "ViECapture::GetInterface failed");
                return false;
            }

            if(NULL == (m_pViERender = webrtc::ViERender::GetInterface(m_pViE)))
            {
                GOCAST_LOG_ERROR("VIETEST-NDK", "ViERender::GetInterface failed");
                return false;
            }
        }

        return true;
    }

    bool ViEManager::BaseAPIInit()
    {
        if(0 != m_pViEBase->Init())
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViEBase->Init() failed");
            return false;
        }

        /*if(0 != m_pViEBase->RegisterObserver(*this))
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViEBase->RegisterObserver() failed");
            return false;
        }*/

        return true;
    }
    
    bool ViEManager::BaseAPIDeinit()
    {
        /*if(0 != m_pViEBase->DeregisterObserver())
        {
            if(kViEBaseObserverNotRegistered == m_pViEBase->LastError())
            {
                GOCAST_LOG_ERROR("VIETEST-NDK", "Observer not registered");
            }

            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViEBase->DeregisterObserver() FAILED");
            return false;
        }*/

        if(0 != m_pViEBase->Release())
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViEBase->Terminate() failed");
            return false;
        }

        return true;
    }

    bool ViEManager::AllocDefaultCaptureDevice()
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
            GOCAST_LOG_ERROR("VIETEST-NDK", "No capture devices found");
            return false;
        }

        if(0 != pDevInfo->GetDeviceName(1, devName, maxDevNameLen, uniqueId, maxUniqueIdLen))
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "pDevInfo->GetDeviceName() error");
            return false;
        }

        m_pCapModule = webrtc::VideoCaptureFactory::Create(4571, uniqueId);
        if(NULL == m_pCapModule)
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "webrtc::VideoCaptureFactory::Create() error");
            return false;
        }

        m_pCapModule->AddRef();

        if(0 != m_pViECapture->AllocateCaptureDevice(*m_pCapModule, m_captureId))
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViECapture->AllocateCaptureDevice() error");
            m_pCapModule->Release();
            m_pCapModule = NULL;
            m_captureId = -1;
            return false;
        }

        delete pDevInfo;

        return true;        
    }

    bool ViEManager::DeallocDefaultCaptureDevice()
    {
        if(0 != m_pViECapture->ReleaseCaptureDevice(m_captureId))
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViECapture->ReleaseCaptureDevice() error");
            return false;
        }

        m_pCapModule->Release();
        m_pCapModule = NULL;

        return true;
    }

    bool ViEManager::StartCapture()
    {
        return (0 == m_pViECapture->StartCapture(m_captureId));
    }

    bool ViEManager::StopCapture()
    {
        return (0 == m_pViECapture->StopCapture(m_captureId));
    }

    bool ViEManager::AllocLocalRenderer(void* pWin, float zIdx)
    {
        m_pRenderModule = webrtc::VideoRender::CreateVideoRender(4561, pWin, false, webrtc::kRenderDefault);
        if(NULL == m_pRenderModule)
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "webrtc::VideoRender::Create() error");
            return false;
        }

        if(0 != m_pViERender->RegisterVideoRenderModule(*m_pRenderModule))
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViERender->RegisterVideoRenderModule() error");
            return false;
        }

        if(0 != m_pViERender->AddRenderer(m_captureId, pWin, zIdx, 0.0, 0.0, 1.0, 1.0))
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViERender->AddRenderer() error");
            return false;
        }

        return true;
    }

    bool ViEManager::DeallocLocalRenderer()
    {
        if(0 != m_pViERender->RemoveRenderer(m_captureId))
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViERender->RemoveRenderer() error");
            return false;
        }

        if(0 != m_pViERender->DeRegisterVideoRenderModule(*m_pRenderModule))
        {
            GOCAST_LOG_ERROR("VIETEST-NDK", "m_pViERender->DeRegisterVideoRenderModule() error");
            return false;
        }

        webrtc::VideoRender::DestroyVideoRender(m_pRenderModule);
        m_pRenderModule = NULL;

        return true;
    }

    bool ViEManager::StartRenderer()
    {
        return (0 == m_pViERender->StartRender(m_captureId));
    }

    bool ViEManager::StopRenderer()
    {
        return (0 == m_pViERender->StopRender(m_captureId));
    }

    /*void ViEManager::PerformanceAlarm(const unsigned int cpuLoad)
    {
        std::stringstream sstrm;

        sstrm << "Warning: CPU load = " << cpuLoad;
        GOCAST_LOG_ERROR("VIETEST-NDK", sstrm.str().c_str());
    }*/
}

