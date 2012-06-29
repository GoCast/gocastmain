//
//  GCPWebrtcCenter.cpp
//  FireBreath
//
//  Created by Manjesh Malavalli on 6/25/12.
//  Copyright (c) 2012 XVDTH. All rights reserved.
//

#include <iostream>

#include "GCPWebrtcCenter.h"
#include "GCPMediaStream.h"
#include "variant_list.h"

namespace GoCast
{    
    enum
    {
        MSG_QUIT = 1,
        MSG_GET_USER_MEDIA,
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
    
    void MessageQueue::Send(int msgType, talk_base::MessageData *pArgs)
    {
        boost::mutex::scoped_lock lock(m_mutex);
        talk_base::Message* pMsg = new talk_base::Message();
        
        pMsg->message_id = msgType;
        pMsg->pdata = pArgs;
        m_messages.push_back(pMsg);
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
    
    void RtcCenter::GetUserMedia(FB::JSObjectPtr mediaHints,
                                 FB::JSObjectPtr succCb,
                                 FB::JSObjectPtr failCb)
    {
        std::cout << "RtcCenter::GetUserMedia" << std::endl;
        GetUserMediaParams* pParams = new GetUserMediaParams(mediaHints, succCb, failCb);
        m_msgq.Send(MSG_GET_USER_MEDIA, pParams);
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
        std::cout << "RtcCenter::GetUserMedia_w" << std::endl;
        if(NULL == m_pConnFactory.get())
        {
            m_pConnFactory = webrtc::CreatePeerConnectionFactory();
            if(NULL == m_pConnFactory.get())
            {
                failCb->InvokeAsync("", FB::variant_list_of("Peerconnection factory NULL"));
                return;
            }
        }
        
        std::cout << "1" << std::endl;
        
        //Create local media stream object
        talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> pLocalMedia(
            m_pConnFactory->CreateLocalMediaStream("localmedia")
        );
        
        std::cout << "1.25" << std::endl;
        
        FB::JSAPIPtr stream = MediaStream::Create(pLocalMedia);
        
        std::cout << "1.5" << std::endl;
        
        //If mediaHints.video == true, add video track
        if(true == mediaHints->GetProperty("video").convert_cast<bool>())
        {
            std::cout << "2" << std::endl;
            
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
            std::cout << "3" << std::endl;
            
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
        
        std::cout << "RtcCenter::GetUserMedia_w success..." << std::endl;
        
        succCb->InvokeAsync("", FB::variant_list_of(stream));
    }
}
