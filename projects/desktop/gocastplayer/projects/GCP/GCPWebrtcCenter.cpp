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
#include <iostream>

#define FBLOG_INFO_CUSTOM(func, msg) std::cout << func << " [INFO]: " << msg << std::endl;
#define FBLOG_ERROR_CUSTOM(func, msg) std::cout << func << " [ERROR]: " << msg << std::endl;

namespace GoCast
{    
    enum
    {
        MSG_QUIT = 1,
        MSG_GET_USER_MEDIA,
        MSG_RENDER_STREAM,
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
            case MSG_RENDER_STREAM: return "MSG_RENDER_STREAM";
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
    
    struct RenderStreamParams : public talk_base::MessageData
    {
        RenderStreamParams(FB::JSAPIPtr stream,
                           webrtc::PeerConnectionObserver* pObserver,
                           const talk_base::scoped_refptr<webrtc::VideoRendererWrapperInterface>& pRenderer)
        : m_stream(stream)
        , m_pObserver(pObserver)
        , m_pRenderer(pRenderer)
        {
            
        }
        
        FB::JSAPIPtr m_stream;
        webrtc::PeerConnectionObserver* m_pObserver;
        talk_base::scoped_refptr<webrtc::VideoRendererWrapperInterface> m_pRenderer;
    };
    
    struct NewPeerConnectionParams : public talk_base::MessageData
    {
        NewPeerConnectionParams(const std::string& iceConfig, webrtc::PeerConnectionObserver* pObserver)
        : m_bResult(false)
        , m_iceConfig(iceConfig)
        , m_pObserver(pObserver)
        {
            
        }
        
        bool m_bResult;
        std::string m_iceConfig;
        webrtc::PeerConnectionObserver* m_pObserver;
    };
    
    struct AddStreamParams : public talk_base::MessageData
    {
        AddStreamParams(webrtc::PeerConnectionObserver* pObserver,
                        const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream)
        : m_pObserver(pObserver)
        , m_pStream(pStream)
        {
            
        }
        
        webrtc::PeerConnectionObserver* m_pObserver;
        talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> m_pStream;
    };
    
    struct RemoveStreamParams : public talk_base::MessageData
    {
        RemoveStreamParams(webrtc::PeerConnectionObserver* pObserver,
                           const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream)
        : m_pObserver(pObserver)
        , m_pStream(pStream)
        {
            
        }
        
        webrtc::PeerConnectionObserver* m_pObserver;
        talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> m_pStream;
    };

    struct CreateOfferParams : public talk_base::MessageData
    {
        CreateOfferParams(webrtc::PeerConnectionObserver* pObserver,
                          const webrtc::MediaHints& mediaHints)
        : m_offerSdp("")
        , m_pObserver(pObserver)
        , m_mediaHints(mediaHints)
        {
            
        }
        
        std::string m_offerSdp;
        webrtc::PeerConnectionObserver* m_pObserver;
        webrtc::MediaHints m_mediaHints;
    };
    
    struct CreateAnswerParams : public talk_base::MessageData
    {
        CreateAnswerParams(webrtc::PeerConnectionObserver* pObserver,
                           const webrtc::MediaHints& mediaHints,
                           const std::string& offerSdp)
        : m_answerSdp("")
        , m_offerSdp(offerSdp)
        , m_pObserver(pObserver)
        , m_mediaHints(mediaHints)
        {
            
        }
        
        std::string m_answerSdp;
        std::string m_offerSdp;
        webrtc::PeerConnectionObserver* m_pObserver;
        webrtc::MediaHints m_mediaHints;
    };

    struct SetLocalSdpParams : public talk_base::MessageData
    {
        SetLocalSdpParams(webrtc::PeerConnectionObserver* pObserver,
                          const webrtc::JsepInterface::Action& action,
                          const std::string& sdp,
                          const FB::JSObjectPtr& succCb,
                          const FB::JSObjectPtr& failCb)
        : m_pObserver(pObserver)
        , m_action(action)
        , m_sdp(sdp)
        , m_succCb(succCb)
        , m_failCb(failCb)
        {
            
        }
        
        webrtc::PeerConnectionObserver* m_pObserver;
        webrtc::JsepInterface::Action m_action;
        std::string m_sdp;
        FB::JSObjectPtr m_succCb;
        FB::JSObjectPtr m_failCb;
    };
    
    struct SetRemoteSdpParams : public talk_base::MessageData
    {
        SetRemoteSdpParams(webrtc::PeerConnectionObserver* pObserver,
                           const webrtc::JsepInterface::Action& action,
                           const std::string& sdp)
        : m_pObserver(pObserver)
        , m_sdp(sdp)
        {
            
        }
        
        webrtc::PeerConnectionObserver* m_pObserver;
        webrtc::JsepInterface::Action m_action;
        std::string m_sdp;
    };
    
    struct ProcessIceMessageParams : public talk_base::MessageData
    {
        ProcessIceMessageParams(webrtc::PeerConnectionObserver* pObserver,
                                const std::string& candidateSdp)
        : m_pObserver(pObserver)
        , m_candidateSdp(candidateSdp)
        {
            
        }
        
        webrtc::PeerConnectionObserver* m_pObserver;
        std::string m_candidateSdp;
    };
    
    struct StartIceParams : public talk_base::MessageData
    {
        StartIceParams(webrtc::PeerConnectionObserver* pObserver)
        : m_pObserver(pObserver)
        {
            
        }
        
        webrtc::PeerConnectionObserver* m_pObserver;
    };
    
    struct DeletePeerConnectionParams : public talk_base::MessageData
    {
        DeletePeerConnectionParams(webrtc::PeerConnectionObserver* pObserver)
        : m_pObserver(pObserver)
        {
            
        }
        
        webrtc::PeerConnectionObserver* m_pObserver;
    };

    MessageQueue::MessageQueue(MessageHandler* pHandler)
    : m_pHandler(pHandler)
    , m_thread(boost::thread(&MessageQueue::WorkerFunction, this))
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
        talk_base::AutoThread thread;
        
        FBLOG_INFO_CUSTOM("MessageQueue::WorkerFunction()", "Msgq overrides PhysicalSocketServer::Wait() to process messages");
        talk_base::Thread::Current()->set_socketserver(this);
        
        FBLOG_INFO_CUSTOM("MessageQueue::WorkerFunction()", "Entering Run()...");
        talk_base::Thread::Current()->Run();
        
        FBLOG_INFO_CUSTOM("MessageQueue::WorkerFunction()", "Exited Run()...");
        talk_base::Thread::Current()->set_socketserver(NULL);
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
            
            if(MSG_NEW_PEERCONNECTION == pMsg->message_id ||
               MSG_CREATE_OFFER == pMsg->message_id ||
               MSG_CREATE_ANSWER == pMsg->message_id ||
               MSG_DELETE_PEERCONNECTION == pMsg->message_id)
            {
                FBLOG_INFO_CUSTOM("MessageQueue::ProcessMessage()", "Notifying waiting parent...");
                m_done.notify_one();
            }

            delete pMsg;
        }        
    }
    
    RtcCenter* RtcCenter::Instance(bool bDelete)
    {
        static RtcCenter* pInst = new RtcCenter();
        
        if(true == bDelete)
        {
            delete pInst;
            pInst = NULL;
        }
        
        return pInst;
    }
    
    const talk_base::scoped_refptr<webrtc::PeerConnectionFactoryInterface>& RtcCenter::PeerConnFactory() const
    {
        return m_pConnFactory;
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
    
    void RtcCenter::RenderStream(FB::JSAPIPtr pStream,
                                 webrtc::PeerConnectionObserver* pObserver,
                                 const talk_base::scoped_refptr<webrtc::VideoRendererWrapperInterface>& pRenderer)
    {
        RenderStreamParams* pParams = new RenderStreamParams(pStream, pObserver, pRenderer);
        m_msgq.Send(MSG_RENDER_STREAM, pParams);
    }
    
    bool RtcCenter::NewPeerConnection(const std::string& iceConfig,
                                      webrtc::PeerConnectionObserver* pObserver,
                                      bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            NewPeerConnectionParams params(iceConfig, pObserver);
            m_msgq.Send(MSG_NEW_PEERCONNECTION, &params, true);
            return params.m_bResult;
        }
        else
        {
            return NewPeerConnection_w(iceConfig, pObserver);
        }
    }
    
    void RtcCenter::AddStream(webrtc::PeerConnectionObserver* pObserver,
                              const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> &pStream,
                              bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            AddStreamParams* pParams = new AddStreamParams(pObserver, pStream);
            m_msgq.Send(MSG_ADD_STREAM, pParams);
        }
        else
        {
            AddStream_w(pObserver, pStream);
        }
    }
    
    void RtcCenter::RemoveStream(webrtc::PeerConnectionObserver* pObserver,
                                 const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> &pStream,
                                 bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            RemoveStreamParams* pParams = new RemoveStreamParams(pObserver, pStream);
            m_msgq.Send(MSG_REMOVE_STREAM, pParams);
        }
        else
        {
            RemoveStream_w(pObserver, pStream);
        }
    }

    std::string RtcCenter::CreateOffer(webrtc::PeerConnectionObserver* pObserver,
                                       const webrtc::MediaHints& mediaHints,
                                       bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            CreateOfferParams params(pObserver, mediaHints);
            m_msgq.Send(MSG_CREATE_OFFER, &params, true);
            return params.m_offerSdp;
        }
        else
        {
            return CreateOffer_w(pObserver, mediaHints);
        }
    }
    
    std::string RtcCenter::CreateAnswer(webrtc::PeerConnectionObserver* pObserver,
                                        const webrtc::MediaHints& mediaHints,
                                        const std::string& offerSdp,
                                        bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            CreateAnswerParams params(pObserver, mediaHints, offerSdp);
            m_msgq.Send(MSG_CREATE_ANSWER, &params, true);
            return params.m_answerSdp;
        }
        else
        {
            return CreateAnswer_w(pObserver, mediaHints, offerSdp);
        }
    }
    
    void RtcCenter::SetLocalDescription(webrtc::PeerConnectionObserver* pObserver,
                                        const webrtc::JsepInterface::Action& action,
                                        const std::string& sdp,
                                        const FB::JSObjectPtr& succCb,
                                        const FB::JSObjectPtr& failCb,
                                        bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            SetLocalSdpParams* pParams = new SetLocalSdpParams(pObserver, action, sdp, succCb, failCb);
            m_msgq.Send(MSG_SET_LOCAL_SDP, pParams);
        }
        else
        {
            SetLocalDescription_w(pObserver, action, sdp, succCb, failCb);
        }
    }
    
    void RtcCenter::SetRemoteDescription(webrtc::PeerConnectionObserver *pObserver,
                                         const webrtc::JsepInterface::Action &action,
                                         const std::string &sdp,
                                         bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            SetRemoteSdpParams* pParams = new SetRemoteSdpParams(pObserver, action, sdp);
            m_msgq.Send(MSG_SET_REMOTE_SDP, pParams);
        }
        else
        {
            SetRemoteDescription_w(pObserver, action, sdp);
        }
    }
    
    void RtcCenter::ProcessIceMessage(webrtc::PeerConnectionObserver *pObserver,
                                      const std::string &candidateSdp,
                                      bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            ProcessIceMessageParams* pParams = new ProcessIceMessageParams(pObserver, candidateSdp);
            m_msgq.Send(MSG_PROCESS_ICE_MSG, pParams);
        }
        else
        {
            ProcessIceMessage_w(pObserver, candidateSdp);
        }
    }
    
    void RtcCenter::StartIce(webrtc::PeerConnectionObserver* pObserver,
                             bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            StartIceParams* pParams = new StartIceParams(pObserver);
            m_msgq.Send(MSG_START_ICE, pParams);
        }
        else
        {
            StartIce_w(pObserver);
        }
    }
    
    void RtcCenter::DeletePeerConnection(webrtc::PeerConnectionObserver *pObserver,
                                         bool bSyncCall)
    {
        if(false == bSyncCall)
        {
            DeletePeerConnectionParams params(pObserver);
            m_msgq.Send(MSG_DELETE_PEERCONNECTION, &params, true);
        }
        else
        {
            DeletePeerConnection_w(pObserver);
        }
    }
    
    RtcCenter::RtcCenter()
    : m_msgq(this)
    , m_pConnFactory(webrtc::CreatePeerConnectionFactory())
    {
        if(NULL == m_pConnFactory.get())
        {
            FBLOG_INFO_CUSTOM("RtcCenter::RtcCenter()", "Failed to create peerconnection factory");
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
            
            case MSG_RENDER_STREAM:
            {
                RenderStreamParams* pParams = static_cast<RenderStreamParams*>(msg->pdata);
                RenderStream_w(pParams->m_stream, pParams->m_pObserver, pParams->m_pRenderer);
                delete pParams;
                break;
            }
            
            case MSG_NEW_PEERCONNECTION:
            {
                NewPeerConnectionParams* pParams = static_cast<NewPeerConnectionParams*>(msg->pdata);
                pParams->m_bResult = NewPeerConnection_w(pParams->m_iceConfig, pParams->m_pObserver);
                break;
            }
            
            case MSG_ADD_STREAM:
            {
                AddStreamParams* pParams = static_cast<AddStreamParams*>(msg->pdata);
                AddStream_w(pParams->m_pObserver, pParams->m_pStream);
                delete pParams;
                break;
            }
                
            case MSG_REMOVE_STREAM:
            {
                RemoveStreamParams* pParams = static_cast<RemoveStreamParams*>(msg->pdata);
                RemoveStream_w(pParams->m_pObserver, pParams->m_pStream);
                delete pParams;
                break;
            }

            case MSG_CREATE_OFFER:
            {
                CreateOfferParams* pParams = static_cast<CreateOfferParams*>(msg->pdata);
                pParams->m_offerSdp = CreateOffer_w(pParams->m_pObserver, pParams->m_mediaHints);
                break;
            }
            
            case MSG_CREATE_ANSWER:
            {
                CreateAnswerParams* pParams = static_cast<CreateAnswerParams*>(msg->pdata);
                pParams->m_answerSdp = CreateAnswer_w(pParams->m_pObserver,
                                                      pParams->m_mediaHints,
                                                      pParams->m_offerSdp);
                break;
            }
                
            case MSG_SET_LOCAL_SDP:
            {
                SetLocalSdpParams* pParams = static_cast<SetLocalSdpParams*>(msg->pdata);
                SetLocalDescription_w(pParams->m_pObserver,
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
                SetRemoteDescription_w(pParams->m_pObserver, pParams->m_action, pParams->m_sdp);
                delete pParams;
                break;
            }

            case MSG_PROCESS_ICE_MSG:
            {
                ProcessIceMessageParams* pParams = static_cast<ProcessIceMessageParams*>(msg->pdata);
                ProcessIceMessage_w(pParams->m_pObserver, pParams->m_candidateSdp);
                delete pParams;
                break;
            }
                
            case MSG_START_ICE:
            {
                StartIceParams* pParams = static_cast<StartIceParams*>(msg->pdata);
                StartIce_w(pParams->m_pObserver);
                delete pParams;
                break;
            }
                
            case MSG_DELETE_PEERCONNECTION:
            {
                DeletePeerConnectionParams* pParams = static_cast<DeletePeerConnectionParams*>(msg->pdata);
                DeletePeerConnection_w(pParams->m_pObserver);
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
            m_pConnFactory = webrtc::CreatePeerConnectionFactory();
            if(NULL == m_pConnFactory.get())
            {
                FBLOG_ERROR_CUSTOM("RtcCenter::GetUserMedia_w()", "Peerconnection factory is NULL...");
                failCb->InvokeAsync("", FB::variant_list_of("Peerconnection factory NULL"));
                return;
            }
        }
                
        //Create local media stream object
        FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w()", "Creating local media stream interface object...");
        talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> pLocalMedia(
            m_pConnFactory->CreateLocalMediaStream("localmedia")
        );
        
        FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w()", "Creating local media stream js object...");
        FB::JSAPIPtr stream = MediaStream::Create(pLocalMedia);
                
        //If mediaHints.video == true, add video track
        if(true == mediaHints->GetProperty("video").convert_cast<bool>())
        {
            FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w()", "Creating local video track interface object...");
            talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface> pLocalVideo(
                m_pConnFactory->CreateLocalVideoTrack(
                    "localvideo",
                    webrtc::CreateVideoCapturer(
                        LocalVideoTrack::GetDefaultCaptureDevice()
                    )
                )
            );
            
            if(NULL == pLocalVideo.get())
            {
                FBLOG_ERROR_CUSTOM("RtcCenter::GetUserMedia_w()", "Creating local video track interface object FAILED");
                failCb->InvokeAsync("", FB::variant_list_of("Local video track NULL"));
                return;
            }
            
            pLocalMedia->AddTrack(pLocalVideo);
            static_cast<MediaStream*>(stream.get())->AddTrack(LocalVideoTrack::Create(pLocalVideo));
        }
        
        //If mediaHints.audio == true, add audio track
        if(true == mediaHints->GetProperty("audio").convert_cast<bool>())
        {
            FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w()", "Creating local audio track interface object...");
            talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface> pLocalAudio(
                m_pConnFactory->CreateLocalAudioTrack("localaudio", NULL)
            );
            
            if(NULL == pLocalAudio.get())
            {
                FBLOG_ERROR_CUSTOM("RtcCenter::GetUserMedia_w()", "Creating local audio track interface object FAILED");
                failCb->InvokeAsync("", FB::variant_list_of("Local audio track NULL"));
                return;
            }
            
            pLocalMedia->AddTrack(pLocalAudio);
            static_cast<MediaStream*>(stream.get())->AddTrack(LocalAudioTrack::Create(pLocalAudio));
        }
        
        FBLOG_INFO_CUSTOM("RtcCenter::GetUserMedia_w()", "GetUserMedia DONE");
        succCb->InvokeAsync("", FB::variant_list_of(stream));
    }
    
    void RtcCenter::RenderStream_w(FB::JSAPIPtr pStream,
                                   webrtc::PeerConnectionObserver* pObserver,
                                   const talk_base::scoped_refptr<webrtc::VideoRendererWrapperInterface>& pRenderer)
    {
        if(NULL == m_pConnFactory.get())
        {
            //std::cout << "PeerConnection factory NULL..." << std::endl;
            return;
        }
        
        if(NULL != m_pPeerConns[pObserver].get())
        {
            //std::cout << "Rendering already started..." << std::endl;
            return;
        }
        
        m_pPeerConns[pObserver] = m_pConnFactory->CreatePeerConnection("STUN stun.l.google.com:19302", pObserver);
        if(NULL == m_pPeerConns[pObserver].get())
        {
            //std::cout << "PeerConnection create failed..." << std::endl;
            m_pPeerConns.erase(pObserver);
            return;
        }
        
        talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> pLocalStream = static_cast<GoCast::MediaStream*>(pStream.get())->LocalMediaStreamInterface();
        
        pLocalStream->video_tracks()->at(0)->SetRenderer(pRenderer);
        m_pPeerConns[pObserver]->AddStream(pLocalStream);
        m_pPeerConns[pObserver]->SetLocalDescription(webrtc::JsepInterface::kOffer,
                                                     m_pPeerConns[pObserver]->CreateOffer(webrtc::MediaHints()));
    }
    
    bool RtcCenter::NewPeerConnection_w(const std::string& iceConfig, webrtc::PeerConnectionObserver* pObserver)
    {
        if(NULL == m_pConnFactory.get())
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::NewPeerConnection_w()", "PeerConnection factory is NULL");
            return false;
        }
        
        if(m_pPeerConns.end() != m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::NewPeerConnection_w()", "PeerConnection already created");            
            return false;
        }
        
        std::string msg("Creating new PeerConnection with ICEConfig [");
        msg += iceConfig;
        msg += "]...";
        FBLOG_INFO_CUSTOM("RtcCenter::NewPeerConnection_w()", msg);
        
        m_pPeerConns[pObserver] = m_pConnFactory->CreatePeerConnection(iceConfig, pObserver);
        if(NULL == m_pPeerConns[pObserver].get())
        {
            FBLOG_ERROR_CUSTOM("", "Create PeerConnection FAILED");
            m_pPeerConns.erase(pObserver);
            return false;
        }
        
        FBLOG_INFO_CUSTOM("RtcCenter::NewPeerConnection_w()", "Creating new PeerConnection DONE");
        return true;
    }
    
    void RtcCenter::AddStream_w(webrtc::PeerConnectionObserver* pObserver,
                                const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::AddStream_w()", "No PeerConnection found for this plugin instance");
        }
        else
        {
            m_pPeerConns[pObserver]->AddStream(pStream);
        }
    }

    void RtcCenter::RemoveStream_w(webrtc::PeerConnectionObserver* pObserver,
                                   const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::RemoveStream_w()", "No PeerConnection found for this plugin instance");
        }
        else
        {
            m_pPeerConns[pObserver]->RemoveStream(pStream);
        }
    }
    
    std::string RtcCenter::CreateOffer_w(webrtc::PeerConnectionObserver* pObserver,
                                         const webrtc::MediaHints& mediaHints)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::CreateOffer_w()", "No PeerConnection found for this plugin instance");
            return "";
        }
        
        std::string offerSdp("");
        if(false == m_pPeerConns[pObserver]->CreateOffer(mediaHints)->ToString(&offerSdp))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::CreateOffer_w()", "Failed to create offer");
            return "";
        }
        
        std::string msg("Offer = [");
        msg += offerSdp;
        msg += "]";
        FBLOG_INFO_CUSTOM("RtcCenter::CreateOffer_w()", msg);
        
        return offerSdp;
    }

    std::string RtcCenter::CreateAnswer_w(webrtc::PeerConnectionObserver* pObserver,
                                          const webrtc::MediaHints& mediaHints,
                                          const std::string& offerSdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::CreateAnswer_w()", "No PeerConnection found for this plugin instance");
            return "";
        }
        
        std::string answerSdp("");
        webrtc::SessionDescriptionInterface* pOffer = webrtc::CreateSessionDescription(offerSdp);
        if(false == m_pPeerConns[pObserver]->CreateAnswer(mediaHints, pOffer)->ToString(&answerSdp))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::CreateAnswer_w()", "Failed to create answer");
            return "";
        }
        
        std::string msg("Answer = [");
        msg += answerSdp;
        msg += "]";
        FBLOG_INFO_CUSTOM("RtcCenter::CreateAnswer_w()", msg);

        return offerSdp;
    }
    
    void RtcCenter::SetLocalDescription_w(webrtc::PeerConnectionObserver *pObserver,
                                          const webrtc::JsepInterface::Action &action,
                                          const std::string &sdp,
                                          const FB::JSObjectPtr& succCb,
                                          const FB::JSObjectPtr& failCb)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::SetLocalDescription_w()", "No PeerConnection found for this plugin instance");
            failCb->InvokeAsync("", FB::variant_list_of("No peerconnection found for this plugin instance"));
            return;
        }
        
        webrtc::SessionDescriptionInterface* pSdp = webrtc::CreateSessionDescription(sdp);
        if(NULL == pSdp)
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::SetLocalDescription_w()", "Failed to create sdp object");
            failCb->InvokeAsync("", FB::variant_list_of("Failed to create sdp object"));
            return;
        }
        
        if(false == m_pPeerConns[pObserver]->SetLocalDescription(action, pSdp))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::SetLocalDescription_w()", "Failed to set local description");
            failCb->InvokeAsync("", FB::variant_list_of("Failed to set local description"));
            return;
        }
        
        succCb->InvokeAsync("", FB::variant_list_of());
    }

    void RtcCenter::SetRemoteDescription_w(webrtc::PeerConnectionObserver *pObserver,
                                           const webrtc::JsepInterface::Action &action,
                                           const std::string &sdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::SetRemoteDescription_w()", "No PeerConnection found for this plugin instance");
            return;
        }
        
        webrtc::SessionDescriptionInterface* pSdp = webrtc::CreateSessionDescription(sdp);
        if(NULL == pSdp)
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::SetRemoteDescription_w()", "Failed to create sdp object");
            return;
        }
        
        if(false == m_pPeerConns[pObserver]->SetRemoteDescription(action, pSdp))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::SetRemoteDescription_w()", "Failed to set remote description");
            return;                        
        }
    }
    
    void RtcCenter::ProcessIceMessage_w(webrtc::PeerConnectionObserver *pObserver,
                                        const std::string &candidateSdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::ProcessIceMessage_w()", "No PeerConnection found for this plugin instance");
            return;
        }
        
        webrtc::IceCandidateInterface* pCandidate = webrtc::CreateIceCandidate("0", candidateSdp);
        if(NULL == pCandidate)
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::ProcessIceMessage_w()", "Failed to create candidate object");
            return;
        }
        
        if(false == m_pPeerConns[pObserver]->ProcessIceMessage(pCandidate))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::ProcessIceMessage_w()", "Failed to process candidate");
            return;            
        }
    }
    
    void RtcCenter::StartIce_w(webrtc::PeerConnectionObserver *pObserver)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::StartIce_w()", "No PeerConnection found for this plugin instance");
        }

        if(false == m_pPeerConns[pObserver]->StartIce(webrtc::JsepInterface::kUseAll))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::StartIce_w()", "Failed to start ICE process");
        }
    }
    
    void RtcCenter::DeletePeerConnection_w(webrtc::PeerConnectionObserver *pObserver)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            FBLOG_ERROR_CUSTOM("RtcCenter::DeletePeerConnection_w()", "No PeerConnection found for this plugin instance");
            return;
        }
        
        //erase calls destructor of peerconnection
        m_pPeerConns.erase(pObserver);
    }
}
