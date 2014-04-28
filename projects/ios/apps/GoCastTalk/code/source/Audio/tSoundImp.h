#pragma once

class tSoundEvent;
class tFile;

class tSoundImp
:   public tSubject<const tSoundEvent &>
{
public:
    void OnCompleteCallback();
    
protected:
    tUInt32         mDuration;
    bool            mIsPlaying;
    bool            mIsPaused;

protected:    
    virtual bool    PlayImp(tFloat32 startTimeMS, tUInt32 nloops) = 0;
    virtual void    PauseImp() = 0;
    virtual bool    ResumeImp() = 0;
    virtual void    StopImp() = 0;

public:
    explicit tSoundImp(const tFile &file);
    ~tSoundImp();

    tUInt32 getDurationMS();

    bool    isPlaying();
    bool    isPaused();

    bool    play(tFloat32 startTimeMS = 0, tUInt32 nloops = 0);
    void    pause();
    bool    resume();
    void    stop();
    
    friend class tSound;
};

// --

class tSoundEvent
{
public:
    enum EventType
    {
        kIoError,
        kSoundPlaying,
        kSoundPlayingComplete,
        kSoundStopped,
        kSoundPaused,
        kSoundResume,
    };
    
    EventType                       mEvent;
    tSubject<const tSoundEvent &>*  mSource;
    
public:
    tSoundEvent(EventType evt, tSubject<const tSoundEvent &>* newsource)
    : mEvent(evt), mSource(newsource) { }
};

