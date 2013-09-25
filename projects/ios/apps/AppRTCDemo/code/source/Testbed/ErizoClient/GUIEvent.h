#pragma once

class GUIEvent;

class GUIEventManager
:   public tSingleton<GUIEventManager>,
    public tSubject<const GUIEvent&>
{
protected:
    GUIEventManager() { }

    friend class tSingleton<GUIEventManager>;
};

class GUIEvent
{
public:
    enum EventType
    {
        kGoPressed,
        kRoomIDUpdate,
    };

    EventType   mEvent;
    std::string mRoomID;

    GUIEvent(EventType evt)
    : mEvent(evt) { }
    GUIEvent(EventType evt, const std::string& newRoomID)
    : mEvent(evt), mRoomID(newRoomID) { }
};
