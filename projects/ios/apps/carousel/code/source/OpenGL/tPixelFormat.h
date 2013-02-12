#pragma once

class tPixelFormat
{
public:
    enum Type
    {
        kInvalid = 0,
        kR8G8B8A8,
        kR8G8B8,
    };

public:
    tColor4i    mMask;
    tColor4b    mShift;
    tColor4b    mLoss;
    uint8_t     mBitsPerPixel;
    uint8_t     mBytesPerPixel;

public:
    tPixelFormat(const tPixelFormat::Type& newType);
};

