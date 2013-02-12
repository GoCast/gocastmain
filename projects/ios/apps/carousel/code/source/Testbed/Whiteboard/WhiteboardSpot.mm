#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "Io/package.h"
#include "OpenGL/package.h"

#include "CallcastEvent.h"
#include "CallcastManager.h"

#include "Spot.h"
#include "WhiteboardSpot.h"

const tDimension2f  kSurfaceSize(500,500);
const tDimension2f  kSpotSize(300,300);

const tColor4b      kBlack  (0,0,0,255);
const tColor4b      kRed    (255,0,0,255);
const tColor4b      kBlue   (0,0,255,255);
const tColor4b      kOrange (255,165,0,255);
const tColor4b      kWhite  (255,255,255,255);

WhiteboardSpot::WhiteboardSpot(const int32_t& newID)
:   Spot(newID),
    mSurface(NULL)
{
    tSurface* surface = new tSurface(tPixelFormat::kR8G8B8A8, kSurfaceSize);
    surface->fillRect(tRectf(0,0,surface->getSize()), tColor4b(255,255,255,255));
    surface->drawLine(tPoint2f(0,0), tPoint2f(kSurfaceSize.width, kSurfaceSize.height), tColor4b(255,0,0,255));

    mSurface = surface;
}

WhiteboardSpot::~WhiteboardSpot()
{
    if (mSurface)
    {
        delete mSurface;
    }
}

tSurface* WhiteboardSpot::getSurface()
{
    return mSurface;
}

void WhiteboardSpot::replaceSurface(tSurface* newSurface)
{
    if (mSurface)
    {
        delete mSurface;
    }

    mSurface = newSurface;
}

void WhiteboardSpot::update(const CallcastEvent& msg)
{
#pragma unused(msg)

}

