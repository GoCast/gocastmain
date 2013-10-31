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
        kSendAudioPressed,

        kChangePasswordPressed,
        kLogOutPressed,
        kEditProfilePressed,

        kSaveProfilePressed,

        kSendSendToGroupPressed,
        kCancelSendToGroupPressed,

        kRetryVersionCheckPressed,

        kOKYesAlertPressed,
        kNoAlertPressed,

        kTableItemSelected,
        kTableItemDeleted,
    };

    EventType   mEvent;
    tUInt32     mItemSelected;

    MemoEvent(EventType evt)
    : mEvent(evt) { }
    MemoEvent(EventType evt, tUInt32 newItemSelected)
    : mEvent(evt), mItemSelected(newItemSelected) { }
};
