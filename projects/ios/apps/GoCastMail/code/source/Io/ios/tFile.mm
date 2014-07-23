#ifdef __OBJC__
#import <Foundation/Foundation.h>
#endif

#include <string>

#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

static std::string GetExecutableName()
{
    return [[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleExecutable"] UTF8String];
}

static void CreatePathIfNonExistant(const std::string& newPath)
{
    @autoreleasepool
    {
        // Create the path if it doesn't exist
        NSError *error;
        [[NSFileManager defaultManager]
         createDirectoryAtPath:[NSString stringWithUTF8String:newPath.c_str()]
         withIntermediateDirectories:YES
         attributes:nil
         error:&error];
    }
}

std::string tFile::GetPathNameFromTypeImp() const
{
    @autoreleasepool
    {
        std::string result;
        
        switch (mPathType)
        {
            case tFile::kBundleDirectory:
                return std::string([[[NSBundle mainBundle] resourcePath] UTF8String]) + "/";
                break;
                
            case tFile::kDocumentsDirectory:
                result =    std::string([[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0] UTF8String]) + "/" +
                GetExecutableName() + "/";
                CreatePathIfNonExistant(result);
                return result;
                break;
                
            case tFile::kPreferencesDirectory:
                result =    std::string([[NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES) objectAtIndex:0] UTF8String]) + "/" +
                GetExecutableName() + "/";
                CreatePathIfNonExistant(result);
                return result;
                break;
                
            case tFile::kTemporaryDirectory:
                return std::string([NSTemporaryDirectory() UTF8String]) + "/";
                break;

            case tFile::kCacheDirectory:
                result =    std::string([[NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) objectAtIndex:0] UTF8String]) + "/" +
                GetExecutableName() + "/";
                CreatePathIfNonExistant(result);
                return result;
                break;

            case tFile::kRawDirectory:
                return std::string("");
                break;
        }
    }
}

tFile::tFile(const PathType& newPath, const std::string& newFilename)
: tFileImp(newPath, newFilename)
{
}

tFile::tFile(const std::string& newFilename)
: tFileImp(newFilename)
{
}

tFile::~tFile()
{
}

