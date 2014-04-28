#pragma once

class tApplicationEvent
{
public:
    enum EventType
    {
        kSuspend = 0,
        kResume,
        kQuit,
    };
    
public:
    EventType       mEvent;

public:
    tApplicationEvent(EventType evt)
    : mEvent(evt) { }
};
