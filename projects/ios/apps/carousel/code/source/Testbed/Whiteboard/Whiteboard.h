#pragma once

class tSGViewEvent;

class Whiteboard
:   tObserver<const tSGViewEvent&>,
    tObserver<const tMouseEvent&>
{
protected:
    tSurface mWhiteboardSurface;
    tTexture* mWhiteboardTexture;
    tTexture* mMouseTexture;
    tProgram* mSpriteProgram;

protected:
    void createResources();
    void configureNodes();

public:
    Whiteboard();
    ~Whiteboard();

    void onInitView();
    void onResizeView(const tDimension2f& newSize);
    void onRedrawView(float time);

    void update(const tSGViewEvent& msg);
    void update(const tMouseEvent& msg);
};

