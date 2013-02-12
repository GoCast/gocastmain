#pragma once

class WhiteboardSpot
:   public Spot,
    public tObserver<const CallcastEvent&>
{
protected:
    tSurface* mSurface;

public:
    WhiteboardSpot(const int32_t& newID);
    virtual ~WhiteboardSpot();

    tSurface*   getSurface();
    void        replaceSurface(tSurface* newSurface);

    void update(const CallcastEvent& msg);
};

