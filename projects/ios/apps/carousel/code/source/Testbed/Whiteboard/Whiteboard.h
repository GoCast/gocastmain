#pragma once

class tSGViewEvent;

class WhiteboardEvent;

class Whiteboard
:   tObserver<const tSGViewEvent&>,
    tObserver<const tMouseEvent&>,
    tObserver<const WhiteboardEvent&>
{
protected:
    std::vector<tPoint2f>   mWhiteBoardVerts;
    std::vector<tPoint2f>   mWhiteBoardTexCoords;
    std::vector<tPoint2f>   mMouseVerts;
    std::vector<tPoint2f>   mMouseTexCoords;

    tSurface                mWhiteboardSurface;
    tTexture*               mWhiteboardTexture;
    tTexture*               mMouseTexture;
    tProgram*               mSpriteProgram;

    tPoint2f                mCurDrawPoint;

protected:
    void createResources();
    void configureNodes();

public:
    Whiteboard();
    ~Whiteboard();

    void onInitView();
    void onResizeView(const tDimension2f& newSize);
    void onRedrawView(float time);

    void onMoveTo(const tPoint2f& pt);
    void onLineTo(const tPoint2f& pt);
    void onStroke();

    void update(const tSGViewEvent& msg);
    void update(const tMouseEvent& msg);
    void update(const WhiteboardEvent& msg);
};

class WhiteboardManager
:   public tSingleton<WhiteboardManager>,
    public tSubject<const WhiteboardEvent&>
{
public:
    WhiteboardManager() { }
};

class WhiteboardEvent
{
public:
    enum EventType
    {
        kSave,
        kRestore,
        kBeginPath,
        kClosePath,
        kMoveTo,
        kLineTo,
        kStroke,
    };

public:
    EventType       mEvent;
    tPoint2f        mPoint;

public:
    WhiteboardEvent(EventType evt, const tPoint2f& np)
    : mEvent(evt), mPoint(np) { }
    WhiteboardEvent(EventType evt)
    : mEvent(evt) { }
};

