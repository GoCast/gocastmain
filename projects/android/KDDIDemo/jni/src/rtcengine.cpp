#include "rtcengine.h"
#include "logging.h"

namespace GoCast
{
    RtcEngine::RtcEngine()
    : m_pVoeInterface(new WebrtcVoeInterface())
    , m_pVieInterface(new WebrtcVieInterface())
    {
    }
    
    RtcEngine::~RtcEngine()
    {
        delete m_pVieInterface;
        delete m_pVoeInterface;
    }
    
    bool RtcEngine::Init()
    {
        if(false == m_pVoeInterface->Init())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVoeInterface->Init() error");
            return false;
        }
        
        if(false == m_pVieInterface->Init(m_pVoeInterface))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVieInterface->Init() failed");
            return false;
        }
        
        return true;
    }
    
    bool RtcEngine::Deinit()
    {
        if(false == m_pVieInterface->Deinit())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVieInterface->Deinit() failed");
            return false;
        }

        if(false == m_pVoeInterface->Deinit())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVoeInterface->Deinit() error");
            return false;
        }
        
        return true;
    }
    
    bool RtcEngine::NewConnection(const std::string destIp,
                                  const int destPorts[],
                                  const int recvPorts[],
                                  void* pRenderWin,
                                  float zIdx,
                                  const bool bAddVideo)
    {
        int voiceChannel;
        
        if(false == m_pVoeInterface->AddChannel(voiceChannel, recvPorts[0]))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVoeInterface->AddChannel() error");
            return false;
        }
        
        if(false == m_pVoeInterface->ActivateChannel(voiceChannel, destIp, destPorts[0]))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVoeInterface->ActivateChannel() error");
            return false;
        }

        m_voiceConnections[destIp] = voiceChannel;
        
        if(true == bAddVideo)
        {
            int videoChannel;
            
            if(false == m_pVieInterface->AddChannel(videoChannel, voiceChannel, recvPorts[1], pRenderWin, zIdx))
            {
                GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVieInterface->AddChannel() failed");
                return false;
            }

            if(false == m_pVieInterface->ActivateChannel(videoChannel, destIp, destPorts[1]))
            {
                GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVieInterface->ActivateChannel() failed");
                return false;
            }

            m_videoConnections[destIp] = videoChannel;
        }
        
        return true;
    }
    
    bool RtcEngine::DeleteConnection(const std::string destIp)
    {
        if(m_videoConnections.end() != m_videoConnections.find(destIp))
        {
            if(false == m_pVieInterface->RemoveChannel(m_videoConnections[destIp]))
            {
                GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVieInterface->RemoveChannel() failed");
                return false;
            }
            
            m_videoConnections.erase(destIp);
        }
        
        if(false == m_pVoeInterface->RemoveChannel(m_voiceConnections[destIp]))
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "m_pVoeInterface->RemoveChannel() error");
            return false;
        }
        
        m_voiceConnections.erase(destIp);
        return true;
    }
}
