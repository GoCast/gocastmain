#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "Io/package.h"
#include "OpenGL/package.h"

#include "WhiteboardEvent.h"
#include "CallcastManager.h"

#include "Spot.h"
#include "WhiteboardSpot.h"
#include "CarouselApp.h"

#include "AppDelegate.h"

const tDimension2f  kSurfaceSize(512,512);
const tDimension2f  kSpotSize(300,300);
const float         kFactor(1.0f);

const tColor4b      kBlack  (0,0,0,255);
const tColor4b      kRed    (255,0,0,255);
const tColor4b      kBlue   (0,0,255,255);
const tColor4b      kOrange (255,165,0,255);
const tColor4b      kWhite  (255,255,255,255);

extern CarouselApp gCarouselApp;

WhiteboardSpot::WhiteboardSpot(const int32_t& newID)
:   Spot(newID),
    mSurface(NULL),
    mReceivePenColor(kBlue),
    mReceivePenSize(5)
{
    tSurface* surface = new tSurface(tPixelFormat::kR8G8B8A8, kSurfaceSize);
    surface->fillWhiteAlpha();
//    surface->drawLine(tPoint2f(0,0), tPoint2f(kSurfaceSize.width, kSurfaceSize.height), tColor4b(255,0,0,255));

    mSurface = surface;

    CallcastManager::getInstance()->tSubject<const WhiteboardEvent&>::attach(this);
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

void WhiteboardSpot::onSave(const tColor4b& nc, const float& np)
{
    mReceivePenColor    = nc;
    mReceivePenSize     = np;
}

void WhiteboardSpot::onMoveTo(const tPoint2f& pt)
{
    mCurDrawPoint = pt;
}

void WhiteboardSpot::onLineTo(const tPoint2f& pt)
{
    tPoint2f A(int(mCurDrawPoint.x * kFactor), int(mCurDrawPoint.y * kFactor));
    tPoint2f B(int(pt.x * kFactor), int(pt.y * kFactor));

    mSurface->drawLineWithPen(A, B, mReceivePenColor, mReceivePenSize);

    mCurDrawPoint = pt;
}

void WhiteboardSpot::onStroke()
{
    gCarouselApp.refresh(mID);
}

void WhiteboardSpot::onLoadImageURL(const std::string& newURL)
{
    tSurface urlSurface(newURL);
    mSurface->fillWhiteAlpha();
    mSurface->copyRect(urlSurface, tRectf(0,0, urlSurface.getSize()), tPoint2f(0,0));
//    replaceSurface(new tSurface(newURL));

    gCarouselApp.refresh(mID);
}

void WhiteboardSpot::update(const WhiteboardEvent& msg)
{
    if (msg.mSpotID == mID)
    {
        switch (msg.mEvent)
        {
            case WhiteboardEvent::kSave:    onSave(msg.mColor, msg.mPenSize); break;
            case WhiteboardEvent::kMoveTo:  onMoveTo(msg.mPoint); break;
            case WhiteboardEvent::kLineTo:  onLineTo(msg.mPoint); break;
            case WhiteboardEvent::kStroke:  onStroke(); break;

            case WhiteboardEvent::kLoadImageURL: onLoadImageURL(msg.mURL); break;

            default: break;
        }
    }
}

