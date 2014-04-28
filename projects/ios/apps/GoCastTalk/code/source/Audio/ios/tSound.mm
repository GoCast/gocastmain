#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

@interface appleAVAudioPlayerDelegate : NSObject<AVAudioPlayerDelegate>
{
@public
    tSound* parent;
}
- (void)audioPlayerDecodeErrorDidOccur:(AVAudioPlayer *)player error:(NSError *)error;
- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag;
@end

@implementation appleAVAudioPlayerDelegate

- (void)audioPlayerDecodeErrorDidOccur:(AVAudioPlayer *)player error:(NSError *)error
{
#pragma unused(player, error)

    parent->notify(tSoundEvent(tSoundEvent::kIoError, parent));
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag
{
#pragma unused(player, flag)

    parent->OnCompleteCallback();
}

@end

tSound::tSound(const tFile& file)
:   tSoundImp(file),
    mAvaudioplayer(NULL)
{
    NSError* err;

    @autoreleasepool
    {
        mAvaudioplayer = [[AVAudioPlayer alloc] initWithContentsOfURL:
                          [NSURL fileURLWithPath:
                           [NSString stringWithFormat:@"%s",
                            file.GetFullPath().c_str()]]
                                                                error:&err];
        mAvaudioplayer.volume = 1.0f;
    }

    assert(mAvaudioplayer);
    
    mAppleAVPlayerDelegate = [[appleAVAudioPlayerDelegate alloc] init];
    ((appleAVAudioPlayerDelegate*)mAppleAVPlayerDelegate)->parent = this;
    
    mAvaudioplayer.delegate = (appleAVAudioPlayerDelegate*)mAppleAVPlayerDelegate;
    
    [mAvaudioplayer prepareToPlay];

    mDuration = (tUInt32)[mAvaudioplayer duration] * 1000;
}

tSound::~tSound()
{
    stop();

    assert(mAvaudioplayer);
    [mAvaudioplayer release];
    [(appleAVAudioPlayerDelegate*)mAppleAVPlayerDelegate release];
}

bool    tSound::PlayImp(tFloat32 startTimeMS, tUInt32 nloops)
{
    assert(mAvaudioplayer);
    
    mAvaudioplayer.numberOfLoops = (int)nloops;
    
    return [mAvaudioplayer playAtTime:mAvaudioplayer.deviceCurrentTime + startTimeMS / 1000.0f];
}

void    tSound::PauseImp()
{
    assert(mAvaudioplayer);
    
    [mAvaudioplayer pause];
}

bool    tSound::ResumeImp()
{
    assert(mAvaudioplayer);
    
    return (bool)[mAvaudioplayer play];
}

void    tSound::StopImp()
{
    assert(mAvaudioplayer);
    
    [mAvaudioplayer stop];
    mAvaudioplayer.currentTime = 0.0f;
}

