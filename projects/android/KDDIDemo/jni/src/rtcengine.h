#ifndef GOCASTMAIN_KDDIDEMO_RTCENGINE_H_
#define GOCASTMAIN_KDDIDEMO_RTCENGINE_H_

#include <map>
#include <string>
#include "voeinterface.h"
#include "vieinterface.h"

namespace GoCast
{
    class RtcEngine
    {
    public:
        RtcEngine();
        ~RtcEngine();
        bool Init();
        bool Deinit();
        bool NewConnection(const std::string destIp,
                           const int destPorts[],
                           const int recvPorts[],
                           void* pRenderWin = NULL,
                           float zIdx = 0.0,
                           const bool bAddVideo = false);
        bool DeleteConnection(const std::string destIp);
        
    private:
        WebrtcVoeInterface* m_pVoeInterface;
        WebrtcVieInterface* m_pVieInterface;
        std::map<std::string, int> m_voiceConnections;
        std::map<std::string, int> m_videoConnections;
    };
}

#endif

