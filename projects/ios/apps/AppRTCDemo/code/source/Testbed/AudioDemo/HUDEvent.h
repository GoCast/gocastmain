#pragma once

#include <string>

class HUDEvent
{
public:
    enum EventType
    {
        kAppDelegateInit,

        kWebViewLoaded,
        kReadyState,

        kGoPressed,
        kSetRoomID,
    };

    EventType   mEvent;
    std::string mRoomID;

    HUDEvent(EventType evt)
    : mEvent(evt) { }

    HUDEvent(EventType evt, const std::string& newRoomID)
    : mEvent(evt), mRoomID(newRoomID) { }
};
