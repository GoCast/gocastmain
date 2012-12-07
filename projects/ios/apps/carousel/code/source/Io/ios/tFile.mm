
#if !defined(PLATFORM_IOS)
#include <Cocoa/Cocoa.h>
#endif

#ifdef __OBJC__
#import <Foundation/Foundation.h>
#endif

#include "Base/package.h"
#include "Io/package.h"

std::string tFile::fileToString(const std::string& newFileName)
{
    NSString* stringFromFile = [[NSString alloc]
                                initWithContentsOfURL:
                                [NSURL fileURLWithPath:
                                 [NSString stringWithFormat:@"%@/%s",
                                  [[NSBundle mainBundle] resourcePath], newFileName.c_str()]]
                                encoding:NSUTF8StringEncoding
                                error:NULL];

    assert(stringFromFile);

    std::string result([stringFromFile UTF8String]);

    [stringFromFile release];
    
    return result;
}

