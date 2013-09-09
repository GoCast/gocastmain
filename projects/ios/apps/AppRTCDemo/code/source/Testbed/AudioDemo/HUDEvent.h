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

        kPCConstruct,
        kPCAddStream,
        kPCClose,
        kPCCreateAnswer,
        kPCCreateOffer,
        kPCSetLocalDescription,
        kPCSetRemoteDescription,
    };

    EventType   mEvent;
    std::string mRoomID;

    std::string mRTCConfig;

    HUDEvent(EventType evt)
    : mEvent(evt) { }

    HUDEvent(EventType evt, const std::string& newString)
    : mEvent(evt), mRoomID(newString), mRTCConfig(newString) { }
};
