#include "Base/package.h"

#include "package.h"
#include "AppDelegate.h"

void ErizoStream::GetUserMediaCallback(void* that, RTCMediaStream* stream)
{
#define that ((ErizoStream*)that)
    NSLog(@"User has granted access to local media.");
    that->mStream = stream;

    ErizoStreamEvent streamEvent("access-accepted", NULL);

    that->dispatchEvent(&streamEvent);
#undef that
}

void ErizoStream::GetUserMediaError(void* that, RTCMediaStream* stream)
{
#pragma unused(stream)
#define that ((ErizoStream*)that)
    NSLog(@"Failed to get access to local media. Error code was N/A.");
    ErizoStreamEvent streamEvent("access-denied", NULL);

    that->dispatchEvent(&streamEvent);
#undef that
}

ErizoStream::ErizoStream(bool audio, bool video, const std::string& uname)
: mStream(NULL),
mRoom(NULL),
mAttributesName(uname),
mLocal(true),
mAudio(audio),
mVideo(video),
mData(false),
mScreen(false)
{
}

std::string ErizoStream::getID() const
{
    return mStreamID;
}

std::string ErizoStream::getAttributesName() const
{
    return mAttributesName;
}

bool ErizoStream::hasAudio() const
{
    return mAudio;
}

bool ErizoStream::hasVideo() const
{
    return mVideo;
}

bool ErizoStream::hasData() const
{
    return mData;
}

bool ErizoStream::hasScreen() const
{
    return mScreen;
}

void ErizoStream::sendData(void* msg)
{
#pragma unused(msg)
    //TJG Note: This is actually an empty function
}

void ErizoStream::init()
{
    if (mAudio || mVideo || mScreen)
    {
        NSLog(@"Requested access to local media");

        ErizoConnection::getUserMedia(this, GetUserMediaCallback, GetUserMediaError);
    } else {
        ErizoStreamEvent streamEvent("access-accepted", NULL);
        dispatchEvent(&streamEvent);
    }
}

void ErizoStream::close()
{
    if (mLocal)
    {
        if (mRoom)
        {
            mRoom->unpublish(this);
        }
        // Remove HTML element
        hide();
//TODO: Why don't we have a stop method like in JavaScript?
//        if (mStream)
//        {
//            [mStream stop];
//        }

        [mStream release];
        mStream = nil;
    }
}

void ErizoStream::show(void* elementID, void* options)
{
#pragma unused(elementID, options)
    //TODO: This is just for showing the video / audio player?
}

void ErizoStream::hide()
{
    //TODO: This is just for hiding the video / audio player?
}

void* ErizoStream::getFrame() const
{
    //TODO: This is regarding the video player?

    return NULL;
}

void* ErizoStream::getVideoFrameURL() const
{
    //TODO: This is regarding the video player?

    return NULL;
}

void* ErizoStream::getVideoFrame() const
{
    //TODO: This is regarding the video player?

    return NULL;
}

