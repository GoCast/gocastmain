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
        void Start();
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
                          FB::JSObjectPtr failCb,
                          bool bSyncCall = false);
        bool NewPeerConnection(const std::string& pluginId,
                               const std::string& iceConfig,
                               webrtc::PeerConnectionObserver* pObserver,
                               bool bSyncCall = true);
        void AddStream(const std::string& pluginId,
                       const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream,
                       bool bSyncCall = true);
        void RemoveStream(const std::string& pluginId,
                          const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream,
                          bool bSyncCall = true);
        std::string CreateOffer(const std::string& pluginId,
                                const webrtc::MediaHints& mediaHints,
                                bool bSyncCall = true);
        std::string CreateAnswer(const std::string& pluginId,
                                 const webrtc::MediaHints& mediaHints,
                                 const std::string& offerSdp,
                                 bool bSyncCall = true);
        void SetLocalDescription(const std::string& pluginId,
                                 const webrtc::JsepInterface::Action& action,
                                 const std::string& sdp,
                                 const FB::JSObjectPtr& succCb,
                                 const FB::JSObjectPtr& failCb,
                                 bool bSyncCall = true);
        void SetRemoteDescription(const std::string& pluginId,
                                  const webrtc::JsepInterface::Action& action,
                                  const std::string& sdp,
                                  bool bSyncCall = true);
        void ProcessIceMessage(const std::string& pluginId,
                               const std::string& candidateSdp,
                               bool bSyncCall = true);
        void StartIce(const std::string& pluginId,
                      bool bSyncCall = true);
        void DeletePeerConnection(const std::string& pluginId,
                                  bool bSyncCall = true);
        
    private:
        RtcCenter();
        virtual ~RtcCenter();
                
        //talk_base::MessageHandler implementation
        void OnMessage(talk_base::Message* pMsg);
        
        //Methods that correspond to thread-safe methods
        void GetUserMedia_w(FB::JSObjectPtr mediaHints,
                            FB::JSObjectPtr succCb,
                            FB::JSObjectPtr failCb);
        bool NewPeerConnection_w(const std::string& pluginId,
                                 const std::string& iceConfig,
                                 webrtc::PeerConnectionObserver* pObserver);
        void AddStream_w(const std::string& pluginId,
                         const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        void RemoveStream_w(const std::string& pluginId,
                            const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        std::string CreateOffer_w(const std::string& pluginId,
                                  const webrtc::MediaHints& mediaHints);
        std::string CreateAnswer_w(const std::string& pluginId,
                                   const webrtc::MediaHints& mediaHints,
                                   const std::string& offerSdp);
        void SetLocalDescription_w(const std::string& pluginId,
                                   const webrtc::JsepInterface::Action& action,
                                   const std::string& sdp,
                                   const FB::JSObjectPtr& succCb,
                                   const FB::JSObjectPtr& failCb);
        void SetRemoteDescription_w(const std::string& pluginId,
                                    const webrtc::JsepInterface::Action& action,
                                    const std::string& sdp);
        void ProcessIceMessage_w(const std::string& pluginId,
                                 const std::string& candidateSdp);
        void StartIce_w(const std::string& pluginId);
        void DeletePeerConnection_w(const std::string& pluginId);
        
    private:
        MessageQueue m_msgq;
        std::map< std::string,
                  talk_base::scoped_refptr<webrtc::PeerConnectionInterface> > m_pPeerConns;
        talk_base::scoped_refptr<webrtc::PeerConnectionFactoryInterface> m_pConnFactory;
    };
}

#endif
