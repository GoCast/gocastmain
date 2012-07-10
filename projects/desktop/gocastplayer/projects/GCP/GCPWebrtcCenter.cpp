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
                          const std::string& sdp)
        : m_bResult(false)
        , m_pObserver(pObserver)
        , m_action(action)
        , m_sdp(sdp)
        {
            
        }
        
        bool m_bResult;
        webrtc::PeerConnectionObserver* m_pObserver;
        webrtc::JsepInterface::Action m_action;
        std::string m_sdp;
    };
    
    struct SetRemoteSdpParams : public talk_base::MessageData
    {
        SetRemoteSdpParams(webrtc::PeerConnectionObserver* pObserver,
                           const webrtc::JsepInterface::Action& action,
                           const std::string& sdp)
        : m_bResult(false)
        , m_pObserver(pObserver)
        , m_sdp(sdp)
        {
            
        }
        
        bool m_bResult;
        webrtc::PeerConnectionObserver* m_pObserver;
        webrtc::JsepInterface::Action m_action;
        std::string m_sdp;
    };
    
    struct ProcessIceMessageParams : public talk_base::MessageData
    {
        ProcessIceMessageParams(webrtc::PeerConnectionObserver* pObserver,
                                const std::string& candidateSdp)
        : m_bResult(false)
        , m_pObserver(pObserver)
        , m_candidateSdp(candidateSdp)
        {
            
        }
        
        bool m_bResult;
        webrtc::PeerConnectionObserver* m_pObserver;
        std::string m_candidateSdp;
    };
    
    struct StartIceParams : public talk_base::MessageData
    {
        StartIceParams(webrtc::PeerConnectionObserver* pObserver)
        : m_bResult(false)
        , m_pObserver(pObserver)
        {
            
        }
        
        bool m_bResult;
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
        
    }
    
    MessageQueue::~MessageQueue()
    {
        Send(MSG_QUIT, NULL);
        m_thread.join();
    }
    
    void MessageQueue::Send(int msgType, talk_base::MessageData *pArgs, bool bWait)
    {
        boost::mutex::scoped_lock lock(m_mutex);
        talk_base::Message* pMsg = new talk_base::Message();
        
        pMsg->message_id = msgType;
        pMsg->pdata = pArgs;
        m_messages.push_back(pMsg);
        
        if(true == bWait)
        {
            m_done.wait(m_mutex);
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
        talk_base::Thread::Current()->set_socketserver(this);
        talk_base::Thread::Current()->Run();
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
            m_pHandler->OnMessage(pMsg);
            
            if(MSG_NEW_PEERCONNECTION == pMsg->message_id ||
               MSG_CREATE_OFFER == pMsg->message_id ||
               MSG_CREATE_ANSWER == pMsg->message_id ||
               MSG_SET_LOCAL_SDP == pMsg->message_id ||
               MSG_SET_REMOTE_SDP == pMsg->message_id ||
               MSG_PROCESS_ICE_MSG == pMsg->message_id ||
               MSG_START_ICE == pMsg->message_id||
               MSG_DELETE_PEERCONNECTION == pMsg->message_id)
            {
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
                                 FB::JSObjectPtr failCb)
    {
        GetUserMediaParams* pParams = new GetUserMediaParams(mediaHints, succCb, failCb);
        m_msgq.Send(MSG_GET_USER_MEDIA, pParams);
    }
    
    void RtcCenter::RenderStream(FB::JSAPIPtr pStream,
                                 webrtc::PeerConnectionObserver* pObserver,
                                 const talk_base::scoped_refptr<webrtc::VideoRendererWrapperInterface>& pRenderer)
    {
        RenderStreamParams* pParams = new RenderStreamParams(pStream, pObserver, pRenderer);
        m_msgq.Send(MSG_RENDER_STREAM, pParams);
    }
    
    bool RtcCenter::NewPeerConnection(const std::string& iceConfig, webrtc::PeerConnectionObserver* pObserver)
    {
        NewPeerConnectionParams params(iceConfig, pObserver);
        m_msgq.Send(MSG_NEW_PEERCONNECTION, &params, true);
        return params.m_bResult;
    }
    
    void RtcCenter::AddStream(webrtc::PeerConnectionObserver* pObserver,
                              const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> &pStream)
    {
        AddStreamParams* pParams = new AddStreamParams(pObserver, pStream);
        m_msgq.Send(MSG_ADD_STREAM, pParams);
    }
    
    void RtcCenter::RemoveStream(webrtc::PeerConnectionObserver* pObserver,
                                 const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> &pStream)
    {
        RemoveStreamParams* pParams = new RemoveStreamParams(pObserver, pStream);
        m_msgq.Send(MSG_REMOVE_STREAM, pParams);
    }

    std::string RtcCenter::CreateOffer(webrtc::PeerConnectionObserver* pObserver,
                                       const webrtc::MediaHints& mediaHints)
    {
        CreateOfferParams params(pObserver, mediaHints);
        m_msgq.Send(MSG_CREATE_OFFER, &params, true);
        return params.m_offerSdp;
    }
    
    std::string RtcCenter::CreateAnswer(webrtc::PeerConnectionObserver* pObserver,
                                        const webrtc::MediaHints& mediaHints,
                                        const std::string& offerSdp)
    {
        CreateAnswerParams params(pObserver, mediaHints, offerSdp);
        m_msgq.Send(MSG_CREATE_ANSWER, &params, true);
        return params.m_answerSdp;
    }
    
    bool RtcCenter::SetLocalDescription(webrtc::PeerConnectionObserver* pObserver,
                                        const webrtc::JsepInterface::Action& action,
                                        const std::string& sdp)
    {
        SetLocalSdpParams params(pObserver, action, sdp);
        m_msgq.Send(MSG_SET_LOCAL_SDP, &params, true);
        return params.m_bResult;
    }
    
    bool RtcCenter::SetRemoteDescription(webrtc::PeerConnectionObserver *pObserver,
                                         const webrtc::JsepInterface::Action &action,
                                         const std::string &sdp)
    {
        SetRemoteSdpParams params(pObserver, action, sdp);
        m_msgq.Send(MSG_SET_REMOTE_SDP, &params, true);
        return params.m_bResult;
    }
    
    bool RtcCenter::ProcessIceMessage(webrtc::PeerConnectionObserver *pObserver,
                                      const std::string &candidateSdp)
    {
        ProcessIceMessageParams params(pObserver, candidateSdp);
        m_msgq.Send(MSG_PROCESS_ICE_MSG, &params, true);
        return params.m_bResult;
    }
    
    bool RtcCenter::StartIce(webrtc::PeerConnectionObserver* pObserver)
    {
        StartIceParams params(pObserver);
        m_msgq.Send(MSG_START_ICE, &params, true);
        return params.m_bResult;
    }
    
    void RtcCenter::DeletePeerConnection(webrtc::PeerConnectionObserver *pObserver)
    {
        DeletePeerConnectionParams params(pObserver);
        m_msgq.Send(MSG_DELETE_PEERCONNECTION, &params, true);
    }
    
    RtcCenter::RtcCenter()
    : m_msgq(this)
    , m_pConnFactory(NULL)
    {

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
                pParams->m_bResult = SetLocalDescription_w(pParams->m_pObserver,
                                                           pParams->m_action,
                                                           pParams->m_sdp);
                break;
            }
                
            case MSG_PROCESS_ICE_MSG:
            {
                ProcessIceMessageParams* pParams = static_cast<ProcessIceMessageParams*>(msg->pdata);
                pParams->m_bResult = ProcessIceMessage_w(pParams->m_pObserver, pParams->m_candidateSdp);
                break;
            }
                
            case MSG_START_ICE:
            {
                StartIceParams* pParams = static_cast<StartIceParams*>(msg->pdata);
                pParams->m_bResult = StartIce_w(pParams->m_pObserver);
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
                failCb->InvokeAsync("", FB::variant_list_of("Peerconnection factory NULL"));
                return;
            }
        }
                
        //Create local media stream object
        talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> pLocalMedia(
            m_pConnFactory->CreateLocalMediaStream("localmedia")
        );
                
        FB::JSAPIPtr stream = MediaStream::Create(pLocalMedia);
                
        //If mediaHints.video == true, add video track
        if(true == mediaHints->GetProperty("video").convert_cast<bool>())
        {            
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
                failCb->InvokeAsync("", FB::variant_list_of("Local video track NULL"));
                return;
            }
            
            pLocalMedia->AddTrack(pLocalVideo);
            static_cast<MediaStream*>(stream.get())->AddTrack(LocalVideoTrack::Create(pLocalVideo));
        }
        
        //If mediaHints.audio == true, add audio track
        if(true == mediaHints->GetProperty("audio").convert_cast<bool>())
        {            
            talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface> pLocalAudio(
                m_pConnFactory->CreateLocalAudioTrack("localaudio", NULL)
            );
            
            if(NULL == pLocalAudio.get())
            {
                failCb->InvokeAsync("", FB::variant_list_of("Local audio track NULL"));
                return;
            }
            
            pLocalMedia->AddTrack(pLocalAudio);
            static_cast<MediaStream*>(stream.get())->AddTrack(LocalAudioTrack::Create(pLocalAudio));
        }
                
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
            //std::cout << "NewPeerConnection(): Factory NULL" << std::endl;
            return false;
        }
        
        if(m_pPeerConns.end() != m_pPeerConns.find(pObserver))
        {
            //std::cout << "NewPeerConnection(): Already created" << std::endl;
            return false;
        }
        
        m_pPeerConns[pObserver] = m_pConnFactory->CreatePeerConnection(iceConfig, pObserver);
        if(NULL == m_pPeerConns[pObserver].get())
        {
            //std::cout << "NewPeerConnection(): Create failed" << std::endl;
            m_pPeerConns.erase(pObserver);
            return false;
        }
        
        return true;
    }
    
    void RtcCenter::AddStream_w(webrtc::PeerConnectionObserver* pObserver,
                                const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            //std::cout << "AddStream(): PeerConn not found for this plugin instance" << std::endl;
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
            //std::cout << "RemoveStream(): PeerConn not found for this plugin instance" << std::endl;
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
            //std::cout << "CreateOffer(): PeerConn not found for this plugin instance" << std::endl;
            return "";
        }
        
        std::string offerSdp("");
        if(false == m_pPeerConns[pObserver]->CreateOffer(mediaHints)->ToString(&offerSdp))
        {
            //std::cout << "CreateOffer(): failed to create offer" << std::endl;
            return "";
        }
        
        return offerSdp;
    }

    std::string RtcCenter::CreateAnswer_w(webrtc::PeerConnectionObserver* pObserver,
                                          const webrtc::MediaHints& mediaHints,
                                          const std::string& offerSdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            //std::cout << "CreateAnswer(): PeerConn not found for this plugin instance" << std::endl;
            return "";
        }
        
        std::string answerSdp("");
        webrtc::SessionDescriptionInterface* pOffer = webrtc::CreateSessionDescription(offerSdp);
        if(false == m_pPeerConns[pObserver]->CreateAnswer(mediaHints, pOffer)->ToString(&answerSdp))
        {
            //std::cout << "CreateAnswer(): failed to create answer" << std::endl;
            return "";
        }
        
        return offerSdp;
    }
    
    bool RtcCenter::SetLocalDescription_w(webrtc::PeerConnectionObserver *pObserver,
                                          const webrtc::JsepInterface::Action &action,
                                          const std::string &sdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            //std::cout << "SetLocalDescription(): PeerConn not found for this plugin instance" << std::endl;
            return false;
        }
        
        webrtc::SessionDescriptionInterface* pSdp = webrtc::CreateSessionDescription(sdp);
        if(NULL == pSdp)
        {
            //std::cout << "SetLocalDescription(): Failed to create sdp object" << std::endl;
            return false;
        }
        
        return m_pPeerConns[pObserver]->SetLocalDescription(action, pSdp);
    }

    bool RtcCenter::SetRemoteDescription_w(webrtc::PeerConnectionObserver *pObserver,
                                           const webrtc::JsepInterface::Action &action,
                                           const std::string &sdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            //std::cout << "SetRemoteDescription(): PeerConn not found for this plugin instance" << std::endl;
            return false;
        }
        
        webrtc::SessionDescriptionInterface* pSdp = webrtc::CreateSessionDescription(sdp);
        if(NULL == pSdp)
        {
            //std::cout << "SetRemoteDescription(): Failed to create sdp object" << std::endl;
            return false;
        }
        
        return m_pPeerConns[pObserver]->SetRemoteDescription(action, pSdp);
    }
    
    bool RtcCenter::ProcessIceMessage_w(webrtc::PeerConnectionObserver *pObserver,
                                        const std::string &candidateSdp)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            //std::cout << "ProcessIceMessage(): PeerConn not found for this plugin instance" << std::endl;
            return false;
        }
        
        webrtc::IceCandidateInterface* pCandidate = webrtc::CreateIceCandidate("0", candidateSdp);
        if(NULL == pCandidate)
        {
            //std::cout << "ProcessIceMessage(): Failed to create candidate object" << std::endl;
            return false;
        }
        
        return m_pPeerConns[pObserver]->ProcessIceMessage(pCandidate);
    }
    
    bool RtcCenter::StartIce_w(webrtc::PeerConnectionObserver *pObserver)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            //std::cout << "StartIce(): PeerConn not found for this plugin instance" << std::endl;
            return false;
        }

        return m_pPeerConns[pObserver]->StartIce(webrtc::JsepInterface::kUseAll);
    }
    
    void RtcCenter::DeletePeerConnection_w(webrtc::PeerConnectionObserver *pObserver)
    {
        if(m_pPeerConns.end() == m_pPeerConns.find(pObserver))
        {
            //std::cout << "DeletePeerConnection(): PeerConn not found for this plugin instance" << std::endl;
            return;
        }
        
        //erase calls destructor of peerconnection
        m_pPeerConns.erase(pObserver);
    }
}
