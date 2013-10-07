#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"
#include "Audio/package.h"

void tSoundImp::OnCompleteCallback()
{
    if (mIsPlaying)
    {
        notify(tSoundEvent(tSoundEvent::kSoundPlayingComplete, this));
        mIsPlaying = false;
    }
}

tSoundImp::tSoundImp(const tFile &file)
:   mIsPlaying(false),
    mIsPaused(false)
{
#pragma unused(file)
}

tSoundImp::~tSoundImp()
{
//    stop();
}

bool    tSoundImp::isPlaying()
{
    return mIsPlaying;
}

bool    tSoundImp::isPaused()
{
    return mIsPaused;
}

bool   tSoundImp::play(tFloat32 startTimeMS, tUInt32 nloops)
{
    if (!mIsPlaying && !mIsPaused)
    {
        mIsPlaying = PlayImp(startTimeMS, nloops);
        
        if (mIsPlaying)
        {
            notify(tSoundEvent(tSoundEvent::kSoundPlaying, this));
        }
        
        return mIsPlaying;
    }
    
    return false;
}
void    tSoundImp::pause()
{
    if (mIsPlaying && !mIsPaused)
    {
        PauseImp();
        mIsPaused = true;
        notify(tSoundEvent(tSoundEvent::kSoundPaused, this));
    }
}

bool   tSoundImp::resume()
{
    if (mIsPlaying && mIsPaused)
    {
        mIsPaused = false;
        mIsPlaying = ResumeImp();
        
        if (mIsPlaying)
        {
            notify(tSoundEvent(tSoundEvent::kSoundResume, this));
        }
        
        return mIsPlaying;
    }
    
    return false;
}

void    tSoundImp::stop()
{
    if (mIsPlaying)
    {
        mIsPlaying    = false;
        mIsPaused     = false;
        
        StopImp();
        
        notify(tSoundEvent(tSoundEvent::kSoundStopped, this));
    }
}
