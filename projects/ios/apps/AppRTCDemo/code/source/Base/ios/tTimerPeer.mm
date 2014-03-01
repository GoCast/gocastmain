#import <Foundation/NSRunLoop.h>
#import <Foundation/NSTimer.h>
#include <mach/mach_time.h>

#include "Base/package.h"
#include "Math/package.h"

#undef tTimer

@interface appleTimer : NSObject
{
@public
    tTimer*         parent;
    double          delayMS;
    NSTimer*        curTimer;
}

-(void) run:(id)dontcare;
-(void) schedule;
@end

@implementation appleTimer

-(void) run:(id)dontcare
{
#pragma unused(dontcare)

    assert(self->parent);

    if (self->parent->isRunning())
    {
        self->parent->TimerFire();
    }
}

-(void) schedule
{
    curTimer = [NSTimer scheduledTimerWithTimeInterval:self->delayMS / 1000.0f
                                     target:self
                                   selector:@selector(run:)
                                   userInfo:nil
                                    repeats:NO];

	[[NSRunLoop currentRunLoop] addTimer:curTimer forMode:NSDefaultRunLoopMode];
//	[[NSRunLoop currentRunLoop] addTimer:curTimer forMode:NSEventTrackingRunLoopMode]; // ensure timer fires during resize
}

@end

tTimerPeer::tTimerPeer(unsigned int delay, unsigned int repeatCount)
:   tTimer(delay, repeatCount)
{
    mNativeTimer = [[appleTimer alloc] init];
    mNativeTimer->parent = this;
}

tTimerPeer::~tTimerPeer()
{
    stop();
    [mNativeTimer release];
}

void tTimerPeer::StartImp()
{
    mNativeTimer->delayMS = ((tTimer*)this)->mDelayInMS;
    ScheduleImp();
}

void tTimerPeer::ScheduleImp()
{
    [mNativeTimer schedule];
}

void tTimerPeer::StopImp()
{
    [mNativeTimer->curTimer invalidate];
}

signed int tTimerPeer::GetTimeMSImp()
{
    const int64_t kOneMillion = 1000 * 1000;
    static mach_timebase_info_data_t s_timebase_info;
    
    if (s_timebase_info.denom == 0) 
    {
        (void) mach_timebase_info(&s_timebase_info);
    }
    
    // mach_absolute_time() returns billionth of seconds,
    // so divide by one million to get milliseconds
    return (signed int)((mach_absolute_time() * s_timebase_info.numer) / (kOneMillion * s_timebase_info.denom));
}
