#pragma once

@class NSDictionary;
@class NSArray;

class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;
//typedef std::vector<JSONValue> JSONArray;

class JSONArray
: public std::vector<JSONValue>
{
public:
    JSONArray() { }
    JSONArray(const std::vector<std::string>& newVec);
    operator std::vector<std::string>() const;
};

class JSONValue
{
public:
    enum Type
    {
        kInvalid = 0,
        kString,
        kNumber,
        kJSONObject,
        kJSONArray,
        kTrue,
        kFalse,
        kNull,
    };

public:
    Type mType;
    std::string mString;
    double      mNumber;
    JSONObject  mObject;
    JSONArray   mArray;

protected:
    static std::string quote(const std::string& string)
    {
        if (string.length() == 0)
        {
            return "\"\"";
        }

        char        b;
        char        c = 0;
        size_t      i;
        size_t      len = string.size();
        std::string sb;
        std::string t;

        sb += '"';

        for (i = 0; i < len; i += 1)
        {
            b = c;
            c = string[i];
            switch (c)
            {
                case '\\':
                case '"':
                    sb += '\\';
                    sb += c;
                    break;
                case '/':
                    if (b == '<') {
                        sb += '\\';
                    }
                    sb += c;
                    break;
                case '\b': sb += "\\b"; break;
                case '\t': sb += "\\t"; break;
                case '\n': sb += "\\n"; break;
                case '\f': sb += "\\f"; break;
                case '\r': sb += "\\r"; break;
                default:
                    //TODO: hack -- no idea what's going on here, unicode or something?
                    //            if (c < ' ')
                    //            {
                    //                t = "000" + Integer.toHexString(c);
                    //                sb.append("\\u" + t.substring(t.length() - 4));
                    //            } else {
                    sb += c;
                    //            }
            }
        }
        sb += '"';
        return sb;
    }

public:
    JSONValue() : mType(kInvalid) { }
    JSONValue(const std::string& newString) : mType(kString), mString(newString) { }
    JSONValue(const double& newNumber) : mType(kNumber), mNumber(newNumber) { }
    JSONValue(const JSONObject& newObject) : mType(kJSONObject), mObject(newObject) { }
    JSONValue(const JSONArray& newArray) : mType(kJSONArray), mArray(newArray) { }
    JSONValue(bool newBool) : mType(newBool ? kTrue : kFalse) { }
    JSONValue(void*) : mType(kNull) { }

    bool operator == (const JSONValue b) const
    {
        if (mType == b.mType)
        {
            switch (mType)
            {
                case kString:       return mString == b.mString; break;
                case kNumber:       return mNumber == b.mNumber; break;
                case kJSONObject:   return mObject == b.mObject; break;
                case kJSONArray:    return mArray == b.mArray; break;
                default:
                    break;
            }
        }
        return mType == b.mType;
    }

    bool operator < (const JSONValue b) const
    {
        if (mType == b.mType)
        {
            switch (mType)
            {
                case kString:       return mString < b.mString; break;
                case kNumber:       return mNumber < b.mNumber; break;
                case kJSONObject:   return mObject < b.mObject; break;
                case kJSONArray:    return mArray < b.mArray; break;
                default:
                    break;
            }
        }
        return mType < b.mType;
    }

    std::string toString()
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
            {
                std::set<std::string> keys;

                std::map<std::string, JSONValue>::const_iterator kiter;

                for(kiter = mObject.begin(); kiter != mObject.end(); kiter++)
                {
                    keys.insert(kiter->first);
                }

                std::string sb = "{";

                std::set<std::string>::iterator iter;
                JSONValue val;
                for (iter = keys.begin(); iter != keys.end(); iter++)
                {
                    if (sb.length() > 1)
                    {
                        sb += ',';
                    }
                    sb += quote(*iter);
                    sb += ':';

                    val = mObject[*iter];

                    if (val.mType == JSONValue::kString)
                    {
                        sb += quote(mObject[*iter].toString());
                    }
                    else
                    {
                        sb += mObject[*iter].toString();
                    }
                }

                sb += '}';

                return sb;
            }
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
};

class JSONUtil
{
protected:
    static JSONObject   ParseObject(NSDictionary* n);
    static JSONArray    ParseArray(NSArray* n);

public:
    static JSONObject extract(const std::string& newJSONString);
};

