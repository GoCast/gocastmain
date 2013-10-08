#include "Base/package.h"

tUInt32 tTimer::getSystemTimeMS()
{
    return tTimerPeer::GetSystemTimeMSImp();
}

