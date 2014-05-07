#pragma once

#include <map>
#include <string>
#include <set>

#include "JSONUtil.h"

class I18N
: public tSingleton<I18N>
{
protected:
    std::map<const std::string, std::map<const std::string, std::string> >  mCache;
    std::string mLocale;

protected:
    static std::string toLower(const std::string& s);

protected:
    I18N();
public:
    ~I18N();

    void setLocale(const std::string& newLocale);
    std::string getLocale() const;

    bool exists(const std::string& newLocale, const std::string& name);
    std::string store(const std::string& newLocale, const std::string& name, const std::string& obj);
    std::string retrieve(const std::string& name);

    void storeJSON(const std::string& newLocale, const JSONObject& newObject);

    friend class tSingleton<I18N>;
};

