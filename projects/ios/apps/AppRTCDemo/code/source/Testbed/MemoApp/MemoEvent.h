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

        kStartRecordingPressed,
        kStopRecordingPressed,
        kCancelRecordingPressed,

        kPlayAudioPressed,
        kStopAudioPressed,
        kDeleteAudioPressed,
        kSendAudioPressed,
        kCancelAudioPressed,
    };

    EventType   mEvent;

    MemoEvent(EventType evt)
    : mEvent(evt) { }
};
