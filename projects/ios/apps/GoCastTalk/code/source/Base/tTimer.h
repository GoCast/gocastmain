#pragma once

class tTimerEvent; //Pre-declaration for a class defined below
class tTimer
:   public tSubject<const tTimerEvent&>
{
public:
    enum EventType
    {
        kTimerTick,
        kTimerCompleted
    };

public:
    void TimerFire();

protected:
    unsigned int    mDelayInMS;
    unsigned int    mCurrentCount;
    unsigned int    mRepeatCount;
    bool       mWasFired;
    bool       mIsRunning;
    bool*      mTimerDeletedPtr;

protected:
    virtual void StartImp() = 0;
    virtual void ScheduleImp() = 0;
    virtual void StopImp() = 0;

public:
    tTimer(unsigned int delay, unsigned int repeatCount = 0);
    virtual ~tTimer();
    
    void    reset();
    void    start();
    void    stop();

    unsigned int getCurrentCount() const;
    unsigned int getDelay() const;
    unsigned int getRepeatCount() const;
    bool    isRunning() const;

public:
    static signed int getTimeMS();
    
    friend class tTimerPeer;
};

class tTimerEvent
{
public:
    tTimer::EventType   mEvent;
    tTimer*             mTimer;
    
public:
    tTimerEvent(tTimer::EventType evt, tTimer* newTimer)
    : mEvent(evt), mTimer(newTimer) { }
};

#include "tTimerPeer.h"
#define tTimer tTimerPeer
