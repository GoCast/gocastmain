#pragma once

#ifdef __OBJC__
#import <AVFoundation/AVFoundation.h>
#else
#define AVAudioPlayer void
#endif

class tSoundEvent;
class tSoundImp;

class tSound
:   public tSoundImp
{
public:
    AVAudioPlayer*  mAvaudioplayer;
    void*           mAppleAVPlayerDelegate;
    
protected:    
    bool    PlayImp(tFloat32 startTimeMS, tUInt32 nloops);
    void    PauseImp();
    bool    ResumeImp();
    void    StopImp();

public:
    tSound(const tFile& file);
    ~tSound();
};

