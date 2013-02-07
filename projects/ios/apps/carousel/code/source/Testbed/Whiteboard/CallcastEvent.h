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

        //Whiteboard events below
        kSave,
        kRestore,
        kBeginPath,
        kClosePath,
        kMoveTo,
        kLineTo,
        kStroke,

        //Just hacks
        kChangePenSize,
        kChangePenColor,
        kChangePenErase,

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
    tColor4b        mColor;
    tPoint2f        mPoint;
    float           mPenSize;

public:
    CallcastEvent(EventType evt, const std::string& newNick, const std::string& newRoom)
    : mEvent(evt), mNickname(newNick), mRoomname(newRoom) { }
    CallcastEvent(EventType evt, const std::string& newSpotType, const int32_t& newSpotID)
    : mEvent(evt), mSpotType(newSpotType), mSpotID(newSpotID) { }
    CallcastEvent(EventType evt, const int32_t& newSpotID)
    : mEvent(evt), mSpotID(newSpotID) { }
    CallcastEvent(EventType evt, const int32_t& newSpotID, const tPoint2f& np)
    : mEvent(evt), mSpotID(newSpotID), mPoint(np) { }
    CallcastEvent(EventType evt, const int32_t& newSpotID, const tColor4b& nc, const float& np)
    : mEvent(evt), mSpotID(newSpotID), mColor(nc), mPenSize(np) { }
    CallcastEvent(EventType evt)
    : mEvent(evt) { }
};

