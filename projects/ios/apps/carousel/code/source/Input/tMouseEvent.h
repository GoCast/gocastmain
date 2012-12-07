#pragma once

class tMouseEvent
{
public:
    enum EventType
    {
        kMouseMove,
        kMouseDown,
        kMouseUp,
        kMouseDrag,
        kMouseWheel,
    };

    enum ButtonID
    {
        kLeft,
        kRight,
        kMiddle,
    };
    
public:
    EventType       event;
    tSubject<const tMouseEvent&>* source;
    tPoint2f        location;
    ButtonID        buttonID;

public:
    tMouseEvent(EventType evt, tSubject<const tMouseEvent&>* newSource, const tPoint2f& np, ButtonID nbID = tMouseEvent::kLeft)
    : event(evt), source(newSource), location(np), buttonID(nbID) { }
};

