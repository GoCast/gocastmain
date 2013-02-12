#pragma once

class tTexture;

class tSurface
{
protected:
    tDimension2f        mSize;
    tPixelFormat::Type  mType;
    uint16_t            mBytesPerRow;
    uint8_t*            mPtr;

public:
    tSurface& operator=(const tSurface& origSurface);

public:
    tSurface(const std::string& path, const tDimension2f& newSize);
    tSurface(const tPixelFormat::Type& newType, const tDimension2f& newSize);
    tSurface(const tPixelFormat::Type& newType, const tSurface& origSurface);
    tSurface(const tSurface& origSurface);
    ~tSurface();

    tDimension2f    getSize() const;
    
    tColor4b        getPixel(const tPoint2f& location) const;
    void            setPixel(const tPoint2f& location, const tColor4b& newColor);

    void            drawLineWithWidth(const tPoint2f& ptA, const tPoint2f& ptB, const tColor4b& newColor, const float newPenSize);
    void            drawLineWithPen(const tPoint2f& ptA, const tPoint2f& ptB, const tColor4b& newColor, const float newPenSize);

    void            fillWhiteAlpha();
    void            copyRect(const tSurface& srcSurface, const tRectf& srcRect, const tPoint2f& dstPt);

    friend class tTexture;
};

