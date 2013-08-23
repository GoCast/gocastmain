#pragma once

class tTouchEvent
{
public:
    enum EventType
    {
        kTouchBegin,
        kTouchEnd,
        kTouchMove,
    };

public:
    EventType       mEvent;
    tPoint2f        mLocation;
    tUInt8          mID;

public:
    tTouchEvent(const EventType& newEvent, const tPoint2f& newLocation, const tUInt8& newID)
    : mEvent(newEvent), mLocation(newLocation), mID(newID) { }
};
