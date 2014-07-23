#import <Foundation/Foundation.h>

#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"
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

std::string JSONValue::toString()
{
    switch (mType)
    {
        case kInvalid:
            assert(0);
            break;
        case kString:
            return mString;
            break;
        case kNumber:
        {
            char buf[16];
            sprintf(buf, "%lf", mNumber);
            return buf;
        }
            break;
        case kJSONObject:
            return JSONUtil::compact(mObject);
            break;
        case kJSONArray:
        {
            size_t len = mArray.size();
            std::string sb;

            for (size_t i = 0; i < len; i += 1)
            {
                if (i > 0)
                {
                    sb += ',';
                }
                sb += mArray[i].toString();
            }

            return '[' + sb + ']';
        }
            break;
        case kTrue:
            return "true";
            break;
        case kFalse:
            return "false";
            break;
        case kNull:
            return "null";
            break;
    }

    return "";
}


NSMutableDictionary* JSONUtil::JSONObjectToNSDictionary(const JSONObject& n)
{
    NSMutableDictionary* result = [[[NSMutableDictionary alloc] init] autorelease];

    for(JSONObject::const_iterator i = n.begin(); i != n.end(); i++)
    {
        NSString* key = [NSString stringWithUTF8String:i->first.c_str()];
        switch(i->second.mType)
        {
            case JSONValue::kJSONObject:    [result setObject:JSONObjectToNSDictionary(i->second.mObject) forKey:key]; break;
            case JSONValue::kJSONArray:     [result setObject:JSONArrayToNSArray(i->second.mArray) forKey:key]; break;
            case JSONValue::kString:        [result setObject:[NSString stringWithUTF8String:i->second.mString.c_str()] forKey:key]; break;
            case JSONValue::kNumber:        [result setObject:[NSNumber numberWithDouble:i->second.mNumber] forKey:key]; break;
            case JSONValue::kNull:          [result setObject:[[[NSNull alloc] init] autorelease] forKey:key]; break;
            case JSONValue::kTrue:          [result setObject:@"true" forKey:key]; break;
            case JSONValue::kFalse:         [result setObject:@"false" forKey:key]; break;
            default:
                break;
        }
    }

    return result;
}

NSMutableArray* JSONUtil::JSONArrayToNSArray(const JSONArray& n)
{
    NSMutableArray* result = [[[NSMutableArray alloc] init] autorelease];

    for(size_t i = 0; i < n.size(); i++)
    {
        switch(n[i].mType)
        {
            case JSONValue::kJSONObject:    [result addObject:JSONObjectToNSDictionary(n[i].mObject)]; break;
            case JSONValue::kJSONArray:     [result addObject:JSONArrayToNSArray(n[i].mArray)]; break;
            case JSONValue::kString:        [result addObject:[NSString stringWithUTF8String:n[i].mString.c_str()]]; break;
            case JSONValue::kNumber:        [result addObject:[NSNumber numberWithDouble:n[i].mNumber]]; break;
            case JSONValue::kNull:          [result addObject:[[[NSNull alloc] init] autorelease]]; break;
            case JSONValue::kTrue:          [result addObject:@"true"]; break;
            case JSONValue::kFalse:         [result addObject:@"false"]; break;
            default:
                break;
        }
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

std::string JSONUtil::compact(const JSONObject& newJSONObject)
{
    std::string result;

    NSDictionary* n = JSONObjectToNSDictionary(newJSONObject);

    NSError *error = nil;
    NSData* d = [NSJSONSerialization dataWithJSONObject:n options:0 error:&error];

    if (!error)
    {
        result = [[[[NSString alloc] initWithData:d encoding:NSUTF8StringEncoding] autorelease] UTF8String];
    }

    NSLog(@"JSONUtil::compact: %s", result.c_str());

    return result;
}

