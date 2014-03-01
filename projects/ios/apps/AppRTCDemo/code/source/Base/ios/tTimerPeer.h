#pragma once

#ifdef __OBJC__
@class appleTimer;
#else
#define appleTimer void
#endif

class tTimerPeer
:   public tTimer
{
protected:
    appleTimer* mNativeTimer;

protected:
    void StartImp();
    void ScheduleImp();
    void StopImp();
    
    static signed int GetTimeMSImp();

public:
    tTimerPeer(unsigned int delay, unsigned int repeatCount = 0);
    ~tTimerPeer();

    friend class tTimer;
};

