#pragma once

class tSGViewEvent;

class CallcastEvent;

class Whiteboard
:   tObserver<const tSGViewEvent&>,
    tObserver<const tMouseEvent&>,
    tObserver<const tTimerEvent&>,
    tObserver<const CallcastEvent&>
{
protected:
    std::vector<tPoint2f>   mWhiteBoardVerts;
    std::vector<tPoint2f>   mWhiteBoardTexCoords;
    std::vector<tPoint2f>   mMouseVerts;
    std::vector<tPoint2f>   mMouseTexCoords;

    tTimer*                 mDrawingTimer;
    tPoint2f                mLastPolledPt;

    tSurface                mWhiteboardSurface;
    tTexture*               mWhiteboardTexture;
    tTexture*               mMouseTexture;
    tProgram*               mSpriteProgram;

    tPoint2f                mCurDrawPoint;

    tPoint2f                mStartTouch;
    tPoint2f                mEndTouch;

    tColor4b                mReceivePenColor;
    float                   mReceivePenSize;

    tColor4b                mSendPenColor;
    float                   mSendPenSize;

    bool                    mInitialized;
    bool                    mShouldCapture;

protected:
    void createResources();
    void configureNodes();

public:
    Whiteboard();
    ~Whiteboard();

    void onInitView();
    void onResizeView(const tDimension2f& newSize);
    void onRedrawView(float time);

    void onSave(const tColor4b& nc, const float& np);
    void onMoveTo(const tPoint2f& pt);
    void onLineTo(const tPoint2f& pt);
    void onStroke();

    void update(const tSGViewEvent& msg);
    void update(const tMouseEvent& msg);
    void update(const tTimerEvent& msg);
    void update(const CallcastEvent& msg);
};

