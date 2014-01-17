#pragma once

#ifdef __OBJC__
#import <UIKit/UIKit.h>
@class PrivateDelegate;
#else
#define NSURLConnection void
#define PrivateDelegate void
#endif

class tFile;

class URLConnection
{
public:
    size_t      mId;
    tFile       mFile;
    std::string mURL;
    std::string mString;
    NSURLConnection*       mNSURLConnection;
    PrivateDelegate*       mDelegate;
    tFileOutputStream*     mFOS;
    bool        mUseFile;
    bool        mBadResponse;

public:
    URLConnection(size_t newId, const std::string& url);
    URLConnection(size_t newId, const std::string& url, const tFile& newFile);
    URLConnection(size_t newId, const std::string& url, const std::string& body);
    URLConnection(size_t newId, const std::string& newPHP, const std::vector<std::pair<std::string, std::string> >& newParams, const tFile& newFile, bool isAmiVoice = false);
    ~URLConnection();

    void DidReceiveResponse(const void* response, int responseCode);
    void DidReceiveData(const void* data, uint32_t len);
    void DidFailWithError(const std::string& error);
    void DidFinishLoading();
};

class URLLoaderEvent;

class URLLoader
:   public tSingleton<URLLoader>,
    public tSubject<const URLLoaderEvent&>
{
protected:
    URLLoader();

public:
    void loadString(size_t newId, const std::string& newURL);
    void loadFile(size_t newId, const std::string& newURL, const tFile& newFile);
    void postJSON(size_t newId, const std::string& newURL, const std::string& newBody);
    void postFile(size_t newId, const std::string& newPHP, const std::vector<std::pair<std::string, std::string> >& newParams, const tFile& newFile, bool isAmiVoice = false);

public:
    friend class tSingleton<URLLoader>;
};

class URLLoaderEvent
{
public:
    enum EventType
    {
        kLoadedString,
        kLoadedFile,
        kLoadFail,
    };

public:
    size_t      mId;
    EventType   mEvent;
    std::string mURL;
    std::string mString;

public:
    URLLoaderEvent(size_t newID, EventType newEvent, const std::string& newURL)
    : mId(newID), mEvent(newEvent), mURL(newURL), mString("") { }
    URLLoaderEvent(size_t newID, EventType newEvent, const std::string& newURL, const std::string& newString)
    : mId(newID), mEvent(newEvent), mURL(newURL), mString(newString) { }
};
