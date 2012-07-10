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
    
    FB::JSAPIPtr LocalVideoTrack::Create(talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface>& pTrack)
    {
        return boost::make_shared<LocalVideoTrack>(pTrack);
    }
    
    talk_base::scoped_refptr<webrtc::VideoCaptureModule> LocalVideoTrack::GetDefaultCaptureDevice()
    {
        talk_base::scoped_refptr<webrtc::VideoCaptureModule> pDev(NULL);
        webrtc::VideoCaptureModule::DeviceInfo* pDevInfo(webrtc::VideoCaptureFactory::CreateDeviceInfo(0));
        
        const size_t kMaxDeviceNameLength = 128;
        const size_t kMaxUniqueIdLength = 256;
        char deviceName[kMaxDeviceNameLength];
        char deviceUniqueId[kMaxUniqueIdLength];
        
        if(0 < pDevInfo->NumberOfDevices())
        {
            //Get unique id of default capture device
            pDevInfo->GetDeviceName(0, deviceName, kMaxDeviceNameLength, deviceUniqueId, kMaxUniqueIdLength);
        
            //Try to open the device
            pDev = webrtc::VideoCaptureFactory::Create(0, deviceUniqueId);
            delete pDevInfo;            
        }
        
        //If no device found or unable to open default device pDev.get() will be NULL
        return pDev;
    }
    
    LocalVideoTrack::LocalVideoTrack(const talk_base::scoped_refptr<webrtc::LocalVideoTrackInterface>& pTrack)
    : LocalMediaStreamTrack(pTrack->kind(), pTrack->label(), pTrack->enabled())
    , m_pTrack(pTrack)
    {
        
    }
    
    FB::JSAPIPtr LocalAudioTrack::Create(talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface>& pTrack)
    {
        return boost::make_shared<LocalAudioTrack>(pTrack);
    }
    
    LocalAudioTrack::LocalAudioTrack(const talk_base::scoped_refptr<webrtc::LocalAudioTrackInterface>& pTrack)
    : LocalMediaStreamTrack(pTrack->kind(), pTrack->label(), pTrack->enabled())
    , m_pTrack(pTrack)
    {
        
    }
    
    FB::JSAPIPtr RemoteVideoTrack::Create(talk_base::scoped_refptr<webrtc::VideoTrackInterface>& pTrack)
    {
        return boost::make_shared<RemoteVideoTrack>(pTrack);
    }
    
    RemoteVideoTrack::RemoteVideoTrack(const talk_base::scoped_refptr<webrtc::VideoTrackInterface>& pTrack)
    : MediaStreamTrack(pTrack->kind(), pTrack->label())
    , m_pTrack(pTrack)
    {
        
    }
    
    FB::JSAPIPtr RemoteAudioTrack::Create(talk_base::scoped_refptr<webrtc::AudioTrackInterface>& pTrack)
    {
        return boost::make_shared<RemoteAudioTrack>(pTrack);
    }
    
    RemoteAudioTrack::RemoteAudioTrack(const talk_base::scoped_refptr<webrtc::AudioTrackInterface>& pTrack)
    : MediaStreamTrack(pTrack->kind(), pTrack->label())
    , m_pTrack(pTrack)
    {
        
    }

    FB::JSAPIPtr MediaStream::Create(talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream)
    {
        return boost::make_shared<MediaStream>(pStream);
    }
    
    MediaStream::MediaStream(const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& pStream)
    : FB::JSAPIAuto("MediaStream")
    , m_label(pStream->label())
    , m_videoTracks(FB::variant_list_of())
    , m_audioTracks(FB::variant_list_of())
    , m_pStream(pStream)
    {
        registerProperty("label", make_property(this, &MediaStream::get_label));
        registerProperty("videoTracks", make_property(this,&MediaStream::get_videoTracks));
        registerProperty("audioTracks", make_property(this, &MediaStream::get_audioTracks));
    }
    
    const talk_base::scoped_refptr<webrtc::LocalMediaStreamInterface>& MediaStream::LocalMediaStreamInterface() const
    {
        return m_pStream;
    }
    
    void MediaStream::AddTrack(FB::JSAPIPtr pTrack)
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
    , m_pStream(pStream)
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
    
    const talk_base::scoped_refptr<webrtc::MediaStreamInterface>& RemoteMediaStream::RemoteMediaStreamInterface() const
    {
        return m_pStream;
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
