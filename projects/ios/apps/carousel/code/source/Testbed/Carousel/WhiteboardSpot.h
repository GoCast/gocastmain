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

    void onSave(const tColor4b& nc, const float& np);
    void onMoveTo(const tPoint2f& pt);
    void onLineTo(const tPoint2f& pt);
    void onStroke();
    void onLoadImageURL(const std::string& newURL);

    void onLocalDraw(const tColor4b& newColor, const int32_t& newPenSize, const tPoint2f& newSt, const tPoint2f& newEn);

public:
    void update(const WhiteboardEvent& msg);
};

