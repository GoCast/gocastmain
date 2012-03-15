#ifndef GOCASTMAIN_KDDIDEMO_MEDIATRACK_H_
#define GOCASTMAIN_KDDIDEMO_MEDIATRACK_H_

#include <string>

namespace GoCast
{
    class MediaTrack
    {
        public:
            explicit MediaTrack(const std::string& id,
                                const int channel,
                                const bool bVideo);
            virtual ~MediaTrack();

        public:
            virtual void SetSendPort(const int sendPort);
            virtual void SetReceivePort(const int recvPort);

        protected:
            const std::string m_id;
            const bool m_bVideo;
            const int m_sendPort;
            const int m_recvPort;
            const int m_channel;
    };
}

#endif

#include "mediatrack.h"

#define UNSPECIFIED -1

namespace GoCast
{
    MediaTrack::MediaTrack(const::std::string& id,
                           const int channel,
                           const bool bVideo)
    : m_id(id)
    , m_bVideo(bVideo)
    , m_sendPort(UNSPECIFIED)
    , m_recvPort(UNSPECIFIED)
    , m_channel(channel)
    {
    }

    MediaTrack::~MediaTrack()
    {
    }

    void MediaTrack::SetSendPort
}

