#import <UIKit/UIKit.h>

#include "Base/package.h"

#include "package.h"

@interface PrivateDelegate : NSObject <NSURLConnectionDelegate>
{
    URLConnection* mParent;
}
- (id)initWithParent: (URLConnection*) parent;
@end

@implementation PrivateDelegate

- (id)initWithParent: (URLConnection*) parent
{
    if (self = [super init])
    {
        mParent = parent;
    }
    return self;
}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
#pragma unused(connection)
    mParent->DidReceiveResponse(response);
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
#pragma unused(connection)
    mParent->DidReceiveData(data.bytes, data.length);
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
#pragma unused(connection)
    mParent->DidFailWithError(std::string([[error description]UTF8String]));
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
#pragma unused(connection)
    mParent->DidFinishLoading();
}

@end


URLConnection::URLConnection(const std::string& url)
:   mURL(url)
{
    mDelegate = [[PrivateDelegate alloc] initWithParent: this];
    NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL: [NSURL URLWithString: [NSString stringWithUTF8String: url.c_str()]]];
    mNSURLConnection = [[NSURLConnection alloc] initWithRequest: req delegate: mDelegate];
}

URLConnection::URLConnection(const std::string& url, const std::string& body)
:   mURL(url)
{
    mDelegate = [[PrivateDelegate alloc] initWithParent: this];
    NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL: [NSURL URLWithString: [NSString stringWithUTF8String: url.c_str()]]];
    [req setHTTPMethod:@"POST"];
    [req setHTTPBody:[NSData dataWithBytes:body.c_str() length:body.size()]];
    [req setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    mNSURLConnection = [[NSURLConnection alloc] initWithRequest: req delegate: mDelegate];
}

URLConnection::~URLConnection()
{
    [mNSURLConnection release];
    [mDelegate release];
}

void URLConnection::DidReceiveResponse(const void* response)
{
#pragma unused(response)
    // Do something...
}
void URLConnection::DidReceiveData(const void* data, uint32_t len)
{
    for(uint32_t i = 0; i < len; i++)
    {
        mString += ((char*)data)[i];
    }
}
void URLConnection::DidFailWithError(const std::string& error)
{
#pragma unused(error)
    URLLoader::getInstance()->notify(URLLoaderEvent(URLLoaderEvent::kLoadedFile, mURL, mString));

    delete this;
}

void URLConnection::DidFinishLoading()
{
    URLLoader::getInstance()->notify(URLLoaderEvent(URLLoaderEvent::kLoadedFile, mURL, mString));

    delete this;
}

URLLoader::URLLoader()
{
}

void URLLoader::loadString(const std::string& newURL)
{
    NSLog(@"URLLoader::loadString: \"%s\"", newURL.c_str());

    new URLConnection(newURL);
}

void URLLoader::postJSON(const std::string& newURL, const std::string& newBody)
{
    new URLConnection(newURL, newBody);
}

