#if !defined(PLATFORM_IOS)
#import <Cocoa/Cocoa.h>
#endif

#ifdef __OBJC__
#import <Foundation/Foundation.h>
#endif

#include "Base/package.h"
#include "Math/package.h"
#include "OpenGL/package.h"

tSurface::tSurface(const std::string& filename)
: mSize(0,0), mType(tPixelFormat::kInvalid), mPtr(NULL)
{
#pragma unused(filename)
//    @autoreleasepool
//    {
//        //from http://blog.darklightstudio.com/?p=19
//        
//        //-- First we load an NSImage resource that’s bundled with the app.
//        
//        NSImage *baseImage = [NSImage imageNamed:[NSString stringWithCString:filename.c_str() encoding:NSUTF8StringEncoding]];
//
//        assert(baseImage);
//
//        //	We have to recreate the image flipped right-side up (bleh)
//        
//        NSImage *image = [[NSImage alloc] initWithSize:[baseImage size]];
//        NSRect r = NSZeroRect;
//        r.size = [baseImage size];
//
//        //Save the size for later use in libtate!
//        mSize.width   = (float)r.size.width;
//        mSize.height  = (float)r.size.height;
//        
//        [image lockFocus];
//        NSAffineTransform *t = [NSAffineTransform transform];
//        [t translateXBy:0 yBy:r.size.height];
//        [t scaleXBy:1 yBy:-1];
//        [t concat];
//        [baseImage drawAtPoint:NSZeroPoint fromRect:r operation:NSCompositeCopy fraction:1];
//        [image unlockFocus];
//
//        //-- Then we grab the raw bitmap data from the NSBitmapImageRep that is the ‘source’ of an NSImage
//        
//        NSBitmapImageRep *bitmap=[[NSBitmapImageRep alloc] initWithData:[image TIFFRepresentation]];
//        
//        [image release];
//        
//        GLubyte	 *sourcePic;
//        
//        //	Check if it has alpha (transparency)
//        // We have to know how many numbers for each pixel.
//        // A pixel can have just a white value (grayscale) or red,green,and blue values (color). It has a 4th value if it’s transparent like a png.
//        if ([bitmap hasAlpha] == YES)
//        {
//            mType = tPixelFormat::kR8G8B8A8;
//        }
//        else
//        {
//            mType = tPixelFormat::kR8G8B8;
//        }
//
//        //	NOW we actually get the data
//        NSSize imageSize = [bitmap size];
//        mBytesPerRow = (uint16_t)[bitmap bytesPerRow];
//        
//        //	This SHOULD be enough but nope
//        sourcePic = (GLubyte*) [bitmap bitmapData];
//        
//        //	We have to copy that raw data one row at a time….yay
//        mPtr = new uint8_t[(int32_t)(imageSize.height * mBytesPerRow)];
//        GLuint	i;
//        for (i = 0; i < imageSize.height; i++)
//        {
//            memcpy ( &mPtr[i * mBytesPerRow], &sourcePic[(int32_t)(imageSize.height - i - 1) * mBytesPerRow], mBytesPerRow);
//        }
//        
//        [bitmap release];
//    }
//
//    
//    
//    assert((mSize.width != 0) && (mSize.height != 0) && (mType != tPixelFormat::kInvalid) && (mPtr));
}

