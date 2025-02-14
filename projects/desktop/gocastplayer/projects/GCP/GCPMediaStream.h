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

#define LOG_TO_JS(func, msg, debug) {\
std::string logEntry = (debug) ? "[INFO] <--> " : "[ERROR] <--> ";\
logEntry += func;\
logEntry += "(): ";\
logEntry += msg;\
GoCast::JSLogger::Instance()->LogEntry(logEntry);\
}

#define FBLOG_INFO_CUSTOM(func, msg) {\
FBLOG_INFO(func, msg);\
LOG_TO_JS(func, msg, true);\
}

#define FBLOG_ERROR_CUSTOM(func, msg) {\
FBLOG_ERROR(func, msg);\
LOG_TO_JS(func, msg, false);\
}

namespace GoCast
{
    class JSLogger
    {
    public:
        static JSLogger* Instance(bool bDelete = false);
        void LogEntry(const std::string& entry);
        void LogFunction(const FB::JSObjectPtr& func);
        void ClearLogFunction();
        FB::VariantList LogEntries();
        
    private:
        JSLogger();
        ~JSLogger();
        
    private:
        boost::mutex m_mutex;
        FB::JSObjectPtr m_logCb;
        FB::VariantList m_logEntries;
    };
    
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
        FB::variant get_enabled() const;
        
        //Javascript property set methods
        void set_enabled(FB::variant newVal);
        
    protected:
        FB::variant m_enabled;
    };
    
    class LocalVideoTrack : public LocalMediaStreamTrack
    {
    public:
        typedef std::map< std::string,
                          talk_base::scoped_refptr<webrtc::VideoCaptureModule> > VideoDeviceList;
        
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface>& pTrack);
        static FB::VariantMap GetVideoDevices();
        static talk_base::scoped_refptr<webrtc::VideoCaptureModule>
            GetCaptureDevice(const std::string& uniqueId);
        explicit LocalVideoTrack(const talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface>& pTrack);
        ~LocalVideoTrack() { }
        
        //Javascript get property methods
        FB::variant get_effect() const;
        
        //Javascript set property methods
        void set_effect(FB::variant effect);
        
    protected:
        static VideoDeviceList videoDevices;
    };
    
    class LocalAudioTrack : public LocalMediaStreamTrack
    {
    public:
        typedef std::map<std::string, std::string> AudioDeviceList;
        
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface>& pTrack);
        explicit LocalAudioTrack(const talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface>& pTrack);
        ~LocalAudioTrack() { }
    };
    
    class RemoteVideoTrack : public MediaStreamTrack
    {
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::VideoTrackInterface>& pTrack);
        explicit RemoteVideoTrack(const talk_base::scoped_refptr<webrtc::VideoTrackInterface>& pTrack);
        ~RemoteVideoTrack() { }
    };
    
    class RemoteAudioTrack : public MediaStreamTrack
    {
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::AudioTrackInterface>& pTrack);
        explicit RemoteAudioTrack(const talk_base::scoped_refptr<webrtc::AudioTrackInterface>& pTrack);
        ~RemoteAudioTrack() { }
    };
    
    class LocalMediaStream : public FB::JSAPIAuto
    {
    public:
        static FB::JSAPIPtr Create(talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        explicit LocalMediaStream(const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream);
        ~LocalMediaStream() { }
        
        //Javascript get property methods
        FB::variant get_label() const { return m_label; }
        FB::VariantList get_videoTracks() const { return m_videoTracks; }
        FB::VariantList get_audioTracks() const { return m_audioTracks; }
        
        //Public methods
        void AddTrack(FB::JSAPIPtr pTrack);
        
    private:
        FB::variant m_label;
        FB::VariantList m_videoTracks;
        FB::VariantList m_audioTracks;
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
        void AddTrack(FB::JSAPIPtr pTrack);
        
    private:
        FB::variant m_label;
        FB::VariantList m_videoTracks;
        FB::VariantList m_audioTracks;
    };    
}

#endif