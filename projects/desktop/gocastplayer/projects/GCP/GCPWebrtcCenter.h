//
//  GCPWebrtcCenter.h
//  FireBreath
//
//  Created by Manjesh Malavalli on 6/25/12.
//  Copyright (c) 2012 XVDTH. All rights reserved.
//

#ifndef FireBreath_GCPWebrtcCenter_h
#define FireBreath_GCPWebrtcCenter_h

#include <deque>
#include <map>

#include <boost/thread.hpp>
#include <boost/thread/condition.hpp>
#include "talk/app/webrtc/peerconnection.h"
#include "talk/base/physicalsocketserver.h"
#include "talk/base/scoped_ptr.h"
#include "talk/base/thread.h"
#include "JSAPIAuto.h"

namespace GoCast
{
    class MessageHandler
    {
    public:
        virtual void OnMessage(talk_base::Message* pMsg) = 0;
    };
    
    class MessageQueue : public talk_base::PhysicalSocketServer
    {
    public:
        MessageQueue(MessageHandler* m_pHandler);
        virtual ~MessageQueue();
        
        //Public methods
        void Send(int msgType, talk_base::MessageData* pArgs, bool bWait = false);
        
        //Override PhysicalSocketServer's Wait()
        virtual bool Wait(int cms, bool bProcessIO);
        
        //Worker function
        void WorkerFunction();
    
    private:
        //Private methods
        talk_base::Message* Recv();
        void ProcessMessage();
        
    private:
        MessageHandler* m_pHandler;
        boost::mutex m_mutex;
        boost::thread m_thread;
        boost::condition m_done;
        std::deque<talk_base::Message*> m_messages;
    };
    
    class RtcCenter : public MessageHandler
    {
    public:
        static RtcCenter* Instance(bool bDelete = false);
        const talk_base::scoped_refptr<webrtc::PeerConnectionFactoryInterface>& PeerConnFactory() const;
        
        //Thread-safe methods
        void GetUserMedia(FB::JSObjectPtr mediaHints,
                          FB::JSObjectPtr succCb,
                          FB::JSObjectPtr failCb);
        void RenderStream(FB::JSAPIPtr pStream,
                          webrtc::PeerConnectionObserver* pObserver,
                          const talk_base::scoped_refptr<webrtc::VideoRendererWrapperInterface>& pRenderer);
        bool NewPeerConnection(const std::string& iceConfig, webrtc::PeerConnectionObserver* pObserver);
        void AddStream(webrtc::PeerConnectionObserver* pObserver,
                       const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        void RemoveStream(webrtc::PeerConnectionObserver* pObserver,
                          const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        std::string CreateOffer(webrtc::PeerConnectionObserver* pObserver,
                                const webrtc::MediaHints& mediaHints);
        std::string CreateAnswer(webrtc::PeerConnectionObserver* pObserver,
                                 const webrtc::MediaHints& mediaHints,
                                 const std::string& offerSdp);
        bool SetLocalDescription(webrtc::PeerConnectionObserver* pObserver,
                                 const webrtc::JsepInterface::Action& action,
                                 const std::string& sdp);
        bool SetRemoteDescription(webrtc::PeerConnectionObserver* pObserver,
                                  const webrtc::JsepInterface::Action& action,
                                  const std::string& sdp);
        bool ProcessIceMessage(webrtc::PeerConnectionObserver* pObserver,
                               const std::string& candidateSdp);
        bool StartIce(webrtc::PeerConnectionObserver* pObserver);
        void DeletePeerConnection(webrtc::PeerConnectionObserver* pObserver);
        
    private:
        RtcCenter();
        virtual ~RtcCenter();
                
        //talk_base::MessageHandler implementation
        void OnMessage(talk_base::Message* pMsg);
        
        //Methods that correspond to thread-safe methods
        void GetUserMedia_w(FB::JSObjectPtr mediaHints,
                            FB::JSObjectPtr succCb,
                            FB::JSObjectPtr failCb);
        void RenderStream_w(FB::JSAPIPtr pStream,
                            webrtc::PeerConnectionObserver* pObserver,
                            const talk_base::scoped_refptr<webrtc::VideoRendererWrapperInterface>& pRenderer);
        bool NewPeerConnection_w(const std::string& iceConfig, webrtc::PeerConnectionObserver* pObserver);
        void AddStream_w(webrtc::PeerConnectionObserver* pObserver,
                         const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        void RemoveStream_w(webrtc::PeerConnectionObserver* pObserver,
                          const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        std::string CreateOffer_w(webrtc::PeerConnectionObserver* pObserver,
                                  const webrtc::MediaHints& mediaHints);
        std::string CreateAnswer_w(webrtc::PeerConnectionObserver* pObserver,
                                   const webrtc::MediaHints& mediaHints,
                                   const std::string& offerSdp);
        bool SetLocalDescription_w(webrtc::PeerConnectionObserver* pObserver,
                                   const webrtc::JsepInterface::Action& action,
                                   const std::string& sdp);
        bool SetRemoteDescription_w(webrtc::PeerConnectionObserver* pObserver,
                                    const webrtc::JsepInterface::Action& action,
                                    const std::string& sdp);
        bool ProcessIceMessage_w(webrtc::PeerConnectionObserver* pObserver,
                                 const std::string& candidateSdp);
        bool StartIce_w(webrtc::PeerConnectionObserver* pObserver);
        void DeletePeerConnection_w(webrtc::PeerConnectionObserver* pObserver);
        
    private:
        MessageQueue m_msgq;
        std::map< webrtc::PeerConnectionObserver*,
                  talk_base::scoped_refptr<webrtc::PeerConnectionInterface> > m_pPeerConns;
        talk_base::scoped_refptr<webrtc::PeerConnectionFactoryInterface> m_pConnFactory;
    };
}

#endif
