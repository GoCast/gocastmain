#pragma once

class MemoEvent
{
public:
    enum EventType
    {
        kAppDelegateInit,

        kSignInPressed,

        kInboxTabPressed,
        kMemosTabPressed,
        kNewMemoTabPressed,
    };

    EventType   mEvent;

    MemoEvent(EventType evt)
    : mEvent(evt) { }
};
