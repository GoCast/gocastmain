#pragma once

#ifdef __OBJC__
#import <UIKit/UIKit.h>
@class PrivateDelegate;
#else
#define NSURLConnection void
#define PrivateDelegate void
#endif

class URLConnection
{
public:
    std::string mURL;
    std::string mString;
    NSURLConnection*       mNSURLConnection;
    PrivateDelegate*       mDelegate;

public:
    URLConnection(const std::string& url);
    URLConnection(const std::string& url, const std::string& body);
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
    void postJSON(const std::string& newURL, const std::string& newBody);

public:
    friend class tSingleton<URLLoader>;
};

class URLLoaderEvent
{
public:
    enum EventType
    {
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
