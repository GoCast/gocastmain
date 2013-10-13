#import <Foundation/Foundation.h>

#include "Base/package.h"
#include "package.h"

std::map<std::string, std::string> JSONUtil::extract(const std::string& newJSONString)
{
    NSLog(@"JSONUtil::extract: %s", newJSONString.c_str());

    std::map<std::string, std::string> result;

    NSError *error = nil;
    NSData *responseData = [NSData dataWithBytes:newJSONString.c_str() length:newJSONString.size()];

    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:responseData
                                                         options:0
                                                           error:&error];
    assert(!error);

    for (NSString* key in json)
    {
        result[[key UTF8String]] = [[json objectForKey:key] UTF8String];
    }

    return result;
}
