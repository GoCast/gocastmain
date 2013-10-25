#import <Foundation/Foundation.h>

#include "Base/package.h"
#include "Io/package.h"
#include "package.h"

JSONObject   JSONUtil::ParseObject(JSONNODE* n)
{
    JSONObject result;

    for (JSONNODE_ITERATOR i = json_begin(n); i != json_end(n); i++)
    {
        json_char* node_name = json_name(*i);

        switch(json_type(*i))
        {
            case JSON_NODE:     result[node_name] = JSONUtil::ParseObject(*i); break;
            case JSON_ARRAY:    result[node_name] = JSONUtil::ParseArray(*i); break;
            case JSON_STRING:   result[node_name] = std::string(json_as_string(*i)); break;
            case JSON_NUMBER:   result[node_name] = json_as_float(*i); break;
            case JSON_BOOL:     result[node_name] = json_as_bool(*i) ? true : false; break;
            case JSON_NULL:     result[node_name] = JSONValue((void*)NULL); break;

            default:
                assert(0);
                break;
        }
    }

    return result;
}

JSONArray    JSONUtil::ParseArray(JSONNODE* n)
{
    JSONArray result;

    for (JSONNODE_ITERATOR i = json_begin(n); i != json_end(n); i++)
    {
        switch(json_type(*i))
        {
            case JSON_NODE:     result.push_back(JSONUtil::ParseObject(*i)); break;
            case JSON_ARRAY:    result.push_back(JSONUtil::ParseArray(*i)); break;
            case JSON_STRING:   result.push_back(std::string(json_as_string(*i))); break;
            case JSON_NUMBER:   result.push_back(json_as_float(*i)); break;
            case JSON_BOOL:     result.push_back(json_as_bool(*i) ? true : false); break;
            case JSON_NULL:     result.push_back(JSONValue((void*)NULL)); break;

            default:
                assert(0);
                break;
        }
    }
    
    return result;
}

JSONObject JSONUtil::extract(const std::string& newJSONString)
{
    NSLog(@"JSONUtil::extract: %s", newJSONString.c_str());

    JSONObject result;

    JSONNODE* n = json_parse(newJSONString.c_str());

    result = ParseObject(n);

    json_delete(n);

    return result;
}

std::vector<std::string> JSONUtil::explodeCommas(const std::string& newString)
{
    std::vector<std::string> result;
    std::string temp;

    temp = "";
    for(size_t i = 0; i < newString.size(); i++)
    {
        if (newString[i] != ',')
        {
            temp += newString[i];
        }
        else
        {
            result.push_back(temp);
            temp = "";
        }
    }

    if (!temp.empty())
    {
        result.push_back(temp);
    }

    return result;
}
