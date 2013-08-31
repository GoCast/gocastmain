#pragma once

class HUDEvent
{
public:
    enum EventType
    {
        kAppDelegateInit,

        kWebViewLoaded,
        kReadyState,

        kScreenNameGoPressed,
        kRoomNameGoPressed,
    };

    EventType   mEvent;

    HUDEvent(EventType evt)
    : mEvent(evt) { }
};
