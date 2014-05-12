#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "I18N.h"

std::string I18N::toLower(const std::string& s)
{
    std::string data = s;

    std::transform(data.begin(), data.end(), data.begin(), ::tolower);

    return data;
}

I18N::I18N()
{
    mLocale = [[[NSLocale preferredLanguages] objectAtIndex:0] UTF8String];

    if (mLocale != "ja")
    {
        mLocale = "en";
    }
}

I18N::~I18N()
{
}

void I18N::setLocale(const std::string& newLocale)
{
    mLocale = newLocale;
}

std::string I18N::getLocale() const
{
    return mLocale;
}

bool I18N::exists(const std::string& newLocale, const std::string& name)
{
    return (!mCache[newLocale].empty() && mCache[newLocale].find(toLower(name)) != mCache[newLocale].end());
}

std::string I18N::store(const std::string& newLocale, const std::string& name, const std::string& obj)
{
    assert(!exists(newLocale, name));
    mCache[newLocale][toLower(name)] = obj;

    return obj;
}

std::string I18N::retrieve(const std::string& name)
{
    if (exists(mLocale, name))
    {
        return mCache[mLocale][toLower(name)];
    }

    return name;
}

void I18N::storeJSON(const std::string& newLocale, const JSONObject& newObject)
{
    for(JSONObject::const_iterator iter = newObject.begin(); iter != newObject.end(); iter++)
    {
        store(newLocale, iter->first, iter->second.mString);
    }
}

