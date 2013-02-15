#pragma once

class CallcastEvent
{
public:
    enum EventType
    {
        //Login
        kWebViewLoaded,
        kSubmitLogin,
        kLoggedIn,

        //UI Events
        kAnimationFinished,

        //Callcast-specific events
        kAddSpot,
        kRemoveSpot,
        kSetSpot,
        kAddSpotForParticipant,
        kAddPluginToParticipant,
        kRemovePluginFromParticipant,
        kRemoveSpotForParticipant,
        kAddCarouselContent,
        kRemoveCarouselContent,
        kConnectionStatus,
        kOnEffectApplied,
        kOnNicknameInUse,
        kReadyState,
    };

public:
    EventType       mEvent;
    std::string     mSpotType;
    int32_t         mSpotID;
    std::string     mNickname;
    std::string     mRoomname;

public:
    CallcastEvent(EventType evt, const std::string& newNick, const std::string& newRoom)
    : mEvent(evt), mNickname(newNick), mRoomname(newRoom) { }
    CallcastEvent(EventType evt, const std::string& newSpotType, const int32_t& newSpotID)
    : mEvent(evt), mSpotType(newSpotType), mSpotID(newSpotID) { }
    CallcastEvent(EventType evt, const int32_t& newSpotID)
    : mEvent(evt), mSpotID(newSpotID) { }
    CallcastEvent(EventType evt)
    : mEvent(evt) { }
};

