#pragma once

class CallcastEvent
{
public:
    enum EventType
    {
        //Login
        kWebViewLoaded,
        kSubmitLogin,
        kLoggedIn,

        //Whiteboard events below
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
    tColor4b        mColor;
    tPoint2f        mPoint;
    float           mPenSize;

public:
    CallcastEvent(EventType evt, const tPoint2f& np)
    : mEvent(evt), mPoint(np) { }
    CallcastEvent(EventType evt, const tColor4b& nc, const float& np)
    : mEvent(evt), mColor(nc), mPenSize(np) { }
    CallcastEvent(EventType evt)
    : mEvent(evt) { }
};

