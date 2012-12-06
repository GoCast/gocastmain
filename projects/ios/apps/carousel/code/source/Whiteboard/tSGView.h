#pragma once

class tSGViewEvent;

class tSGView
:   public tSingleton<tSGView>,
    public tSubject<const tSGViewEvent&>
{
public:
    tSGView();
    ~tSGView() { }

//--
    void update(const tSGViewEvent& msg);
};

class tSGViewEvent
{
public:
    enum EventType
    {
        kInitView,
        kResizeView,
        kRedrawView,
    };

public:
    EventType       event;
    tDimension2f    size;
    float        drawTime;

public:
    tSGViewEvent(tSGViewEvent::EventType evt) : event(evt) { }
    tSGViewEvent(tSGViewEvent::EventType evt, const tDimension2f& newSize) : event(evt), size(newSize), drawTime(0.0f) { }
    tSGViewEvent(tSGViewEvent::EventType evt, float newTime) : event(evt), drawTime(newTime) { }
};

