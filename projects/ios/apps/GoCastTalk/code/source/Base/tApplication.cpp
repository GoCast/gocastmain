#include "Base/package.h"

tApplication::tApplication()
: mSuspended(false), mRunning(true)
{
}

void tApplication::suspend()
{
    if (mRunning && !mSuspended)
    {
        mSuspended = true;

        notify(tApplicationEvent(tApplicationEvent::kSuspend));
    }
}

void tApplication::resume()
{
    if (mRunning && mSuspended)
    {
        mSuspended = false;

        notify(tApplicationEvent(tApplicationEvent::kResume));
    }
}

void tApplication::quit()
{
    if (mRunning)
    {
        mRunning = false;

        notify(tApplicationEvent(tApplicationEvent::kQuit));
    }
}

