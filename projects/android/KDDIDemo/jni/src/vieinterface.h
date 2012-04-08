#ifndef GOCASTMAIN_KDDIDEMO_VIEINTERFACE_H_
#define GOCASTMAIN_KDDIDEMO_VIEINTERFACE_H_

#include <string>
#include <map>
#include "vie_base.h"
#include "vie_codec.h"
#include "vie_capture.h"
#include "vie_render.h"
#include "vie_network.h"
#include "vie_rtp_rtcp.h"
#include "video_capture_factory.h"

namespace GoCast
{
    class WebrtcVoeInterface;
    
    class WebrtcVieInterface
    {
    public:
        WebrtcVieInterface();
        ~WebrtcVieInterface();
        bool Init(WebrtcVoeInterface* pVoeIntf);
        bool Deinit();
        bool AddChannel(int& channel, 
                        int voiceChannel, 
                        int recvPort,
                        void* pRenderWin,
                        float zIdx);
        bool ActivateChannel(const int channel,
                             const std::string destIp,
                             const int destPort);
        bool RemoveChannel(const int channel);
        bool ActivateLocalRender(void* pRenderWin, float zIdx);
        bool RemoveLocalRender();
        
    private:
        webrtc::ViEBase* Base(); 
        webrtc::ViECodec* Codec();
        webrtc::ViECapture* Capture();
        webrtc::ViERender* Render();
        webrtc::ViENetwork* Network();
        webrtc::ViERTP_RTCP* RtpRtcp();
        
    private:
        bool AllocDefaultCaptureDevice();
        bool DeallocDefaultCaptureDevice();
        bool AllocRenderModule(int channel, void* pWin);
        bool DeallocRenderModule(int channel);
        
    private:
        int m_captureId;
        webrtc::VideoEngine* m_pVie;
        webrtc::VideoCaptureModule* m_pCapModule;
        std::map<int, webrtc::VideoRender*> m_renderModules;
    };
}

#endif
