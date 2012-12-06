#include "package.h"

tPixelFormat::tPixelFormat(const tPixelFormat::Type& newType)
{
    switch (newType)
    {
        case kR8G8B8A8:
            mMask           = tColor4i(0x000000ff, 0x0000ff00, 0x00ff0000, 0xff000000);
            mShift          = tColor4b(0,8,16,24);
            mLoss           = tColor4b(0,0,0,0);
            mBitsPerPixel   = 32;
            mBytesPerPixel  = 4;
            break;

        case kR8G8B8:
            mMask           = tColor4i(0x0000ff, 0x00ff00, 0xff0000, 0x000000);
            mShift          = tColor4b(0,8,16,0);
            mLoss           = tColor4b(0,0,0,0);
            mBitsPerPixel   = 24;
            mBytesPerPixel  = 3;
            break;
            
        default:
            break;
    }
}
