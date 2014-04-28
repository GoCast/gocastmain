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
    void*       mId;
    tFile       mFile;
    std::string mURL;
    std::string mString;
    NSURLConnection*       mNSURLConnection;
    PrivateDelegate*       mDelegate;
    tFileOutputStream*     mFOS;
    bool        mUseFile;
    bool        mBadResponse;

public:
    URLConnection(void* newId, const std::string& url);
    URLConnection(void* newId, const std::string& url, const tFile& newFile);
    URLConnection(void* newId, const std::string& url, const std::string& body);
    URLConnection(void* newId, const std::string& newPHP, const std::vector<std::pair<std::string, std::string> >& newParams, const tFile& newFile);
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
    void loadString(void* newId, const std::string& newURL);
    void loadFile(void* newId, const std::string& newURL, const tFile& newFile);
    void postJSON(void* newId, const std::string& newURL, const std::string& newBody);
    void postFile(void* newId, const std::string& newPHP, const std::vector<std::pair<std::string, std::string> >& newParams, const tFile& newFile);

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
    void*       mId;
    EventType   mEvent;
    std::string mURL;
    std::string mString;

public:
    URLLoaderEvent(void* newID, EventType newEvent, const std::string& newURL)
    : mId(newID), mEvent(newEvent), mURL(newURL), mString("") { }
    URLLoaderEvent(void* newID, EventType newEvent, const std::string& newURL, const std::string& newString)
    : mId(newID), mEvent(newEvent), mURL(newURL), mString(newString) { }
};
