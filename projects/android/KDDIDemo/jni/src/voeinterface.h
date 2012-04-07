#ifndef GOCASTMAIN_KDDIDEMO_VOEINTERFACE_H_
#define GOCASTMAIN_KDDIDEMO_VOEINTERFACE_H_

#include <string>
#include "voe_base.h"
#include "voe_codec.h"
#include "voe_audio_processing.h"

#define VOE_PORT_POOL_BASE 2000

namespace GoCast
{
    class WebrtcVoeInterface
    {
    public:
        WebrtcVoeInterface();
        ~WebrtcVoeInterface();
        bool Init();
        bool Deinit();
        webrtc::VoiceEngine* Voe();
        bool AddChannel(int& channel, int recvPort);
        bool ActivateChannel(const int channel,
                             const std::string destIp,
                             const int destPort);
        bool RemoveChannel(const int channel);
    
    private:
        webrtc::VoEBase* Base(); 
        webrtc::VoECodec* Codec();
        webrtc::VoEAudioProcessing* Apm();
        
    private:
        webrtc::VoiceEngine* m_pVoe;
    };
}

#endif
