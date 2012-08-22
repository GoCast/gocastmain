//
//  GCPWebrtcCenter.cpp
//  FireBreath
//
//  Created by Manjesh Malavalli on 6/25/12.
//  Copyright (c) 2012 XVDTH. All rights reserved.
//

#include "GCPMediaStream.h"
#include "GCPWebrtcCenter.h"
#include "variant_list.h"

namespace GoCast
{    
    enum
    {
        MSG_QUIT = 1,
        MSG_GET_USER_MEDIA,
        MSG_NEW_PEERCONNECTION,
        MSG_ADD_STREAM,
        MSG_REMOVE_STREAM,
        MSG_CREATE_OFFER,
        MSG_CREATE_ANSWER,
        MSG_SET_LOCAL_SDP,
        MSG_SET_REMOTE_SDP,
        MSG_PROCESS_ICE_MSG,
        MSG_START_ICE,
        MSG_DELETE_PEERCONNECTION,
    };
    
    std::string GetMsgTypeString(int msgType)
    {
        switch(msgType)
        {
            case MSG_QUIT:  return "MSG_QUIT";
            case MSG_GET_USER_MEDIA: return "MSG_GET_USER_MEDIA";
            case MSG_NEW_PEERCONNECTION: return "MSG_NEW_PEERCONNECTION";
            case MSG_ADD_STREAM: return "MSG_ADD_STREAM";
            case MSG_REMOVE_STREAM: return "MSG_REMOVE_STREAM";
            case MSG_CREATE_OFFER: return "MSG_CREATE_OFFER";
            case MSG_CREATE_ANSWER: return "MSG_CREATE_ANSWER";
            case MSG_SET_LOCAL_SDP: return "MSG_SET_LOCAL_SDP";
            case MSG_SET_REMOTE_SDP: return "MSG_SET_REMOTE_SDP";
            case MSG_PROCESS_ICE_MSG: return "MSG_PROCESS_ICE_MSG";
            case MSG_START_ICE: return "MSG_START_ICE";
            case MSG_DELETE_PEERCONNECTION: return "MSG_DELETE_PEERCONNECTION";
            default: return "MSG_UNKNOWN_MSG";
        }
    }
    
    FB::variant LocalMediaStreamTrack::get_enabled() const
    {
        if("video" == m_kind.convert_cast<std::string>())
        {
            return (RtcCenter::Instance())->GetLocalVideoTrackEnabled();
        }
        else if("audio" == m_kind.convert_cast<std::string>())
        {
            return (RtcCenter::Instance())->GetLocalAudioTrackEnabled();
        }
        
        return false;
    }
    
    void LocalMediaStreamTrack::set_enabled(FB::variant newVal)
    {
        if("video" == m_kind.convert_cast<std::string>())
        {
            (RtcCenter::Instance())->SetLocalVideoTrackEnabled(newVal.convert_cast<bool>());
        }
        else if("audio" == m_kind.convert_cast<std::string>())
        {
            (RtcCenter::Instance())->SetLocalAudioTrackEnabled(newVal.convert_cast<bool>());
        }        
        
        m_enabled = newVal;
    }
    
    FB::variant LocalVideoTrack::get_effect() const
    {
        return (RtcCenter::Instance())->GetLocalVideoTrackEffect();
    }
    
    void LocalVideoTrack::set_effect(FB::variant effect)
    {
        (RtcCenter::Instance())->SetLocalVideoTrackEffect(effect.convert_cast<std::string>());
    }
    
    std::string GetReadyStateString(webrtc::PeerConnectionInterface::ReadyState state)
    {
        switch(state)
        {
            case webrtc::PeerConnectionInterface::kNew: return "NEW";
            case webrtc::PeerConnectionInterface::kNegotiating: return "NEGOTIATING";
            case webrtc::PeerConnectionInterface::kActive: return "ACTIVE";
            case webrtc::PeerConnectionInterface::kClosing: return "CLOSING";
            case webrtc::PeerConnectionInterface::kClosed: return "CLOSED";
            default: return "UNKNOWN";
        }
    }
    
    struct GetUserMediaParams : public talk_base::MessageData
    {
        GetUserMediaParams(FB::JSObjectPtr mediaHints,
                           FB::JSObjectPtr succCb,
                           FB::JSObjectPtr failCb)
        : m_mediaHints(mediaHints)
        , m_succCb(succCb)
        , m_failCb(failCb)
        {
            
        }
        
        FB::JSObjectPtr m_mediaHints;
        FB::JSObjectPtr m_succCb;
        FB::JSObjectPtr m_failCb;
    };
    
    struct NewPeerConnectionParams : public talk_base::MessageData
    {
        NewPeerConnectionParams(const std::string& pluginId,
                                const std::string& iceConfig,
                                webrtc::PeerConnectionObserver* pObserver)
        : m_bResult(false)
        , m_pluginId(pluginId)
        , m_iceConfig(iceConfig)
        , m_pObserver(pObserver)
        {
            
        }
        
        bool m_bResult;
        std::string m_pluginId;
        std::string m_iceConfig;
        webrtc::PeerConnectionObserver* m_pObserver;
    };
    
    struct AddStreamParams : public talk_base::MessageData
    {
        AddStreamParams(const std::string& pluginId,
                        const std::string& label)
        : m_bResult(false)
        , m_pluginId(pluginId)
        , m_label(label)
        {
            
        }
        
        bool m_bResult;
        std::string m_pluginId;
        std::string m_label;
    };
    
    struct RemoveStreamParams : public talk_base::MessageData
    {
        RemoveStreamParams(const std::string& pluginId,
                           const std::string& label)
        : m_bResult(false)
        , m_pluginId(pluginId)
        , m_label(label)
        {
            
        }
        
        bool m_bResult;
        std::string m_pluginId;
        std::string m_label;
    };

    struct CreateOfferParams : public talk_base::MessageData
    {
        CreateOfferParams(const std::string& pluginId,
                          const webrtc::MediaHints& mediaHints)
        : m_offerSdp("")
        , m_pluginId(pluginId)
        , m_mediaHints(mediaHints)
        {
            
        }
        
        std::string m_offerSdp;
        std::string m_pluginId;
        webrtc::MediaHints m_mediaHints;
    };
    
    struct CreateAnswerParams : public talk_base::MessageData
    {
        CreateAnswerParams(const std::string& pluginId,
                           const webrtc::MediaHints& mediaHints,
                           const std::string& offerSdp)
        : m_answerSdp("")
        , m_offerSdp(offerSdp)
        , m_pluginId(pluginId)
        , m_mediaHints(mediaHints)
        {
            
        }
        
        std::string m_answerSdp;
        std::string m_offerSdp;
        std::string m_pluginId;
        webrtc::MediaHints m_mediaHints;
    };

    struct SetLocalSdpParams : public talk_base::MessageData
    {
        SetLocalSdpParams(const std::string& pluginId,
                          const webrtc::JsepInterface::Action& action,
                          const std::string& sdp,
                          const FB::JSObjectPtr& succCb,
                          const FB::JSObjectPtr& failCb)
        : m_pluginId(pluginId)
        , m_action(action)
        , m_sdp(sdp)
        , m_succCb(succCb)
        , m_failCb(failCb)
        {
            
        }
        
        std::string m_pluginId;
        webrtc::JsepInterface::Action m_action;
        std::string m_sdp;
        FB::JSObjectPtr m_succCb;
        FB::JSObjectPtr m_failCb;
    };
    
    struct SetRemoteSdpParams : public talk_base::MessageData
    {
        SetRemoteSdpParams(const std::string& pluginId,
                           const webrtc::JsepInterface::Action& action,
                           const std::string& sdp)
        : m_bResult(false)
        , m_pluginId(pluginId)
        , m_sdp(sdp)
        {
            
        }
        
        bool m_bResult;
        std::string m_pluginId;
        webrtc::JsepInterface::Action m_action;
        std::string m_sdp;
    };
    
    struct ProcessIceMessageParams : public talk_base::MessageData
    {
        ProcessIceMessageParams(const std::string& pluginId,
                                const std::string& candidateSdp)
        : m_bResult(false)
        , m_pluginId(pluginId)
        , m_candidateSdp(candidateSdp)
        {
            
        }
        
        bool m_bResult;
        std::string m_pluginId;
        std::string m_candidateSdp;
    };
    
    struct StartIceParams : public talk_base::MessageData
    {
        StartIceParams(const std::string& pluginId)
        : m_bResult(false)
        , m_pluginId(pluginId)
        {
            
        }
        
        bool m_bResult;
        std::string m_pluginId;
    };
    
    struct DeletePeerConnectionParams : public talk_base::MessageData
    {
        DeletePeerConnectionParams(const std::string& pluginId)
        : m_bResult(false)
        , m_pluginId(pluginId)
        {
            
        }
        
        bool m_bResult;
        std::string m_pluginId;
    };

    MessageQueue::MessageQueue(MessageHandler* pHandler)
    : m_pHandler(pHandler)
    {
        FBLOG_INFO_CUSTOM("MessageQueue::MessageQueue", "Constructor DONE");
    }
    
    MessageQueue::~MessageQueue()
    {
        FBLOG_INFO_CUSTOM("MessageQueue::~MessageQueue", "Killing msgq thread...");
        Send(MSG_QUIT, NULL);
        m_thread.join();
        FBLOG_INFO_CUSTOM("MessageQueue::~MessageQueue", "Killing msgq thread DONE");
    }
    
    void MessageQueue::Start()
    {
        FBLOG_INFO_CUSTOM("MessageQueue::Start", "Starting...");
        m_thread = boost::thread(&MessageQueue::WorkerFunction, this);
        FBLOG_INFO_CUSTOM("MessageQueue::Start", "Starting DONE");
    }
    
    void MessageQueue::Send(int msgType, talk_base::MessageData *pArgs, bool bWait)
    {
        boost::mutex::scoped_lock lock(m_mutex);
        talk_base::Message* pMsg = new talk_base::Message();
        
        std::string msg("Sending message of type [");
        msg += GetMsgTypeString(msgType);
        msg += "]";
        msg += ((true==bWait)? " (wait for result)...": "...");
        FBLOG_INFO_CUSTOM("MessageQueue::Send", msg);
        
        pMsg->message_id = msgType;
        pMsg->pdata = pArgs;
        m_messages.push_back(pMsg);
        
        if(true == bWait)
        {
            m_done.wait(m_mutex);
            FBLOG_INFO_CUSTOM("MessageQueue::Send", "Wait for result DONE");
        }
    }
    
    bool MessageQueue::Wait(int cms, bool bProcessIO)
    {
        ProcessMessage();
        return talk_base::PhysicalSocketServer::Wait(20, bProcessIO);
    }
    
    void MessageQueue::WorkerFunction()
    {        
        talk_base::AutoThread thread(this);
        
        FBLOG_INFO_CUSTOM("MessageQueue::WorkerFunction",
                          "Msgq overrides PhysicalSocketServer::Wait() to process messages");
        talk_base::Thread::Current()->set_socketserver(this);
        
        FBLOG_INFO_CUSTOM("MessageQueue::WorkerFunction", "Entering Run()...");
        talk_base::Thread::Current()->Run();
        
        FBLOG_INFO_CUSTOM("MessageQueue::WorkerFunction", "Exited Run()...");
    }
    
    talk_base::Message* MessageQueue::Recv()
    {
        boost::mutex::scoped_lock lock(m_mutex);
        talk_base::Message* pMsg = NULL;
        
        if(false == m_messages.empty())
        {
            pMsg = m_messages.front();
            m_messages.pop_front();
        }
        
        return pMsg;
    }
    
    void MessageQueue::ProcessMessage()
    {
        talk_base::Message* pMsg = Recv();
        
        if((NULL != pMsg) && (NULL != m_pHandler))
        {
            std::string msg("Handling message of type [");
            msg += GetMsgTypeString(pMsg->message_id);
            msg += "]...";
            FBLOG_INFO_CUSTOM("MessageQueue::ProcessMessage", msg);
            
            m_pHandler->OnMessage(pMsg);
            
            if(MSG_SET_LOCAL_SDP != pMsg->message_id &&
               MSG_GET_USER_MEDIA != pMsg->message_id)
            {
                FBLOG_INFO_CUSTOM("MessageQueue::ProcessMessage", "Notifying waiting parent...");
                m_done.notify_one();
            }

            delete pMsg;
        }        
    }
    
    RtcCenter* RtcCenter::Instance(bool bDelete)
    {
        static RtcCenter* pInst = NULL;
        
        if(true == bDelete)
        {
            FBLOG_INFO_CUSTOM("RtcCenter::Instance", "Deleting RtcCenter Singleton...");
            delete pInst;
            pInst = NULL;
            FBLOG_INFO_CUSTOM("RtcCenter::Instance", "Deleting RtcCenter Singleton DONE");
        }
        else if(NULL == pInst)
        {
            FBLOG_INFO_CUSTOM("RtcCenter::Instance", "Creating RtcCenter Singleton...");
            pInst = new RtcCenter();
            FBLOG_INFO_CUSTOM("RtcCenter::Instance", "Creating RtcCenter Singleton DONE...");
        }
        
        return pInst;
    }
    
    void RtcCenter::QueryVideoDevices(FB::VariantMap& devices)
    {
        devices = LocalVideoTrack::GetVideoDevices();
    }
    
    void RtcCenter::QueryAudioDevices(FB::VariantList& devices, bool bInput)
    {
        std::vector<std::string> deviceNames;
        
        if(true == bInput)
        {
            m_pConnFactory->channel_manager()->GetAudioInputDevices(&deviceNames);
        }
        else
        {
            m_pConnFactory->channel_manager()->GetAudioOutputDevices(&deviceNames);
        }
        
        for(int16_t i=1; i<deviceNames.size(); i++)
        {
            devices.push_back(FB::variant(deviceNames[i]));            
        }
    }
    
    void RtcCenter::GetUserMedia(FB::JSObjectPtr mediaHints,
                                 FB::JSObjectPtr succCb,
                                 FB::JSObjectPtr failCb,
                                 bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            GetUserMediaParams* pParams = new GetUserMediaParams(mediaHints, succCb, failCb);
            m_msgq.Send(MSG_GET_USER_MEDIA, pParams);
        }
        else
        {
            GetUserMedia_w(mediaHints, succCb, failCb);
        }
    }
    
    bool RtcCenter::NewPeerConnection(const std::string& pluginId,
                                      const std::string& iceConfig,
                                      webrtc::PeerConnectionObserver* pObserver,
                                      bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            NewPeerConnectionParams params(pluginId, iceConfig, pObserver);
            m_msgq.Send(MSG_NEW_PEERCONNECTION, &params, true);
            return params.m_bResult;
        }
        else
        {
            return NewPeerConnection_w(pluginId, iceConfig, pObserver);
        }
    }
    
    bool RtcCenter::AddStream(const std::string& pluginId,
                              const std::string& label,
                              bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            AddStreamParams params(pluginId, label);
            m_msgq.Send(MSG_ADD_STREAM, &params, true);
            return params.m_bResult;
        }
        
        return AddStream_w(pluginId, label);
    }
    
    bool RtcCenter::RemoveStream(const std::string& pluginId,
                                 const std::string& label,
                                 bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            RemoveStreamParams params(pluginId, label);
            m_msgq.Send(MSG_REMOVE_STREAM, &params, true);
            return params.m_bResult;
        }
        
        return RemoveStream_w(pluginId, label);
    }

    std::string RtcCenter::CreateOffer(const std::string& pluginId,
                                       const webrtc::MediaHints& mediaHints,
                                       bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            CreateOfferParams params(pluginId, mediaHints);
            m_msgq.Send(MSG_CREATE_OFFER, &params, true);
            return params.m_offerSdp;
        }

        return CreateOffer_w(pluginId, mediaHints);
    }
    
    std::string RtcCenter::CreateAnswer(const std::string& pluginId,
                                        const webrtc::MediaHints& mediaHints,
                                        const std::string& offerSdp,
                                        bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            CreateAnswerParams params(pluginId, mediaHints, offerSdp);
            m_msgq.Send(MSG_CREATE_ANSWER, &params, true);
            return params.m_answerSdp;
        }

        return CreateAnswer_w(pluginId, mediaHints, offerSdp);
    }
    
    void RtcCenter::SetLocalDescription(const std::string& pluginId,
                                        const webrtc::JsepInterface::Action& action,
                                        const std::string& sdp,
                                        const FB::JSObjectPtr& succCb,
                                        const FB::JSObjectPtr& failCb,
                                        bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            SetLocalSdpParams* pParams = new SetLocalSdpParams(pluginId, action, sdp, succCb, failCb);
            m_msgq.Send(MSG_SET_LOCAL_SDP, pParams);
        }
        else
        {
            SetLocalDescription_w(pluginId, action, sdp, succCb, failCb);
        }
    }
    
    bool RtcCenter::SetRemoteDescription(const std::string& pluginId,
                                         const webrtc::JsepInterface::Action &action,
                                         const std::string &sdp,
                                         bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            SetRemoteSdpParams params(pluginId, action, sdp);
            m_msgq.Send(MSG_SET_REMOTE_SDP, &params, true);
            return params.m_bResult;
        }

        return SetRemoteDescription_w(pluginId, action, sdp);
    }
    
    bool RtcCenter::ProcessIceMessage(const std::string& pluginId,
                                      const std::string &candidateSdp,
                                      bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            ProcessIceMessageParams params(pluginId, candidateSdp);
            m_msgq.Send(MSG_PROCESS_ICE_MSG, &params, true);
            return params.m_bResult;
        }
            
        return ProcessIceMessage_w(pluginId, candidateSdp);
    }
    
    bool RtcCenter::StartIce(const std::string& pluginId,
                             bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            StartIceParams params(pluginId);
            m_msgq.Send(MSG_START_ICE, &params, true);
            return params.m_bResult;
        }

        return StartIce_w(pluginId);
    }
    
    bool RtcCenter::DeletePeerConnection(const std::string& pluginId,
                                         bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            DeletePeerConnectionParams params(pluginId);
            m_msgq.Send(MSG_DELETE_PEERCONNECTION, &params, true);
            return params.m_bResult;
        }

        return DeletePeerConnection_w(pluginId);
    }
    
    std::string RtcCenter::ReadyState(const std::string& pluginId)
    {
        return GetReadyStateString(m_pPeerConns[pluginId]->ready_state());        
    }
    
    bool RtcCenter::Inited() const
    {
        return static_cast<bool>(NULL != m_pConnFactory.get());
    }
    
    bool RtcCenter::GetLocalVideoTrackEnabled() const
    {
        if(0 < m_pLocalStream->video_tracks()->count())
        {
            return m_pLocalStream->video_tracks()->at(0)->enabled(); 
        }
        
        return false;
    }
    
    bool RtcCenter::GetLocalAudioTrackEnabled() const
    {
        if(0 < m_pLocalStream->audio_tracks()->count())
        {
            return m_pLocalStream->audio_tracks()->at(0)->enabled();
        }
        
        return false;
    }
    
    bool RtcCenter::GetSpkVol(int* pLevel) const
    {
        return m_pConnFactory->channel_manager()->GetOutputVolume(pLevel);
    }
    
    bool RtcCenter::GetSpkMute(bool* pbEnabled) const
    {
        return m_pConnFactory->channel_manager()->GetOutputMute(pbEnabled);
    }    
    
    std::string RtcCenter::GetLocalVideoTrackEffect() const
    {
        if(0 < m_pLocalStream->video_tracks()->count())
        {
            talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface> pTrack(
                static_cast<webrtc::LocalVideoTrackInterface*>(m_pLocalStream->video_tracks()->at(0))
            );
            
            if(NULL == pTrack.get())
            {
                return "none";
            }
            
            return pTrack->GetVideoCapture()->GetEffect();
        }
        
        return "none";
    }
    
    void RtcCenter::SetLocalVideoTrackEnabled(bool bEnable)
    {
        if(0 < m_pLocalStream->video_tracks()->count())
        {
            m_pLocalStream->video_tracks()->at(0)->set_enabled(bEnable);
        }
    }
    
    void RtcCenter::SetLocalAudioTrackEnabled(bool bEnable)
    {
        if(0 < m_pLocalStream->audio_tracks()->count())
        {
            m_pLocalStream->audio_tracks()->at(0)->set_enabled(bEnable);
        }
    }
    
    void RtcCenter::SetLocalVideoTrackRenderer(const talk_base::scoped_refptr
                                               <webrtc::VideoRendererWrapperInterface>& pRenderer)
    {
        if(0 < m_pLocalStream->video_tracks()->count())
        {
            m_pLocalStream->video_tracks()->at(0)->SetRenderer(pRenderer);
        }
    }
    
    void RtcCenter::SetLocalVideoTrackEffect(const std::string& effect)
    {
        if(0 < m_pLocalStream->video_tracks()->count())
        {
            talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface> pTrack(
                static_cast<webrtc::LocalVideoTrackInterface*>(m_pLocalStream->video_tracks()->at(0))
            );
            
            if(NULL != pTrack.get())
            {
                pTrack->GetVideoCapture()->SetEffect(effect);
            }
        }            
    }
    
    void RtcCenter::SetRemoteVideoTrackRenderer(const std::string& pluginId,
                                                const talk_base::scoped_refptr
                                                <webrtc::VideoRendererWrapperInterface>& pRenderer)
    {
        if(0 < m_remoteStreams[pluginId]->video_tracks()->count())
        {
            m_remoteStreams[pluginId]->video_tracks()->at(0)->SetRenderer(pRenderer);
        }
    }
    
    void RtcCenter::AddRemoteStream(const std::string& pluginId,
                                    const talk_base::scoped_refptr
                                    <webrtc::MediaStreamInterface>& pStream)
    {
        m_remoteStreams[pluginId] = pStream;
    }
    
    void RtcCenter::RemoveRemoteStream(const std::string& pluginId)
    {
        if(m_remoteStreams.end() != m_remoteStreams.find(pluginId))
        {
            m_remoteStreams.erase(pluginId);
        }
    }

    RtcCenter::RtcCenter()
    : m_msgq(this)
    , m_pConnFactory(webrtc::CreatePeerConnectionFactory())
    , m_pLocalStream(NULL)
    {
        if(NULL == m_pConnFactory.get())
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::RtcCenter", "Failed to create peerconnection factory...");
        }
        else
        {
            m_msgq.Start();
        }
    }
    
    RtcCenter::~RtcCenter()
    {
        
    }
    
    void RtcCenter::OnMessage(talk_base::Message* msg)
    {
        switch(msg->message_id)
        {
            case MSG_GET_USER_MEDIA:
            {
                GetUserMediaParams* pParams = static_cast<GetUserMediaParams*>(msg->pdata);
                GetUserMedia_w(pParams->m_mediaHints,
                               pParams->m_succCb,
                               pParams->m_failCb);
                delete pParams;
                break;
            }
            
            case MSG_NEW_PEERCONNECTION:
            {
                NewPeerConnectionParams* pParams = static_cast<NewPeerConnectionParams*>(msg->pdata);
                pParams->m_bResult = NewPeerConnection_w(pParams->m_pluginId,
                                                         pParams->m_iceConfig,
                                                         pParams->m_pObserver);
                break;
            }
            
            case MSG_ADD_STREAM:
            {
                AddStreamParams* pParams = static_cast<AddStreamParams*>(msg->pdata);
                pParams->m_bResult = AddStream_w(pParams->m_pluginId, pParams->m_label);
                break;
            }
                
            case MSG_REMOVE_STREAM:
            {
                RemoveStreamParams* pParams = static_cast<RemoveStreamParams*>(msg->pdata);
                pParams->m_bResult = RemoveStream_w(pParams->m_pluginId, pParams->m_label);
                break;
            }

            case MSG_CREATE_OFFER:
            {
                CreateOfferParams* pParams = static_cast<CreateOfferParams*>(msg->pdata);
                pParams->m_offerSdp = CreateOffer_w(pParams->m_pluginId, pParams->m_mediaHints);
                break;
            }
            
            case MSG_CREATE_ANSWER:
            {
                CreateAnswerParams* pParams = static_cast<CreateAnswerParams*>(msg->pdata);
                pParams->m_answerSdp = CreateAnswer_w(pParams->m_pluginId,
                                                      pParams->m_mediaHints,
                                                      pParams->m_offerSdp);
                break;
            }
                
            case MSG_SET_LOCAL_SDP:
            {
                SetLocalSdpParams* pParams = static_cast<SetLocalSdpParams*>(msg->pdata);
                SetLocalDescription_w(pParams->m_pluginId,
                                      pParams->m_action,
                                      pParams->m_sdp,
                                      pParams->m_succCb,
                                      pParams->m_failCb);
                delete pParams;
                break;
            }
                
            case MSG_SET_REMOTE_SDP:
            {
                SetRemoteSdpParams* pParams = static_cast<SetRemoteSdpParams*>(msg->pdata);
                pParams->m_bResult = SetRemoteDescription_w(pParams->m_pluginId,
                                                            pParams->m_action,
                                                            pParams->m_sdp);
                break;
            }

            case MSG_PROCESS_ICE_MSG:
            {
                ProcessIceMessageParams* pParams = static_cast<ProcessIceMessageParams*>(msg->pdata);
                pParams->m_bResult = ProcessIceMessage_w(pParams->m_pluginId, pParams->m_candidateSdp);
                break;
            }
                
            case MSG_START_ICE:
            {
                StartIceParams* pParams = static_cast<StartIceParams*>(msg->pdata);
                pParams->m_bResult = StartIce_w(pParams->m_pluginId);
                break;
            }
                
            case MSG_DELETE_PEERCONNECTION:
            {
                DeletePeerConnectionParams* pParams = static_cast<DeletePeerConnectionParams*>(msg->pdata);
                pParams->m_bResult = DeletePeerConnection_w(pParams->m_pluginId);
                break;
            }
                
            case MSG_QUIT:
                talk_base::Thread::Current()->Quit();
                break;
                
            default:
                break;
        }
    }
    
    void RtcCenter::GetUserMedia_w(FB::JSObjectPtr mediaHints,
                                   FB::JSObjectPtr succCb,
                                   FB::JSObjectPtr failCb)
    {
        if(NULL == m_pConnFactory.get())
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::GetUserMedia_w", "Peerconnection factory is NULL...");
            if(NULL != failCb.get())
            {
                failCb->InvokeAsync("", FB::variant_list_of("Peerconnection factory NULL"));
            }
            return;
        }
        
        //Create local media stream object
        FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w", "Creating local media stream interface object...");
        m_pLocalStream = m_pConnFactory->CreateLocalMediaStream("usermedia");
        
        //If mediaHints.video == true, add video track
        if(true == mediaHints->GetProperty("video").convert_cast<bool>())
        {
            std::string videoInUniqueId = mediaHints->GetProperty("videoin").convert_cast<std::string>();
            talk_base::scoped_refptr<webrtc::VideoCaptureModule> pCapture = 
                LocalVideoTrack::GetCaptureDevice(videoInUniqueId);
            
            std::string msg = "Creating local video track interface object [camId: ";
            msg += (videoInUniqueId + "]...");
            FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w", msg);
            
            if(NULL == pCapture.get())
            {
                FBLOG_ERROR_CUSTOM("RtcCenter::GetUserMedia", "Failed to detect/open camera...");
                if(NULL != failCb.get())
                {
                    failCb->InvokeAsync("", FB::variant_list_of("Failed to detect/open camera"));
                }
                return;
            }
            
            std::string videoTrackLabel = "camera_";
            videoTrackLabel += videoInUniqueId;
            m_pLocalStream->AddTrack(m_pConnFactory->CreateLocalVideoTrack(videoTrackLabel,
                                                                           webrtc::CreateVideoCapturer(pCapture)));
        }
        
        //If mediaHints.audio == true, add audio track
        if(true == mediaHints->GetProperty("audio").convert_cast<bool>())
        {
            std::string audioIn;
            std::string audioOut;
            int opts;
            
            m_pConnFactory->channel_manager()->GetAudioOptions(&audioIn, &audioOut, &opts);
            audioIn = mediaHints->GetProperty("audioin").convert_cast<std::string>();
            audioOut = mediaHints->GetProperty("audioout").convert_cast<std::string>();

            std::string msg = "Creating local audio track interface object [audioIn: ";
            msg += (audioIn + ", audioOut: ");
            msg += (audioOut + "]...");
            FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w", msg);

            std::string audioTrackLabel = "microphone_";
            audioTrackLabel += audioIn;
            m_pConnFactory->channel_manager()->SetAudioOptions(audioIn, audioOut, opts);
            m_pLocalStream->AddTrack(m_pConnFactory->CreateLocalAudioTrack(audioTrackLabel, NULL));
        }
        
        if(NULL == succCb.get())
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::GetUserMedia", "No success callback available...");
            if(NULL != failCb.get())
            {
                failCb->InvokeAsync("", FB::variant_list_of("No success callback available"));
            }
            return;
        }
        
        succCb->InvokeAsync("", FB::variant_list_of(LocalMediaStream::Create(m_pLocalStream)));
        FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w", "GetUserMedia DONE");
    }
    
    bool RtcCenter::NewPeerConnection_w(const std::string& pluginId,
                                        const std::string& iceConfig,
                                        webrtc::PeerConnectionObserver* pObserver)
    {
        if(NULL == m_pConnFactory.get())
        {
            std::string msg = pluginId;
            msg += ": PeerConnection factory is NULL...";
            FBLOG_ERROR_CUSTOM("RtcCenter::NewPeerConnection_w", msg);
            return false;
        }
        
        if(m_pPeerConns.end() != m_pPeerConns.find(pluginId))
        {
            std::string msg = pluginId;
            msg += ": PeerConnection already created...";
            FBLOG_ERROR_CUSTOM("RtcCenter::NewPeerConnection_w", msg);
            return false;
        }
        
        std::string msg = pluginId;
        msg += ": Creating new PeerConnection with ICEConfig [";
        msg += iceConfig;
        msg += "]...";
        FBLOG_INFO_CUSTOM("RtcCenter::NewPeerConnection_w", msg);
        
        m_pPeerConns[pluginId] = m_pConnFactory->CreatePeerConnection(iceConfig, pObserver);
        if(NULL == m_pPeerConns[pluginId].get())
        {
            std::string msg = pluginId;
            msg += ": Create PeerConnection failed...";
            FBLOG_ERROR_CUSTOM("RtcCenter::NewPeerConnection_w", msg);
            m_pPeerConns.erase(pluginId);
            return false;
        }
        
        msg = pluginId;
        msg += ": Creating new PeerConnection DONE...";
        FBLOG_INFO_CUSTOM("RtcCenter::NewPeerConnection_w", msg);
        return true;
    }
    
    bool RtcCenter::AddStream_w(const std::string& pluginId,
                                const std::string& label)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            std::string msg = pluginId;
            msg += ": No PeerConnection found...";
            FBLOG_ERROR_CUSTOM("RtcCenter::AddStream_w", msg);
            return false;
        }
        
        if(NULL == m_pLocalStream.get())
        {
            std::string msg = pluginId;
            msg += ": No local stream present...";
            FBLOG_ERROR_CUSTOM("RtcCenter::AddStream_w", msg);
            return false;
        }
        
        if(label != m_pLocalStream->label())
        {
            std::string msg = pluginId;
            msg += ": No local stream [";
            msg += (label + "] present...");
            FBLOG_ERROR_CUSTOM("RtcCenter::AddStream_w", msg);
            return false;            
        }

        std::string msg = pluginId;
        msg += ": Adding local stream [";
        msg += (label + "]");
        FBLOG_INFO_CUSTOM("RtcCenter::AddStream_w", (msg + "..."));

        m_pPeerConns[pluginId]->AddStream(m_pLocalStream.get());

        FBLOG_INFO_CUSTOM("RtcCenter::AddStream_w", (msg += " DONE..."));
        return true;
    }

    bool RtcCenter::RemoveStream_w(const std::string& pluginId,
                                   const std::string& label)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            std::string msg = pluginId;
            msg += ": No PeerConnection found...";
            FBLOG_ERROR_CUSTOM("RtcCenter::RemoveStream_w", msg);
            return false;
        }
        
        if(NULL == m_pLocalStream.get())
        {
            std::string msg = pluginId;
            msg += ": No local stream present...";
            FBLOG_ERROR_CUSTOM("RtcCenter::RemoveStream_w", msg);
            return false;
        }
        
        if(label != m_pLocalStream->label())
        {
            std::string msg = pluginId;
            msg += ": No local stream [";
            msg += (label + "] present...");
            FBLOG_ERROR_CUSTOM("RtcCenter::RemoveStream_w", msg);
            return false;            
        }
        
        std::string msg = pluginId;
        msg += ": Removing local stream [";
        msg += (label + "]");
        FBLOG_INFO_CUSTOM("RtcCenter::RemoveStream_w", (msg + "..."));

        m_pPeerConns[pluginId]->RemoveStream(m_pLocalStream.get());
        
        FBLOG_INFO_CUSTOM("RtcCenter::RemoveStream_w", (msg += " DONE..."));
        return true;
    }
    
    std::string RtcCenter::CreateOffer_w(const std::string& pluginId,
                                         const webrtc::MediaHints& mediaHints)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            std::string msg = pluginId;
            msg += ": No PeerConnection found...";
            FBLOG_ERROR_CUSTOM("RtcCenter::CreateOffer_w", msg);
            return "";
        }
        
        std::string offerSdp("");
        if(false == m_pPeerConns[pluginId]->CreateOffer(mediaHints)->ToString(&offerSdp))
        {
            std::string msg = pluginId;
            msg += ": Failed to create offer...";
            FBLOG_ERROR_CUSTOM("RtcCenter::CreateOffer_w", msg);
            return "";
        }
        
        std::string msg = pluginId;
        msg += ": Offer = [";
        msg += offerSdp;
        msg += "]...";
        FBLOG_INFO_CUSTOM("RtcCenter::CreateOffer_w", msg);
        
        return offerSdp;
    }

    std::string RtcCenter::CreateAnswer_w(const std::string& pluginId,
                                          const webrtc::MediaHints& mediaHints,
                                          const std::string& offerSdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            std::string msg = pluginId;
            msg += ": No PeerConnection found...";
            FBLOG_ERROR_CUSTOM("RtcCenter::CreateAnswer_w", msg);
            return "";
        }
        
        std::string answerSdp("");
        webrtc::SessionDescriptionInterface* pOffer = webrtc::CreateSessionDescription(offerSdp);
        if(false == m_pPeerConns[pluginId]->CreateAnswer(mediaHints, pOffer)->ToString(&answerSdp))
        {
            std::string msg = pluginId;
            msg += ": Failed to create answer...";
            FBLOG_ERROR_CUSTOM("RtcCenter::CreateAnswer_w", msg);
            return "";
        }
        
        std::string msg = pluginId;
        msg += ": Answer = [";
        msg += answerSdp;
        msg += "]...";
        FBLOG_INFO_CUSTOM("RtcCenter::CreateAnswer_w", msg);
        
        return answerSdp;
    }
    
    void RtcCenter::SetLocalDescription_w(const std::string& pluginId,
                                          const webrtc::JsepInterface::Action &action,
                                          const std::string &sdp,
                                          const FB::JSObjectPtr& succCb,
                                          const FB::JSObjectPtr& failCb)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            std::string msg = pluginId;
            msg += ": No PeerConnection found...";
            FBLOG_ERROR_CUSTOM("RtcCenter::SetLocalDescription_w", msg);
            
            if(NULL != failCb.get())
            {
                failCb->InvokeAsync("", FB::variant_list_of("No peerconnection found"));
            }
            return;
        }
        
        std::string msg = pluginId;
        msg += ": Setting local sdp as ";
        msg += ((webrtc::JsepInterface::kOffer == action) ? "OFFER" : "ANSWER");
        FBLOG_INFO_CUSTOM("RtcCenter::SetLocalDescription_w", (msg + "..."));
        
        webrtc::SessionDescriptionInterface* pSdp = webrtc::CreateSessionDescription(sdp);
        if(NULL == pSdp)
        {
            std::string msg = pluginId;
            msg += ": Failed to create sdp object...";
            FBLOG_ERROR_CUSTOM("RtcCenter::SetLocalDescription_w", msg);
            
            if(NULL != failCb.get())
            {
                failCb->InvokeAsync("", FB::variant_list_of("Failed to create sdp object"));
            }
            return;
        }
        
        if(false == m_pPeerConns[pluginId]->SetLocalDescription(action, pSdp))
        {
            std::string msg = pluginId;
            msg += ": Failed to set local description...";
            FBLOG_ERROR_CUSTOM("RtcCenter::SetLocalDescription_w", msg);

            if(NULL != failCb.get())
            {
                failCb->InvokeAsync("", FB::variant_list_of("Failed to set local description"));
            }
            return;
        }
        
        if(NULL == succCb.get())
        {
            std::string msg = pluginId;
            msg += ": No success callback available...";
            FBLOG_ERROR_CUSTOM("RtcCenter::SetLocalDescription_w", msg);

            if(NULL != failCb.get())
            {
                failCb->InvokeAsync("", FB::variant_list_of("No success callback available"));
            }
            return;
        }
        
        FBLOG_INFO_CUSTOM("RtcCenter::SetLocalDescription_w", (msg + " DONE..."));
        succCb->InvokeAsync("", FB::variant_list_of());
    }

    bool RtcCenter::SetRemoteDescription_w(const std::string& pluginId,
                                           const webrtc::JsepInterface::Action &action,
                                           const std::string &sdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            std::string msg = pluginId;
            msg += ": No PeerConnection found...";
            FBLOG_ERROR_CUSTOM("RtcCenter::SetRemoteDescription_w", msg);
            return false;
        }
        
        std::string msg = pluginId; 
        msg += ": Setting remote sdp as ";
        msg += ((webrtc::JsepInterface::kOffer == action) ? "OFFER" : "ANSWER");
        FBLOG_INFO_CUSTOM("RtcCenter::SetRemoteDescription_w", (msg + "..."));

        webrtc::SessionDescriptionInterface* pSdp = webrtc::CreateSessionDescription(sdp);
        if(NULL == pSdp)
        {
            std::string msg = pluginId;
            msg += ": Failed to create sdp object...";
            FBLOG_ERROR_CUSTOM("RtcCenter::SetRemoteDescription_w", msg);
            return false;
        }
        
        if(false == m_pPeerConns[pluginId]->SetRemoteDescription(action, pSdp))
        {
            std::string msg = pluginId;
            msg += ": Failed to set remote description...";
            FBLOG_ERROR_CUSTOM("RtcCenter::SetRemotelDescription_w", msg);
            return false;                        
        }
        
        FBLOG_INFO_CUSTOM("RtcCenter::SetRemotelDescription_w", (msg + " DONE..."));
        return true;
    }
    
    bool RtcCenter::ProcessIceMessage_w(const std::string& pluginId,
                                        const std::string &candidateSdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            std::string msg = pluginId;
            msg += ": No PeerConnection found...";
            FBLOG_ERROR_CUSTOM("RtcCenter::ProcessIceMessage_w", msg);
            return false;
        }
        
        std::string msg = pluginId;
        msg += ": Processing candidate [";
        msg += (candidateSdp + "]...");
        FBLOG_INFO_CUSTOM("RtcCenter::ProcessIceMessage_w", msg);

        webrtc::IceCandidateInterface* pCandidate = webrtc::CreateIceCandidate("0", candidateSdp);
        if(NULL == pCandidate)
        {
            std::string msg = pluginId;
            msg += ": Failed to create candidate object";
            FBLOG_ERROR_CUSTOM("RtcCenter::ProcessIceMessage_w", msg);
            return false;
        }
                
        if(false == m_pPeerConns[pluginId]->ProcessIceMessage(pCandidate))
        {
            std::string msg = pluginId;
            msg += ": Failed to process candidate...";
            FBLOG_ERROR_CUSTOM("RtcCenter::ProcessIceMessage_w", msg);
            return false;            
        }
        
        msg = pluginId;
        msg += ": Processing candidate DONE...";
        FBLOG_INFO_CUSTOM("RtcCenter::ProcessIceMessage_w", msg);
        
        return true;
    }
    
    bool RtcCenter::StartIce_w(const std::string& pluginId)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            std::string msg = pluginId;
            msg += ": No PeerConnection found...";
            FBLOG_ERROR_CUSTOM("RtcCenter::StartIce_w", msg);
            return false;
        }

        FBLOG_INFO_CUSTOM("RtcCenter::StartIce_w", (pluginId + ": Starting ICE machine..."));
        if(false == m_pPeerConns[pluginId]->StartIce(webrtc::JsepInterface::kUseAll))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::StartIce_w", (pluginId + ": Failed to start ICE process..."));
            return false;
        }
        
        FBLOG_INFO_CUSTOM("RtcCenter::StartIce_w", (pluginId + ": Starting ICE machine DONE..."));
        return true;
    }
    
    bool RtcCenter::DeletePeerConnection_w(const std::string& pluginId)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::DeletePeerConnection_w",
                               (pluginId + ": No PeerConnection found..."));
            return false;
        }

        if("localPlayer" == pluginId)
        {
			if(0 < m_pLocalStream->audio_tracks()->count())
			{
				m_pLocalStream->audio_tracks()->at(0)->set_enabled(true);
			}

			if(0 < m_pLocalStream->video_tracks()->count())
			{
				m_pLocalStream->video_tracks()->at(0)->set_enabled(false);
			}
        }
        else
        {
             RemoveRemoteStream(pluginId);
        }
        
        FBLOG_INFO_CUSTOM("RtcCenter::DeletePeerConnection_w",
                          (pluginId + ": Deleting peerconnection..."));
        m_pPeerConns[pluginId] = NULL;
        m_pPeerConns.erase(pluginId);
        return true;
    }
}
