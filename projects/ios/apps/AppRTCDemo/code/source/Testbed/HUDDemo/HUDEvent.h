#pragma once

class HUDEvent
{
public:
    enum EventType
    {
        kAppDelegateInit,

        kSignInPressed,
        kRegisterPressed,

        kCallPressed,
        kActiveModePressed,
        kSettingsPressed,
        kAddMemberPressed,
        kEditGroupPressed,

        kLiveRecordPressed,
        kLivePressed,
        kRecordPressed,

        kActivePressed,
        kSilentPressed,
        kDeclinePressed,

        kSavePressed,
        kCancelPressed,

        kMutePressed,
        kHangupPressed,
        kSpeakerPressed,

        kMailSent,
    };

    EventType   mEvent;

    HUDEvent(EventType evt)
    : mEvent(evt) { }
};
