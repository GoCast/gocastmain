#pragma once

#include <stdint.h>

class tPixelFormat
{
public:
    enum Type           //Based on Hints from DirectX's DXGI_FORMAT enum
    {
        kInvalid = 0,
        kR8G8B8A8,
        kR8G8B8,
        kR5G6B5,
        kR5G5B5A1,
        kR4G4B4A4,
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

