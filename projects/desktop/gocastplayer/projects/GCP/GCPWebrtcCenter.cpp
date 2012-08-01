//
//  GCPWebrtcCenter.cpp
//  FireBreath
//
//  Created by Manjesh Malavalli on 6/25/12.
//  Copyright (c) 2012 XVDTH. All rights reserved.
//

#include "GCPWebrtcCenter.h"
#include "GCPMediaStream.h"
#include "variant_list.h"

std::string funcstr(const std::string& func, const std::string& pluginId)
{
    std::string funcString = func + "(";
    funcString += pluginId;
    funcString += ")";
    
    return funcString;
}

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
        FBLOG_INFO_CUSTOM("MessageQueue::MessageQueue()", "Constructor DONE");
    }
    
    MessageQueue::~MessageQueue()
    {
        FBLOG_INFO_CUSTOM("MessageQueue::~MessageQueue()", "Killing msgq thread...");
        Send(MSG_QUIT, NULL);
        m_thread.join();
        FBLOG_INFO_CUSTOM("MessageQueue::~MessageQueue()", "Killing msgq thread DONE");
    }
    
    void MessageQueue::Start()
    {
        FBLOG_INFO_CUSTOM("MessageQueue::Start()", "Starting...");
        m_thread = boost::thread(&MessageQueue::WorkerFunction, this);
        FBLOG_INFO_CUSTOM("MessageQueue::Start()", "Starting DONE");
    }
    
    void MessageQueue::Send(int msgType, talk_base::MessageData *pArgs, bool bWait)
    {
        boost::mutex::scoped_lock lock(m_mutex);
        talk_base::Message* pMsg = new talk_base::Message();
        
        std::string msg("Sending message of type [");
        msg += GetMsgTypeString(msgType);
        msg += "]";
        msg += ((true==bWait)? " (wait for result)...": "...");
        FBLOG_INFO_CUSTOM("MessageQueue::Send()", msg);
        
        pMsg->message_id = msgType;
        pMsg->pdata = pArgs;
        m_messages.push_back(pMsg);
        
        if(true == bWait)
        {
            m_done.wait(m_mutex);
            FBLOG_INFO_CUSTOM("MessageQueue::Send()", "Wait for result DONE");
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
        
        FBLOG_INFO_CUSTOM("MessageQueue::WorkerFunction()",
                          "Msgq overrides PhysicalSocketServer::Wait() to process messages");
        talk_base::Thread::Current()->set_socketserver(this);
        
        FBLOG_INFO_CUSTOM("MessageQueue::WorkerFunction()", "Entering Run()...");
        talk_base::Thread::Current()->Run();
        
        FBLOG_INFO_CUSTOM("MessageQueue::WorkerFunction()", "Exited Run()...");
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
            FBLOG_INFO_CUSTOM("MessageQueue::ProcessMessage()", msg);
            
            m_pHandler->OnMessage(pMsg);
            
            if(MSG_SET_LOCAL_SDP != pMsg->message_id &&
               MSG_GET_USER_MEDIA != pMsg->message_id)
            {
                FBLOG_INFO_CUSTOM("MessageQueue::ProcessMessage()", "Notifying waiting parent...");
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
            FBLOG_INFO_CUSTOM("RtcCenter::Instance()", "Deleting RtcCenter Singleton...");
            delete pInst;
            pInst = NULL;
            FBLOG_INFO_CUSTOM("RtcCenter::Instance()", "Deleting RtcCenter Singleton DONE");
        }
        else if(NULL == pInst)
        {
            FBLOG_INFO_CUSTOM("RtcCenter::Instance()", "Creating RtcCenter Singleton...");
            pInst = new RtcCenter();
            FBLOG_INFO_CUSTOM("RtcCenter::Instance()", "Creating RtcCenter Singleton DONE...");
        }
        
        return pInst;
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
        std::string readyState = GetReadyStateString(m_pPeerConns[pluginId]->ready_state());
        
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::ReadyState", pluginId), readyState);
        return readyState;
    }
    
    RtcCenter::RtcCenter()
    : m_msgq(this)
    , m_pConnFactory(webrtc::CreatePeerConnectionFactory())
    , m_pLocalStream(NULL)
    {
        if(NULL == m_pConnFactory.get())
        {
            FBLOG_INFO_CUSTOM("RtcCenter::RtcCenter()", "Failed to create peerconnection factory");
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
            FBLOG_ERROR_CUSTOM("RtcCenter::GetUserMedia_w()", "Peerconnection factory is NULL...");
            failCb->InvokeAsync("", FB::variant_list_of("Peerconnection factory NULL"));
            return;
        }
        
        //Create local media stream object
        FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w()", "Creating local media stream interface object...");
        m_pLocalStream = m_pConnFactory->CreateLocalMediaStream("localStream");
        
        //If mediaHints.video == true, add video track
        if(true == mediaHints->GetProperty("video").convert_cast<bool>())
        {
            FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w()", "Creating local video track interface object...");
            m_pLocalStream->AddTrack(m_pConnFactory->CreateLocalVideoTrack(
                "localvideo",
                webrtc::CreateVideoCapturer(LocalVideoTrack::GetDefaultCaptureDevice())
            ));            
        }
        
        //If mediaHints.audio == true, add audio track
        if(true == mediaHints->GetProperty("audio").convert_cast<bool>())
        {
            FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w()", "Creating local audio track interface object...");
            m_pLocalStream->AddTrack(m_pConnFactory->CreateLocalAudioTrack("localaudio", NULL));
        }
        
        
        succCb->InvokeAsync("", FB::variant_list_of(LocalMediaStream::Create(m_pLocalStream)));
        FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w()", "GetUserMedia DONE");
    }
    
    bool RtcCenter::NewPeerConnection_w(const std::string& pluginId,
                                        const std::string& iceConfig,
                                        webrtc::PeerConnectionObserver* pObserver)
    {
        if(NULL == m_pConnFactory.get())
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::NewPeerConnection_w", pluginId),
                               "PeerConnection factory is NULL");
            return false;
        }
        
        if(m_pPeerConns.end() != m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::NewPeerConnection_w", pluginId),
                               "PeerConnection already created");            
            return false;
        }
        
        std::string msg("Creating new PeerConnection with ICEConfig [");
        msg += iceConfig;
        msg += "]...";
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::NewPeerConnection_w", pluginId), msg);
        
        m_pPeerConns[pluginId] = m_pConnFactory->CreatePeerConnection(iceConfig, pObserver);
        if(NULL == m_pPeerConns[pluginId].get())
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::NewPeerConnection_w", pluginId),
                               "Create PeerConnection FAILED");
            m_pPeerConns.erase(pluginId);
            return false;
        }
        
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::NewPeerConnection_w", pluginId),
                          "Creating new PeerConnection DONE");
        return true;
    }
    
    bool RtcCenter::AddStream_w(const std::string& pluginId,
                                const std::string& label)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::AddStream_w", pluginId),
                               "No PeerConnection found for this plugin instance");
            return false;
        }
        
        if(NULL == m_pLocalStream.get())
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::AddStream_w", pluginId), "No local stream present");
            return false;
        }
        
        if(label != m_pLocalStream->label())
        {
            std::string msg("No local stream [");
            msg += (label + "] present");
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::AddStream_w", pluginId), msg);
            return false;            
        }

        std::string msg("Adding local stream [");
        msg += (label + "]...");
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::AddStream_w", pluginId), msg);
        m_pPeerConns[pluginId]->AddStream(m_pLocalStream.get());
        
        return true;
    }

    bool RtcCenter::RemoveStream_w(const std::string& pluginId,
                                   const std::string& label)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::RemoveStream_w", pluginId),
                               "No PeerConnection found for this plugin instance");
            return false;
        }
        
        if(NULL == m_pLocalStream.get())
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::RemoveStream_w", pluginId), "No local stream present");
            return false;
        }
        
        if(label != m_pLocalStream->label())
        {
            std::string msg("No local stream [");
            msg += (label + "] present");
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::RemoveStream_w", pluginId), msg);
            return false;            
        }
        
        std::string msg("Removing local stream [");
        msg += (label + "]...");
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::RemoveStream_w", pluginId), msg);
        m_pPeerConns[pluginId]->RemoveStream(m_pLocalStream.get());
        
        return true;
    }
    
    std::string RtcCenter::CreateOffer_w(const std::string& pluginId,
                                         const webrtc::MediaHints& mediaHints)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::CreateOffer_w", pluginId),
                               "No PeerConnection found for this plugin instance");
            return "";
        }
        
        std::string offerSdp("");
        if(false == m_pPeerConns[pluginId]->CreateOffer(mediaHints)->ToString(&offerSdp))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::CreateOffer_w", pluginId), "Failed to create offer");
            return "";
        }
        
        std::string msg("Offer = [");
        msg += offerSdp;
        msg += "]";
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::CreateOffer_w", pluginId), msg);
        return offerSdp;
    }

    std::string RtcCenter::CreateAnswer_w(const std::string& pluginId,
                                          const webrtc::MediaHints& mediaHints,
                                          const std::string& offerSdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::CreateAnswer_w", pluginId),
                               "No PeerConnection found for this plugin instance");
            return "";
        }
        
        std::string answerSdp("");
        webrtc::SessionDescriptionInterface* pOffer = webrtc::CreateSessionDescription(offerSdp);
        if(false == m_pPeerConns[pluginId]->CreateAnswer(mediaHints, pOffer)->ToString(&answerSdp))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::CreateAnswer_w", pluginId), "Failed to create answer");
            return "";
        }
        
        std::string msg("Answer = [");
        msg += answerSdp;
        msg += "]";
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::CreateAnswer_w", pluginId), msg);
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
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::SetLocalDescription_w", pluginId),
                               "No PeerConnection found for this plugin instance");
            failCb->InvokeAsync("", FB::variant_list_of("No peerconnection found for this plugin instance"));
            return;
        }
        
        std::string msg("Setting local sdp as ");
        msg += ((webrtc::PeerConnectionInterface::kOffer == action) ? "OFFER..." : "ANSWER...");
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::SetLocalDescription_w", pluginId), msg);
        
        webrtc::SessionDescriptionInterface* pSdp = webrtc::CreateSessionDescription(sdp);
        if(NULL == pSdp)
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::SetLocalDescription_w", pluginId),
                               "Failed to create sdp object");
            failCb->InvokeAsync("", FB::variant_list_of("Failed to create sdp object"));
            return;
        }
        
        if(false == m_pPeerConns[pluginId]->SetLocalDescription(action, pSdp))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::SetLocalDescription_w", pluginId),
                               "Failed to set local description");
            failCb->InvokeAsync("", FB::variant_list_of("Failed to set local description"));
            return;
        }
        
        succCb->InvokeAsync("", FB::variant_list_of());
    }

    bool RtcCenter::SetRemoteDescription_w(const std::string& pluginId,
                                           const webrtc::JsepInterface::Action &action,
                                           const std::string &sdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::SetRemoteDescription_w", pluginId),
                               "No PeerConnection found for this plugin instance");
            return false;
        }
        
        std::string msg("Setting remote sdp as ");
        msg += ((webrtc::PeerConnectionInterface::kOffer == action) ? "OFFER..." : "ANSWER...");
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::SetRemoteDescription_w", pluginId), msg);

        webrtc::SessionDescriptionInterface* pSdp = webrtc::CreateSessionDescription(sdp);
        if(NULL == pSdp)
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::SetRemoteDescription_w", pluginId),
                               "Failed to create sdp object");
            return false;
        }
        
        if(false == m_pPeerConns[pluginId]->SetRemoteDescription(action, pSdp))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::SetRemoteDescription_w", pluginId),
                               "Failed to set remote description");
            return false;                        
        }
        
        return true;
    }
    
    bool RtcCenter::ProcessIceMessage_w(const std::string& pluginId,
                                        const std::string &candidateSdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::ProcessIceMessage_w", pluginId),
                               "No PeerConnection found for this plugin instance");
            return false;
        }
        
        std::string msg("Processing candidate [");
        msg += (candidateSdp + "]...");
        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::ProcessIceMessage_w", pluginId), msg);

        webrtc::IceCandidateInterface* pCandidate = webrtc::CreateIceCandidate("0", candidateSdp);
        if(NULL == pCandidate)
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::ProcessIceMessage_w", pluginId),
                               "Failed to create candidate object");
            return false;
        }
                
        if(false == m_pPeerConns[pluginId]->ProcessIceMessage(pCandidate))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::ProcessIceMessage_w", pluginId),
                               "Failed to process candidate");
            return false;            
        }
        
        return true;
    }
    
    bool RtcCenter::StartIce_w(const std::string& pluginId)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::StartIce_w", pluginId),
                               "No PeerConnection found for this plugin instance");
            return false;
        }

        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::StartIce_w", pluginId), "Starting ICE machine...");
        if(false == m_pPeerConns[pluginId]->StartIce(webrtc::JsepInterface::kUseAll))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::StartIce_w", pluginId), "Failed to start ICE process");
            return false;
        }
        
        return true;
    }
    
    bool RtcCenter::DeletePeerConnection_w(const std::string& pluginId)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pluginId))
        {
            FBLOG_ERROR_CUSTOM(funcstr("RtcCenter::DeletePeerConnection_w", pluginId),
                               "No PeerConnection found for this plugin instance");
            return false;
        }

        FBLOG_INFO_CUSTOM(funcstr("RtcCenter::DeletePeerConnection_w", pluginId), "Deleting peerconnection...");
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
        
        m_pPeerConns.erase(pluginId);
        
        return true;
    }
}
