#pragma once

class tTouchEvent
{
public:
    enum EventType
    {
        kTouchBegin,
        kTouchEnd,
        kTouchDrag,
    };

public:
    EventType       event;
    tSubject<const tTouchEvent&>* source;
    tPoint2f        location;

public:
    tTouchEvent(EventType evt, tSubject<const tTouchEvent&>* newSource, const tPoint2f& np)
    : event(evt), source(newSource), location(np) { }
};

