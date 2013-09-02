#pragma once

class HUDEvent
{
public:
    enum EventType
    {
        kAppDelegateInit,

        kWebViewLoaded,
        kReadyState,

        kGoPressed,
    };

    EventType   mEvent;

    HUDEvent(EventType evt)
    : mEvent(evt) { }
};
