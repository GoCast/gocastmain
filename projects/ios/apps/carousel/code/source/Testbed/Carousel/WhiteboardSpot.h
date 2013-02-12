#pragma once

class WhiteboardSpot
:   public Spot,
    public tObserver<const WhiteboardEvent&>
{
protected:
    tSurface* mSurface;
    tPoint2f  mCurDrawPoint;
    tColor4b  mReceivePenColor;
    float     mReceivePenSize;

public:
    WhiteboardSpot(const int32_t& newID);
    virtual ~WhiteboardSpot();

    tSurface*   getSurface();
    void        replaceSurface(tSurface* newSurface);

    void onSave(const tColor4b& nc, const float& np);
    void onMoveTo(const tPoint2f& pt);
    void onLineTo(const tPoint2f& pt);
    void onStroke();
    void onLoadImageURL(const std::string& newURL);
    
public:
    void update(const WhiteboardEvent& msg);
};

