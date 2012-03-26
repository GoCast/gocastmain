#ifndef GOCASTMAIN_KDDIDEMO_VIEMANAGER_H_
#define GOCASTMAIN_KDDIDEMO_VIEMANAGER_H_

#include <string>
#include "vie_base.h"
#include "vie_capture.h"
#include "vie_render.h"
#include "video_capture_factory.h"

#define BASE_SUBAPI     0x0001
#define CAPTURE_SUBAPI 0x0002
#define RENDER_SUBAPI   0x0004

namespace GoCast
{
    class ViEManager
//    : public webrtc::ViEBaseObserver
    {
        public:
            ViEManager();
            virtual ~ViEManager();

        public:
            bool GetSubAPIs(int subapiFlag);
            bool BaseAPIInit();
            bool BaseAPIDeinit();
            bool AllocDefaultCaptureDevice();
            bool DeallocDefaultCaptureDevice();
            bool StartCapture();
            bool StopCapture();
            bool AllocLocalRenderer(void* pWin, float zIdx);
            bool DeallocLocalRenderer();
            bool StartRenderer();
            bool StopRenderer();

//        public:
//            virtual void PerformanceAlarm(const unsigned int cpuLoad);

        protected:
            webrtc::VideoEngine* m_pViE;
            webrtc::ViEBase* m_pViEBase;
            webrtc::ViECapture* m_pViECapture;
            webrtc::ViERender* m_pViERender;
            webrtc::VideoCaptureModule* m_pCapModule;
            webrtc::VideoRender* m_pRenderModule;

        protected:
            int m_captureId;
    };
}

#endif

