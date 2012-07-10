//
//  GCPMediaStream.h
//  FireBreath
//
//  Created by Manjesh Malavalli on 6/26/12.
//  Copyright (c) 2012 XVDTH. All rights reserved.
//

#ifndef FireBreath_GCPMediaStreamCenter_h
#define FireBreath_GCPMediaStreamCenter_h

#include <map>

#include "modules/video_capture/main/interface/video_capture_factory.h"
#include "talk/app/webrtc/mediastreaminterface.h"
#include "talk/base/scoped_ptr.h"
#include "JSAPIAuto.h"

namespace GoCast
{
    class MediaStreamTrack : public FB::JSAPIAuto
    {
    public:
        static FB::JSAPIPtr Create(const std::string& kind,
                                   const std::string label);
        explicit MediaStreamTrack(const std::string& kind,
                                  const std::string& label);
        virtual ~MediaStreamTrack() { }
        
        //Javascript property get methods
        FB::variant get_kind() const { return m_kind; }
        FB::variant get_label() const { return m_label; }

    protected:
        FB::variant m_kind;
        FB::variant m_label;
    };
    
    class LocalMediaStreamTrack : public MediaStreamTrack
    {
    public:
        static FB::JSAPIPtr Create(const std::string& kind,
                                   const std::string label,
                                   const bool enabled);
        explicit LocalMediaStreamTrack(const std::string& kind,
                                       const std::string& label,
                                       const bool enabled);
        virtual ~LocalMediaStreamTrack() { };
        
        //Javascript property get methods
        FB::variant get_enabled() const { return m_enabled; }
        
        //Javascript property set methods
        void set_enabled(FB::variant newVal) { m_enabled = newVal; }
        
    protected:
        FB::variant m_enabled;
    };
    
    class LocalVideoTrack : public LocalMediaStreamTrack
    {
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface>& pTrack);
        static talk_base::scoped_refptr<webrtc::VideoCaptureModule> GetDefaultCaptureDevice();
        explicit LocalVideoTrack(const talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface>& pTrack);
        ~LocalVideoTrack() { }
        
    private:
        talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface> m_pTrack;
    };
    
    class LocalAudioTrack : public LocalMediaStreamTrack
    {
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface>& pTrack);
        explicit LocalAudioTrack(const talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface>& pTrack);
        ~LocalAudioTrack() { }
        
    private:
        talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface> m_pTrack;
    };
    
    class RemoteVideoTrack : public MediaStreamTrack
    {
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::VideoTrackInterface>& pTrack);
        explicit RemoteVideoTrack(const talk_base::scoped_refptr<webrtc::VideoTrackInterface>& pTrack);
        ~RemoteVideoTrack() { }
        
    private:
        talk_base::scoped_refptr<webrtc::VideoTrackInterface> m_pTrack;
    };
    
    class RemoteAudioTrack : public MediaStreamTrack
    {
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::AudioTrackInterface>& pTrack);
        explicit RemoteAudioTrack(const talk_base::scoped_refptr<webrtc::AudioTrackInterface>& pTrack);
        ~RemoteAudioTrack() { }
        
    private:
        talk_base::scoped_refptr<webrtc::AudioTrackInterface> m_pTrack;
    };
    
    class MediaStream : public FB::JSAPIAuto
    {
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        explicit MediaStream(const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        ~MediaStream() { }
        
        //Javascript get property methods
        FB::variant get_label() const { return m_label; }
        FB::VariantList get_videoTracks() const { return m_videoTracks; }
        FB::VariantList get_audioTracks() const { return m_audioTracks; }
        
        //Public methods
        const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& LocalMediaStreamInterface() const;
        void AddTrack(FB::JSAPIPtr pTrack);
        
    private:
        FB::variant m_label;
        FB::VariantList m_videoTracks;
        FB::VariantList m_audioTracks;
        
    private:
        talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface> m_pStream;
    };
    
    class RemoteMediaStream : public FB::JSAPIAuto
    {
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::MediaStreamInterface>& pStream);
        explicit RemoteMediaStream(const talk_base::scoped_refptr<webrtc::MediaStreamInterface>& pStream);
        ~RemoteMediaStream() { }
        
        //Javascript get property methods
        FB::variant get_label() const { return m_label; }
        FB::VariantList get_videoTracks() const { return m_videoTracks; }
        FB::VariantList get_audioTracks() const { return m_audioTracks; }
        
        //Public methods
        const talk_base::scoped_refptr<webrtc::MediaStreamInterface>& RemoteMediaStreamInterface() const;
        void AddTrack(FB::JSAPIPtr pTrack);
        
    private:
        FB::variant m_label;
        FB::VariantList m_videoTracks;
        FB::VariantList m_audioTracks;
        
    private:
        talk_base::scoped_refptr<webrtc::MediaStreamInterface> m_pStream;
    };
}

#endif