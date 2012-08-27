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
        
        // Query media devices
        void QueryVideoDevices(FB::VariantMap& devices);
        void QueryAudioDevices(FB::VariantList& devices, bool bInput = true);
        
        //Thread-safe methods        
        void GetUserMedia(FB::JSObjectPtr mediaHints,
                          FB::JSObjectPtr succCb,
                          FB::JSObjectPtr failCb,
                          bool bSyncCall = true);
        bool NewPeerConnection(const std::string& pluginId,
                               const std::string& iceConfig,
                               webrtc::PeerConnectionObserver* pObserver,
                               bool bSyncCall = true);
        bool AddStream(const std::string& pluginId,
                       const std::string& label,
                       bool bSyncCall = true);
        bool RemoveStream(const std::string& pluginId,
                          const std::string& label,
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
        bool SetRemoteDescription(const std::string& pluginId,
                                  const webrtc::JsepInterface::Action& action,
                                  const std::string& sdp,
                                  bool bSyncCall = true);
        bool ProcessIceMessage(const std::string& pluginId,
                               const std::string& candidateSdp,
                               bool bSyncCall = true);
        bool StartIce(const std::string& pluginId,
                      bool bSyncCall = true);
        bool DeletePeerConnection(const std::string& pluginId,
                                  bool bSyncCall = true);
        
    public:
        std::string ReadyState(const std::string& pluginId);
                
        bool Inited() const;
        bool GetLocalVideoTrackEnabled() const;        
        bool GetLocalAudioTrackEnabled() const;
        bool GetSpkVol(int* pLevel) const;
        bool GetSpkMute(bool* pbEnabled) const;
        bool GetMicVol(int* pLevel) const;
        std::string GetLocalVideoTrackEffect() const;
        void SetLocalVideoTrackEnabled(bool bEnable);
        void SetLocalAudioTrackEnabled(bool bEnable);
        bool SetSpkVol(int level);
        bool SetMicVol(int level);
        void SetLocalVideoTrackRenderer(const talk_base::scoped_refptr
                                        <webrtc::VideoRendererWrapperInterface>& pRenderer);
        void SetLocalVideoTrackEffect(const std::string& effect);
        void SetRemoteVideoTrackRenderer(const std::string& pluginId,
                                         const talk_base::scoped_refptr
                                         <webrtc::VideoRendererWrapperInterface>& pRenderer);
        void AddRemoteStream(const std::string& pluginId,
                             const talk_base::scoped_refptr<webrtc::MediaStreamInterface>& pStream);
        void RemoveRemoteStream(const std::string& pluginId);

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
        bool AddStream_w(const std::string& pluginId,
                         const std::string& label);
        bool RemoveStream_w(const std::string& pluginId,
                            const std::string& label);
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
        bool SetRemoteDescription_w(const std::string& pluginId,
                                    const webrtc::JsepInterface::Action& action,
                                    const std::string& sdp);
        bool ProcessIceMessage_w(const std::string& pluginId,
                                 const std::string& candidateSdp);
        bool StartIce_w(const std::string& pluginId);
        bool DeletePeerConnection_w(const std::string& pluginId);
        
    private:
        MessageQueue m_msgq;
        std::map< std::string,
                  talk_base::scoped_refptr<webrtc::PeerConnectionInterface> > m_pPeerConns;
        std::map< std::string,
                  talk_base::scoped_refptr<webrtc::MediaStreamInterface> > m_remoteStreams;
        talk_base::scoped_refptr<webrtc::PeerConnectionFactoryInterface> m_pConnFactory;
        talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> m_pLocalStream;        
    };
}

#endif
