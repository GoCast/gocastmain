#pragma once

class CallcastEvent
{
public:
    enum EventType
    {
        kSave,
        kRestore,
        kBeginPath,
        kClosePath,
        kMoveTo,
        kLineTo,
        kStroke,
    };

public:
    EventType       mEvent;
    tPoint2f        mPoint;

public:
    CallcastEvent(EventType evt, const tPoint2f& np)
    : mEvent(evt), mPoint(np) { }
    CallcastEvent(EventType evt)
    : mEvent(evt) { }
};

