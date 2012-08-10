//
//  GCPMediaStream.cpp
//  FireBreath
//
//  Created by Manjesh Malavalli on 6/26/12.
//  Copyright (c) 2012 XVDTH. All rights reserved.
//

#include "GCPMediaStream.h"
#include "DOM/Window.h"
#include "variant_list.h"

#define FBLOG_INFO_CUSTOM(func, msg) FBLOG_INFO(func, msg)
#define FBLOG_ERROR_CUSTOM(func, msg) FBLOG_ERROR(func, msg)

//std::cout << func << " [INFO]: " << msg << std::endl;
//std::cout << func << " [ERROR]: " << msg << std::endl;

namespace GoCast
{
    FB::JSAPIPtr MediaStreamTrack::Create(const std::string& kind,
                                          const std::string label)
    {
        return boost::make_shared<MediaStreamTrack>(kind, label);
    }
    
    MediaStreamTrack::MediaStreamTrack(const std::string& kind,
                                       const std::string& label)
    : FB::JSAPIAuto("MediaStreamTrack")
    , m_kind(kind)
    , m_label(label)
    {
        registerProperty("kind", make_property(this, &MediaStreamTrack::get_kind));
        registerProperty("label", make_property(this, &MediaStreamTrack::get_label));
    }
    
    FB::JSAPIPtr LocalMediaStreamTrack::Create(const std::string& kind,
                                               const std::string label,
                                               const bool enabled)
    {
        return boost::make_shared<LocalMediaStreamTrack>(kind, label, enabled);
    }
    
    LocalMediaStreamTrack::LocalMediaStreamTrack(const std::string& kind,
                                                 const std::string& label,
                                                 const bool enabled)
    : MediaStreamTrack(kind, label)
    , m_enabled(enabled)
    {
        registerProperty("enabled", make_property(this, &LocalMediaStreamTrack::get_enabled,
                                                        &LocalMediaStreamTrack::set_enabled));
    }
    
    std::map< std::string,
              talk_base::scoped_refptr<webrtc::VideoCaptureModule> > LocalVideoTrack::videoDevices;
    
    FB::JSAPIPtr LocalVideoTrack::Create(talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface>& pTrack)
    {
        return boost::make_shared<LocalVideoTrack>(pTrack);
    }
    
    FB::VariantMap LocalVideoTrack::GetVideoDevices()
    {
        static int deviceCount = 0;
        const size_t kMaxDeviceNameLength = 128;
        const size_t kMaxUniqueIdLength = 256;
        char deviceName[kMaxDeviceNameLength];
        char deviceUniqueId[kMaxUniqueIdLength];
        webrtc::VideoCaptureModule::DeviceInfo* pDevInfo;
        FB::VariantMap devices;
        std::string key;
        std::string val;
        
        pDevInfo = webrtc::VideoCaptureFactory::CreateDeviceInfo(0);
        for(size_t i=0; i<pDevInfo->NumberOfDevices(); i++)
        {
            pDevInfo->GetDeviceName(i, deviceName, kMaxDeviceNameLength,
                                    deviceUniqueId, kMaxUniqueIdLength);
            key = deviceUniqueId;
            val = deviceName;
            devices[key] = val;
            
            if(videoDevices.end() == videoDevices.find(key))
            {
                videoDevices[key] = webrtc::VideoCaptureFactory::Create(deviceCount++, deviceUniqueId);
                
                std::string msg("Capture device [");
                std::stringstream devIdxStr;
                msg += deviceUniqueId;
                msg += "][idx = ";
                devIdxStr << (deviceCount-1);
                msg += (devIdxStr.str() + "]");
                
                if(NULL == videoDevices[key])
                {
                    devices.erase(key);
                    videoDevices.erase(key);
                    msg += " (failed to open)";
                    FBLOG_ERROR_CUSTOM("LocalVideoTrack::GetVideoDevices", msg);                    
                }
                else
                {
                    msg += "...";
                    FBLOG_INFO_CUSTOM("LocalVideoTrack::GetVideoDevices", msg);
                }
            }
            
            if((0 == i) && (videoDevices.end() != videoDevices.find(key)))
            {
                devices["default"] = key;
            }
        }        
        
        std::stringstream offlineDevices;
        for(VideoDeviceList::iterator it = videoDevices.begin();
            it != videoDevices.end(); it++)
        {
            if(devices.end() == devices.find(it->first))
            {
                offlineDevices << (it->first);
            }
        }
        
        while(offlineDevices)
        {
            std::string deviceId;
            offlineDevices >> deviceId;
            
            if("" != deviceId)
            {
                videoDevices.erase(deviceId);
                std::string msg = "Deleting offline device [";
                msg += (deviceId + "]...");
                FBLOG_INFO_CUSTOM("LocalVideTrack::GetVideoDevices", msg);
            }
        }
        
        delete pDevInfo;
        return devices;
    }
    
    talk_base::scoped_refptr<webrtc::VideoCaptureModule>
        LocalVideoTrack::GetCaptureDevice(const std::string& uniqueId)
    {
        if(videoDevices.end() != videoDevices.find(uniqueId))
        {
            return videoDevices[uniqueId];
        }
        
        return NULL;
    }
    
    LocalVideoTrack::LocalVideoTrack(const talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface>& pTrack)
    : LocalMediaStreamTrack(pTrack->kind(), pTrack->label(), pTrack->enabled())
    {
        registerProperty("effect", make_property(this, &LocalVideoTrack::get_effect,
                                                       &LocalVideoTrack::set_effect));
    }
        
    FB::JSAPIPtr LocalAudioTrack::Create(talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface>& pTrack)
    {
        return boost::make_shared<LocalAudioTrack>(pTrack);
    }
    
    LocalAudioTrack::LocalAudioTrack(const talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface>& pTrack)
    : LocalMediaStreamTrack(pTrack->kind(), pTrack->label(), pTrack->enabled())
    {
        
    }
    
    FB::JSAPIPtr RemoteVideoTrack::Create(talk_base::scoped_refptr<webrtc::VideoTrackInterface>& pTrack)
    {
        return boost::make_shared<RemoteVideoTrack>(pTrack);
    }
    
    RemoteVideoTrack::RemoteVideoTrack(const talk_base::scoped_refptr<webrtc::VideoTrackInterface>& pTrack)
    : MediaStreamTrack(pTrack->kind(), pTrack->label())
    {
        
    }
    
    FB::JSAPIPtr RemoteAudioTrack::Create(talk_base::scoped_refptr<webrtc::AudioTrackInterface>& pTrack)
    {
        return boost::make_shared<RemoteAudioTrack>(pTrack);
    }
    
    RemoteAudioTrack::RemoteAudioTrack(const talk_base::scoped_refptr<webrtc::AudioTrackInterface>& pTrack)
    : MediaStreamTrack(pTrack->kind(), pTrack->label())
    {
        
    }

    FB::JSAPIPtr LocalMediaStream::Create(talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream)
    {
        return boost::make_shared<LocalMediaStream>(pStream);
    }
    
    LocalMediaStream::LocalMediaStream(const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream)
    : FB::JSAPIAuto("MediaStream")
    , m_label(pStream->label())
    , m_videoTracks(FB::variant_list_of())
    , m_audioTracks(FB::variant_list_of())
    {
        registerProperty("label", make_property(this, &LocalMediaStream::get_label));
        registerProperty("videoTracks", make_property(this,&LocalMediaStream::get_videoTracks));
        registerProperty("audioTracks", make_property(this, &LocalMediaStream::get_audioTracks));
        
        for(int i=0; i<pStream->video_tracks()->count(); i++)
        {
            talk_base::scoped_refptr<webrtc::VideoTrackInterface> pTrack(pStream->video_tracks()->at(i));
            talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface> pTrack_(
                static_cast<webrtc::LocalVideoTrackInterface*>(pTrack.get())
            );
            
            AddTrack(LocalVideoTrack::Create(pTrack_));
        }
        
        for(int i=0; i<pStream->audio_tracks()->count(); i++)
        {
            talk_base::scoped_refptr<webrtc::AudioTrackInterface> pTrack(pStream->audio_tracks()->at(i));
            talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface> pTrack_(
                static_cast<webrtc::LocalAudioTrackInterface*>(pTrack.get())
            );
            
            AddTrack(LocalAudioTrack::Create(pTrack_));
        }
    }
    
    void LocalMediaStream::AddTrack(FB::JSAPIPtr pTrack)
    {
        if("video" == pTrack->GetProperty("kind").convert_cast<std::string>())
        {
            m_videoTracks.push_back(FB::variant(pTrack));
        }
        else if("audio" == pTrack->GetProperty("kind").convert_cast<std::string>())
        {
            m_audioTracks.push_back(FB::variant(pTrack));
        }
    }

    FB::JSAPIPtr RemoteMediaStream::Create(talk_base::scoped_refptr<webrtc::MediaStreamInterface>& pStream)
    {
        return boost::make_shared<RemoteMediaStream>(pStream);
    }
    
    RemoteMediaStream::RemoteMediaStream(const talk_base::scoped_refptr<webrtc::MediaStreamInterface>& pStream)
    : FB::JSAPIAuto("RemoteMediaStream")
    , m_label(pStream->label())
    , m_videoTracks(FB::variant_list_of())
    , m_audioTracks(FB::variant_list_of())
    {
        registerProperty("label", make_property(this, &RemoteMediaStream::get_label));
        registerProperty("videoTracks", make_property(this,&RemoteMediaStream::get_videoTracks));
        registerProperty("audioTracks", make_property(this, &RemoteMediaStream::get_audioTracks));
        
        for(int i=0; i<pStream->video_tracks()->count(); i++)
        {
            talk_base::scoped_refptr<webrtc::VideoTrackInterface> pTrack(pStream->video_tracks()->at(i));
            AddTrack(RemoteVideoTrack::Create(pTrack));
        }
        
        for(int i=0; i<pStream->audio_tracks()->count(); i++)
        {
            talk_base::scoped_refptr<webrtc::AudioTrackInterface> pTrack(pStream->audio_tracks()->at(i));
            AddTrack(RemoteAudioTrack::Create(pTrack));
        }
    }
    
    void RemoteMediaStream::AddTrack(FB::JSAPIPtr pTrack)
    {
        if("video" == pTrack->GetProperty("kind").convert_cast<std::string>())
        {
            m_videoTracks.push_back(FB::variant(pTrack));
        }
        else if("audio" == pTrack->GetProperty("kind").convert_cast<std::string>())
        {
            m_audioTracks.push_back(FB::variant(pTrack));
        }
    }
}
