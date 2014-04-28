#pragma once

class tOrientationEvent
{
public:
    enum EventType
    {
        kOrientationChanged = 0,
        kAllowOrientation,
    };
    
    enum OrientationType
    {
        kPortrait = 0,
        kPortraitUpsidedown,
        kLandscapeLeft,
        kLandscapeRight,
    };
    
public:
    EventType       mEvent;
    OrientationType mType;
    bool            mAllowed;

public:
    tOrientationEvent(EventType evt, const OrientationType& newOT)
    : mEvent(evt), mType(newOT), mAllowed(true) { }

    tOrientationEvent(EventType evt, const OrientationType& newOT, bool newAllowed)
    : mEvent(evt), mType(newOT), mAllowed(newAllowed) { }
};
