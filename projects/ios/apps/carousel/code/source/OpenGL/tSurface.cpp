#include "Base/package.h"
#include "Math/package.h"
#include "OpenGL/package.h"

tSurface& tSurface::operator=(const tSurface& origSurface)
{
    if (this != &origSurface)
    {
        delete [] mPtr;

        mSize           = origSurface.mSize;
        mType           = origSurface.mType;
        mBytesPerRow    = origSurface.mBytesPerRow;

        mPtr = new uint8_t[(int32_t)(origSurface.mSize.height * mBytesPerRow)];

        assert(mPtr);

        memcpy(mPtr, origSurface.mPtr, (size_t)(origSurface.mSize.height * mBytesPerRow));
    }

    return *this;
}

//TODO: This might be okay, I dunno?!
tSurface::tSurface(const tPixelFormat::Type& newType, const tDimension2f& newSize)
: mSize(newSize), mType(newType)
{
    assert(newSize.width > 0 && newSize.height > 0);
    assert(newType != tPixelFormat::kInvalid);

    mBytesPerRow = uint16_t(tPixelFormat(newType).mBytesPerPixel * newSize.width);
    if ((mBytesPerRow & 0x3) != 0)
    {
        mBytesPerRow = (mBytesPerRow & ~0x3) + 4;
    }
    
    mPtr = new uint8_t[(int32_t)(newSize.height * mBytesPerRow)];
    
    assert(mPtr);
}

tSurface::tSurface(const tPixelFormat::Type& newType, const tSurface& origSurface)
: mSize(origSurface.mSize), mType(newType)
{
    assert(origSurface.mSize.width > 0 && origSurface.mSize.height > 0);
    assert(newType != tPixelFormat::kInvalid);

    mBytesPerRow = uint16_t(tPixelFormat(newType).mBytesPerPixel * origSurface.mSize.width);
    if ((mBytesPerRow & 0x3) != 0)
    {
        mBytesPerRow = (mBytesPerRow & ~0x3) + 4;
    }

    mPtr = new uint8_t[(int32_t)(origSurface.mSize.height * mBytesPerRow)];

    assert(mPtr);

    if (newType == origSurface.mType)
    {
        memcpy(mPtr, origSurface.mPtr, (size_t)(origSurface.mSize.height * mBytesPerRow));
    }
    else
    {
        tPoint2f point;
        for (point.y = 0; point.y < mSize.height; point.y++)
        {
            for (point.x = 0; point.x < mSize.width; point.x++)
            {
                setPixel(point, origSurface.getPixel(point));
            }
        }
    }
}

tSurface::tSurface(const tSurface& origSurface)
: mSize(origSurface.mSize), mType(origSurface.mType), mBytesPerRow(origSurface.mBytesPerRow)
{
    mPtr = new uint8_t[(int32_t)(origSurface.mSize.height * mBytesPerRow)];

    assert(mPtr);
    
    memcpy(mPtr, origSurface.mPtr, (size_t)(origSurface.mSize.height * mBytesPerRow));
}

tSurface::~tSurface()
{
    if (mPtr)
    {
        delete[] mPtr;
    }
}

tDimension2f tSurface::getSize() const
{
    return mSize;
}

tColor4b tSurface::getPixel(const tPoint2f& location) const
{
    if (tRectf(0,0, mSize).contains(location))
    {
        tPixelFormat pixelFormat(mType);
        
        uint32_t offset = uint32_t(location.y * mBytesPerRow + location.x * pixelFormat.mBytesPerPixel);
        uint32_t value = 0;

        assert(pixelFormat.mBytesPerPixel && pixelFormat.mBytesPerPixel < 5);

        //Note: In this switch, cases fall into each other.
        switch (pixelFormat.mBytesPerPixel)
        {
            case 4: value += (uint32_t)(mPtr[offset + 3] << 24);
            case 3: value += (uint32_t)(mPtr[offset + 2] << 16);
            case 2: value += (uint32_t)(mPtr[offset + 1] << 8);
            case 1: value += mPtr[offset];
            default: break;
        }

        return tColor4b(uint8_t(uint8_t((value & pixelFormat.mMask.r) >> pixelFormat.mShift.r) << pixelFormat.mLoss.r),
                        uint8_t(uint8_t((value & pixelFormat.mMask.g) >> pixelFormat.mShift.g) << pixelFormat.mLoss.g),
                        uint8_t(uint8_t((value & pixelFormat.mMask.b) >> pixelFormat.mShift.b) << pixelFormat.mLoss.b),
                        uint8_t(uint8_t((value & pixelFormat.mMask.a) >> pixelFormat.mShift.a) << pixelFormat.mLoss.a));
    }

    return tColor4b(0,0,0,0);
}

void tSurface::setPixel(const tPoint2f& location, const tColor4b& newColor)
{
    if (tRectf(0,0, mSize).contains(location))
    {
        tPixelFormat pixelFormat(mType);

        uint32_t offset = uint32_t(location.y * mBytesPerRow + location.x * pixelFormat.mBytesPerPixel);
        uint32_t value = (uint32_t(uint8_t(newColor.r >> pixelFormat.mLoss.r) << pixelFormat.mShift.r) & pixelFormat.mMask.r) |
                        (uint32_t(uint8_t(newColor.g >> pixelFormat.mLoss.g) << pixelFormat.mShift.g) & pixelFormat.mMask.g) |
                        (uint32_t(uint8_t(newColor.b >> pixelFormat.mLoss.b) << pixelFormat.mShift.b) & pixelFormat.mMask.b) |
                        (uint32_t(uint8_t(newColor.a >> pixelFormat.mLoss.a) << pixelFormat.mShift.a) & pixelFormat.mMask.a);

        assert(pixelFormat.mBytesPerPixel && pixelFormat.mBytesPerPixel < 5);

        //Note: In this switch, cases fall into each other.
        switch (pixelFormat.mBytesPerPixel)
        {
            case 4: mPtr[offset + 3]    = (value & 0xff000000) >> 24;
            case 3: mPtr[offset + 2]    = (value & 0xff0000) >> 16;
            case 2: mPtr[offset + 1]    = (value & 0xff00) >> 8;
            case 1: mPtr[offset]        = value & 0xff;
            default: break;
        }
    }
}

void tSurface::drawLineWithWidth(const tPoint2f& ptA, const tPoint2f& ptB, const tColor4b& newColor, const float newPenSize)
{
    float dx = fabsf(ptB.x - ptA.x);
    float dy = fabsf(ptB.y - ptA.y);

    float sx = (ptA.x < ptB.x) ? 1 : -1;
    float sy = (ptA.y < ptB.y) ? 1 : -1;

    float err = dx - dy;
    float e2;

    tPoint2f iterPt = ptA;
    bool done = false;
    while(!done)
    {
        for (int i = 0; i < newPenSize; i++)
        {
            setPixel(tPoint2f(iterPt.x + i, iterPt.y), newColor);
        }
        done = (iterPt == ptB);
        e2 = 2 * err;
        if (e2 > -dy)
        {
            err -= dy;
            iterPt.x += sx;
        }
        if (e2 < dx)
        {
            err += dx;
            iterPt.y += sy;
        }
    }
}

void tSurface::drawLineWithPen(const tPoint2f& ptA, const tPoint2f& ptB, const tColor4b& newColor, const float newPenSize)
{
    for(int j = 0; j < newPenSize; j++)
    {
        tPoint2f offset = tPoint2f(0, j - (int)(newPenSize / 2.0f));
        drawLineWithWidth(ptA + offset, ptB + offset, newColor, newPenSize);
    }
}

void tSurface::fillWhiteAlpha()
{
    memset(mPtr, 0xff, mBytesPerRow * (uint32_t)mSize.height);
}

void tSurface::copyRect(const tSurface& srcSurface, const tRectf& srcRect, const tPoint2f& dstPt)
{
    tPoint2f index;

    for (index.y = 0; index.y < srcRect.size.height; index.y++)
    {
        for (index.x = 0; index.x < srcRect.size.width; index.x++)
        {
            setPixel(dstPt + index, srcSurface.getPixel(srcRect.location + index));
        }
    }
}
