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
    tFile       mFile;
    std::string mURL;
    std::string mString;
    NSURLConnection*       mNSURLConnection;
    PrivateDelegate*       mDelegate;
    tFileOutputStream*     mFOS;
    bool        mUseFile;

public:
    URLConnection(const std::string& url);
    URLConnection(const std::string& url, const tFile& newFile);
    URLConnection(const std::string& url, const std::string& body);
    URLConnection(const std::string& newPHP, const std::vector<std::pair<std::string, std::string> >& newParams, const tFile& newFile);
    ~URLConnection();

    void DidReceiveResponse(const void* response);
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
    void loadString(const std::string& newURL);
    void loadFile(const std::string& newURL, const tFile& newFile);
    void postJSON(const std::string& newURL, const std::string& newBody);
    void postFile(const std::string& newPHP, const std::vector<std::pair<std::string, std::string> >& newParams, const tFile& newFile);

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
    EventType   mEvent;
    std::string mURL;
    std::string mString;

public:
    URLLoaderEvent(EventType newEvent, const std::string& newURL)
    : mEvent(newEvent), mURL(newURL), mString("") { }
    URLLoaderEvent(EventType newEvent, const std::string& newURL, const std::string& newString)
    : mEvent(newEvent), mURL(newURL), mString(newString) { }
};
