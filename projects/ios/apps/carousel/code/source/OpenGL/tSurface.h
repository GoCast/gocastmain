#pragma once

class tTexture;

class tSurface
{
protected:
    tDimension2f        mSize;
    tPixelFormat::Type  mType;
    uint16_t            mBytesPerRow;
    uint8_t*            mPtr;

protected:
//    void MakeSurfaceCopyUpsideDown(tSurface& dst, const tSurface& src);

public:
    tSurface& operator=(const tSurface& origSurface);

public:
    tSurface(const std::string& path);
    tSurface(const tPixelFormat::Type& newType, const tDimension2f& newSize);
    tSurface(const tPixelFormat::Type& newType, const tSurface& origSurface);
    tSurface(const tTexture& newTexture);
    tSurface(const tSurface& origSurface);
    ~tSurface();

    tDimension2f    getSize() const;
    
    tColor4b        getPixel(const tPoint2f& location) const;
    void            setPixel(const tPoint2f& location, const tColor4b& newColor);

    void            drawLine(const tPoint2f& ptA, const tPoint2f& ptB, const tColor4b& newColor);
    void            drawLineWithWidth(const tPoint2f& ptA, const tPoint2f& ptB, const tColor4b& newColor, const float newPenSize);
    void            drawLineWithPen(const tPoint2f& ptA, const tPoint2f& ptB, const tColor4b& newColor, const float newPenSize);
    void            drawRect(const tRectf& newRect, const tColor4b& newColor);

    void            fillRect(const tRectf& newRect, const tColor4b& newColor);
    void            copyRect(const tSurface& srcSurface, const tRectf& srcRect, const tPoint2f& dstPt);

    friend class tTexture;
};

