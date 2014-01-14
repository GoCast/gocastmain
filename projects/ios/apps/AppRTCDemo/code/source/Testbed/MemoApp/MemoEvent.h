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
        kGroupsTabPressed,
        kSettingsTabPressed,

        kStartRecordingPressed,
        kStopRecordingPressed,
        kCancelRecordingPressed,
        kSaveRecordingPressed,
        kSendRecordingPressed,

        kPlayAudioPressed,
        kSendAudioPressed,

        kAddGroupPressed,
        kEditGroupPressed,

        kSaveGroupPressed,

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

        kNuanceTranscriptionReady,
    };

    EventType   mEvent;
    std::string mTranscription;
    tUInt32     mItemSelected;

    MemoEvent(EventType evt)
    : mEvent(evt) { }
    MemoEvent(EventType evt, tUInt32 newItemSelected)
    : mEvent(evt), mItemSelected(newItemSelected) { }
    MemoEvent(EventType evt, const std::string& newTranscription)
    : mEvent(evt), mTranscription(newTranscription) { }
};

