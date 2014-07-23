#include "Base/package.h"
#include "Math/package.h"

#undef tTimer

void tTimer::TimerFire()
{
    bool timerDeleted = false;
    mTimerDeletedPtr = &timerDeleted;

    mWasFired = true;

    mCurrentCount++;
    
    notify(tTimerEvent(tTimer::kTimerTick, this));

    if (timerDeleted)
        return;

    //If this is the last timer event, stop the timer.
    if (mRepeatCount && mCurrentCount == mRepeatCount)
    {
        notify(tTimerEvent(tTimer::kTimerCompleted, this));

        if (timerDeleted)
            return;
        
        stop();
    }
    else if (mWasFired == true)  //Not the last event and only if we didn't get stopped/reset by the observer
    {
        ScheduleImp();
    }

    mTimerDeletedPtr = NULL;
}

tTimer::tTimer(unsigned int delayMS, unsigned int repeatCount)
:   mDelayInMS(delayMS), mCurrentCount(0),
    mRepeatCount(repeatCount), mWasFired(false), mIsRunning(false), mTimerDeletedPtr(NULL) { }

tTimer::~tTimer()
{
//    stop();
    if (mTimerDeletedPtr)
    {
        *mTimerDeletedPtr = true;
    }
}

void tTimer::reset()             //Similar to a stopwatch button-- stop timer, reset laps
{
    stop();               //Stop the timer
    mCurrentCount = 0;    //Reset the lapcount
}

void tTimer::start()
{
    if (!mIsRunning)
    {
        StartImp();
        mIsRunning = true;
    }
}

void tTimer::stop()
{
    if (mIsRunning)
    {
        StopImp();
        mIsRunning = false;
        mWasFired = false;
    }
}

unsigned int tTimer::getCurrentCount() const
{
    return mCurrentCount;
}

unsigned int tTimer::getDelay() const
{
    return mDelayInMS;
}

unsigned int tTimer::getRepeatCount() const
{
    return mRepeatCount;
}

bool         tTimer::isRunning() const
{
    return mIsRunning;
}

signed int tTimer::getTimeMS()
{
    return tTimerPeer::GetTimeMSImp();
}

