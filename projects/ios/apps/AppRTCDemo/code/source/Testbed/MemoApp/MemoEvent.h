#pragma once

class MemoEvent
{
public:
    enum EventType
    {
        kAppDelegateInit,

        kSignInPressed,
        kNewAccountPressed,

        kInboxTabPressed,
        kNewMemoTabPressed,
        kSettingsTabPressed,

        kStartRecordingPressed,
        kStopRecordingPressed,
        kCancelRecordingPressed,
        kSaveRecordingPressed,
        kSendRecordingPressed,

        kPlayAudioPressed,
        kStopAudioPressed,
        kDeleteAudioPressed,
        kSendAudioPressed,
        kCancelAudioPressed,

        kChangePasswordPressed,
        kLogOutPressed,

        kSendSendToGroupPressed,
        kCancelSendToGroupPressed,

        kOKYesAlertPressed,
        kNoAlertPressed,

        kTableItemSelected,
    };

    EventType   mEvent;
    tUInt32     mItemSelected;

    MemoEvent(EventType evt)
    : mEvent(evt) { }
    MemoEvent(EventType evt, tUInt32 newItemSelected)
    : mEvent(evt), mItemSelected(newItemSelected) { }
};
