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
#include <iostream>

#define FBLOG_INFO_CUSTOM(func, msg) FBLOG_INFO(func, msg)
#define FBLOG_ERROR_CUSTOM(func, msg) FBLOG_ERROR(func, msg)

//std::cout << func << " [INFO]: " << msg << std::endl
//std::cout << func << " [ERROR]: " << msg << std::endl

std::string funcstr(const std::string& func, const std::string& pluginId);

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
        
        //Thread-safe methods
        void GetUserMedia(FB::JSObjectPtr mediaHints,
                          FB::JSObjectPtr succCb,
                          FB::JSObjectPtr failCb,
                          bool bSyncCall = false);
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
        
        bool Inited() const {
            return static_cast<bool>(NULL != m_pConnFactory.get());
        }
        
        bool GetLocalVideoTrackEnabled() const {
            if(0 < m_pLocalStream->video_tracks()->count()) {
                return m_pLocalStream->video_tracks()->at(0)->enabled(); 
            }
            return false;
        }
        
        bool GetLocalAudioTrackEnabled() const {
            if(0 < m_pLocalStream->audio_tracks()->count()) {
                return m_pLocalStream->audio_tracks()->at(0)->enabled();
            }
            return false;
        }
        
        std::string GetLocalVideoTrackEffect() const {
            if(0 < m_pLocalStream->video_tracks()->count()){
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
        
        void SetLocalVideoTrackEnabled(bool bEnable) {
            if(0 < m_pLocalStream->video_tracks()->count()) {
                m_pLocalStream->video_tracks()->at(0)->set_enabled(bEnable);
            }
        }
        
        void SetLocalAudioTrackEnabled(bool bEnable) {
            if(0 < m_pLocalStream->audio_tracks()->count()) {
                m_pLocalStream->audio_tracks()->at(0)->set_enabled(bEnable);
            }
        }
        
        void SetLocalVideoTrackRenderer(const talk_base::scoped_refptr
                                        <webrtc::VideoRendererWrapperInterface>& pRenderer) {
            if(0 < m_pLocalStream->video_tracks()->count()){
                m_pLocalStream->video_tracks()->at(0)->SetRenderer(pRenderer);
            }
        }
        
        void SetLocalVideoTrackEffect(const std::string& effect) {
            if(0 < m_pLocalStream->video_tracks()->count()){
                talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface> pTrack(
                    static_cast<webrtc::LocalVideoTrackInterface*>(m_pLocalStream->video_tracks()->at(0))
                );
                
                if(NULL != pTrack.get())
                {
                    pTrack->GetVideoCapture()->SetEffect(effect);
                }
            }            
        }
        
        void SetRemoteVideoTrackRenderer(const std::string& pluginId,
                                         const talk_base::scoped_refptr
                                         <webrtc::VideoRendererWrapperInterface>& pRenderer) {
            if(0 < m_remoteStreams[pluginId]->video_tracks()->count()){
                m_remoteStreams[pluginId]->video_tracks()->at(0)->SetRenderer(pRenderer);
            }
        }
        
        void AddRemoteStream(const std::string& pluginId,
                             const talk_base::scoped_refptr<webrtc::MediaStreamInterface>& pStream) {
                m_remoteStreams[pluginId] = pStream;
        }
        
        void RemoveRemoteStream(const std::string& pluginId) {
            if(m_remoteStreams.end() != m_remoteStreams.find(pluginId)) {
                m_remoteStreams.erase(pluginId);
            }
        }
        
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
