#ifndef GOCASTMAIN_KDDIDEMO_VOEMANAGER_H_
#define GOCASTMAIN_KDDIDEMO_VOEMANAGER_H_

#include <string>
#include "voe_base.h"
#include "voe_codec.h"
#include "voe_audio_processing.h"

#define BASE_SUBAPI  0x0001
#define CODEC_SUBAPI 0x0002
#define APM_SUBAPI   0x0004

namespace GoCast
{
    class VoEManager
    : public webrtc::VoiceEngineObserver
    {
        public:
            VoEManager();
            virtual ~VoEManager();

        public:
            bool GetSubAPIs(int subapiFlag);
            bool BaseAPIInit();
            bool BaseAPIDeinit();
            bool BaseAPIAddChannel(const std::string& destIp,
                                   const int destPort,
                                   const int recvPort,
                                   int& channel);
            bool BaseAPIRemChannel(int channel);
            bool BaseAPIActivateChannel(int channel);
            bool BaseAPIDeactivateChannel(int channel);
            bool CodecAPISetChannelCodec(int channel,
                                         int codecId);
            bool ApmAPISetNsStatus(bool bEnable);
            bool ApmAPISetAgcStatus(bool bEnable);
            bool ApmAPISetEcStatus(bool bEnable, webrtc::EcModes mode = webrtc::kEcAecm);
            bool ApmAPISetAecmMode(webrtc::AecmModes mode = webrtc::kAecmSpeakerphone,
                                   bool bEnableCNG = true);
            
        public:
            virtual void CallbackOnError(const int channel, const int errCode);

        protected:
            webrtc::VoiceEngine* m_pVoE;
            webrtc::VoEBase* m_pVoEBase;
            webrtc::VoECodec* m_pVoECodec;
            webrtc::VoEAudioProcessing* m_pVoEApm;
    };
}

#endif

