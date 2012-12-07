#pragma once

class tTouchEvent
{
public:
    enum EventType
    {
        kTouchBegin,
        kTouchEnd,
        kTouchMove,
        kTouchTap,
    };
    
public:
    EventType       event;
    tPoint2f        location;
    uint32_t    touchID;

public:
    tTouchEvent(EventType evt, const tPoint2f& np,
               uint32_t ntID = 0)
    : event(evt), location(np), touchID(ntID) { }
};
