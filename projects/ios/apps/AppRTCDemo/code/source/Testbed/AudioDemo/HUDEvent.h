#pragma once

class HUDEvent
{
public:
    enum EventType
    {
        kAppDelegateInit,

        kWebViewLoaded,
        kReadyState,
    };

    EventType   mEvent;

    HUDEvent(EventType evt)
    : mEvent(evt) { }
};
