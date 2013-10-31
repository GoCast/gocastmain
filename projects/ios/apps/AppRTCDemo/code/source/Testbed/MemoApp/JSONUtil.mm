#import <Foundation/Foundation.h>

#include "Base/package.h"
#include "Io/package.h"
#include "package.h"

JSONArray::JSONArray(const std::vector<std::string>& newVec)
{
    for(std::vector<std::string>::const_iterator iter = newVec.begin(); iter != newVec.end(); iter++)
    {
        push_back(*iter);
    }
}

JSONArray::operator std::vector<std::string>() const
{
    std::vector<std::string> result;

    for(JSONArray::const_iterator iter = begin(); iter != end(); iter++)
    {
        result.push_back(iter->mString);
    }

    return result;
}

JSONObject   JSONUtil::ParseObject(NSDictionary* n)
{
    JSONObject result;

    for (NSString* i in n)
    {
        std::string node_name = [i UTF8String];
        id o = [n objectForKey:i];

        if ([o isKindOfClass:[NSDictionary class]])
        {
            result[node_name] = JSONUtil::ParseObject(o);
        }
        else if ([o isKindOfClass:[NSArray class]])
        {
            result[node_name] = JSONUtil::ParseArray(o);
        }
        else if ([o isKindOfClass:[NSString class]])
        {
            result[node_name] = std::string([o UTF8String]);
        }
        else if ([o isKindOfClass:[NSNumber class]])
        {
            result[node_name] = double([o doubleValue]);
        }
        else if ([o isKindOfClass:[NSNull class]])
        {
            result[node_name] = JSONValue((void*)NULL);
        }
        else
        {
            assert(0);
        }
    }
    
    return result;
}

JSONArray    JSONUtil::ParseArray(NSArray* n)
{
    JSONArray result;

    for (id i in n)
    {
        if ([i isKindOfClass:[NSDictionary class]])
        {
            result.push_back(JSONUtil::ParseObject(i));
        }
        else if ([i isKindOfClass:[NSArray class]])
        {
            result.push_back(JSONUtil::ParseArray(i));
        }
        else if ([i isKindOfClass:[NSString class]])
        {
            result.push_back(std::string([i UTF8String]));
        }
        else if ([i isKindOfClass:[NSNumber class]])
        {
            result.push_back(double([i doubleValue]));
        }
        else if ([i isKindOfClass:[NSNull class]])
        {
            result.push_back(JSONValue((void*)NULL));
        }
        else
        {
            assert(0);
        }
    }

    return result;
}

JSONObject JSONUtil::extract(const std::string& newJSONString)
{
    NSLog(@"JSONUtil::extract: %s", newJSONString.c_str());

    JSONObject result;

    NSData *responseData = [NSData dataWithBytes:newJSONString.c_str() length:newJSONString.size()];

    NSError *error = nil;
    NSDictionary *n = [NSJSONSerialization JSONObjectWithData:responseData
                                                      options:0
                                                        error:&error];
    if (!error)
    {
        result = JSONUtil::ParseObject(n);
    }

    return result;
}

