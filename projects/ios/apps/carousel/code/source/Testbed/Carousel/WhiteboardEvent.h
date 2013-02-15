#pragma once

class WhiteboardEvent
{
public:
    enum EventType
    {
        //Whiteboard events below
        kSave,
        kRestore,
        kBeginPath,
        kClosePath,
        kMoveTo,
        kLineTo,
        kStroke,

        kLocalDraw,

        kLoadImageURL,
    };

public:
    EventType       mEvent;
    int32_t         mSpotID;
    std::string     mURL;
    tColor4b        mColor;
    tPoint2f        mPoint;
    tPoint2f        mEndPoint;
    float           mPenSize;

public:
    WhiteboardEvent(EventType evt, const int32_t& newSpotID)
    : mEvent(evt), mSpotID(newSpotID) { }
    WhiteboardEvent(EventType evt, const int32_t& newSpotID, const std::string& newURL)
    : mEvent(evt), mSpotID(newSpotID), mURL(newURL) { }
    WhiteboardEvent(EventType evt, const int32_t& newSpotID, const tPoint2f& np)
    : mEvent(evt), mSpotID(newSpotID), mPoint(np) { }
    WhiteboardEvent(EventType evt, const int32_t& newSpotID, const tColor4b& nc, const float& np)
    : mEvent(evt), mSpotID(newSpotID), mColor(nc), mPenSize(np) { }
    WhiteboardEvent(EventType evt, const int32_t& newSpotID, const tColor4b& nc, const float& np, const tPoint2f& newSt, const tPoint2f& newEn)
    : mEvent(evt), mSpotID(newSpotID), mColor(nc), mPoint(newSt), mEndPoint(newEn), mPenSize(np) { }
    WhiteboardEvent(EventType evt)
    : mEvent(evt) { }
};

