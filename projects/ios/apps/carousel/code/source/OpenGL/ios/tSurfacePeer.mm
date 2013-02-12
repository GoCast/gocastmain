#ifdef __OBJC__
#import <Foundation/Foundation.h>
#import <UIKit/UIImage.h>
#endif

#include <string>

#include "Base/package.h"
#include "Math/package.h"
#include "OpenGL/package.h"

//NSURL *url = [NSURL URLWithString:path];
//NSData *data = [NSData dataWithContentsOfURL:url];
//UIImage *img = [[UIImage alloc] initWithData:data cache:NO];
//CGSize size = img.size;

tSurface::tSurface(const std::string& path, const tDimension2f& newSize)
: mSize(0,0), mType(tPixelFormat::kInvalid), mPtr(NULL)
{
    @autoreleasepool
    {
        //From: http://www.david-amador.com/2011/03/loading-images-into-opengl-in-iphone/

        NSURL *url = [NSURL URLWithString:[NSString stringWithCString:path.c_str() encoding:NSUTF8StringEncoding]];
        NSData *data = [NSData dataWithContentsOfURL:url];
        UIImage *baseImage = [[[UIImage alloc] initWithData:data] autorelease];
//        UIImage* baseImage = [UIImage imageNamed:[NSString stringWithCString:filename.c_str() encoding:NSUTF8StringEncoding]];

        assert(baseImage);

        // Get Image size
        mSize = newSize;
//        mSize.width     = CGImageGetWidth(baseImage.CGImage);
//        mSize.height    = CGImageGetHeight(baseImage.CGImage);
        mType           = tPixelFormat::kR8G8B8A8;
        mBytesPerRow    = uint16_t(4 * mSize.width);

        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        CGRect rect = CGRectMake( 0, 0, mSize.width, mSize.height );
        // Allocate memory for image
        uint8_t* imageData = (uint8_t*)malloc( size_t(mSize.height * mBytesPerRow) );
        CGContextRef imgcontext = CGBitmapContextCreate( imageData, (size_t)mSize.width, (size_t)mSize.height, 8, mBytesPerRow, colorSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big );
        CGColorSpaceRelease( colorSpace );
        CGContextClearRect( imgcontext, rect );
        CGContextTranslateCTM( imgcontext, 0, 0 );
        CGFloat white[] = { 1, 1, 1, 1 };
        CGColorRef whiteColor = CGColorCreate(colorSpace, white);
        CGContextSetFillColorWithColor( imgcontext, whiteColor);
        CGContextFillRect( imgcontext, rect );
        CGColorRelease(whiteColor);
        CGContextDrawImage( imgcontext, rect, baseImage.CGImage );

        //	We have to copy that raw data one row at a time….yay
        mPtr = new uint8_t[(int32_t)(mSize.height * mBytesPerRow)];

        memcpy(mPtr, imageData, size_t(mSize.height * mBytesPerRow));

        // Release context
        CGContextRelease(imgcontext);
        // Free Stuff
        free(imageData);
    }

    assert((mSize.width != 0) && (mSize.height != 0) && (mType != tPixelFormat::kInvalid) && (mPtr));
}

