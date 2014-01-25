#import <UIKit/UIKit.h>

#include "Base/package.h"
#include "Io/package.h"

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
    NSHTTPURLResponse* httpResponse = (NSHTTPURLResponse*)response;
    int responseStatusCode = [httpResponse statusCode];

    mParent->DidReceiveResponse(response, responseStatusCode);
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


URLConnection::URLConnection(size_t newId, const std::string& url)
:   mId(newId),
    mFile(tFile::kTemporaryDirectory, ""),
    mURL(url),
    mUseFile(false),
    mBadResponse(true)
{
    mDelegate = [[PrivateDelegate alloc] initWithParent: this];
    NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL: [NSURL URLWithString: [NSString stringWithUTF8String: url.c_str()]]];
    mNSURLConnection = [[NSURLConnection alloc] initWithRequest: req delegate: mDelegate];
}

URLConnection::URLConnection(size_t newId, const std::string& url, const tFile& newFile)
:   mId(newId),
    mFile(newFile),
    mURL(url),
    mUseFile(true),
    mBadResponse(true)
{
    mDelegate = [[PrivateDelegate alloc] initWithParent: this];
    NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL: [NSURL URLWithString: [NSString stringWithUTF8String: url.c_str()]]];
    mNSURLConnection = [[NSURLConnection alloc] initWithRequest: req delegate: mDelegate];

    mFOS = new tFileOutputStream(mFile);
}

URLConnection::URLConnection(size_t newId, const std::string& url, const std::string& body)
:   mId(newId),
    mFile(tFile::kTemporaryDirectory, ""),
    mURL(url),
    mUseFile(false),
    mBadResponse(true)
{
    mDelegate = [[PrivateDelegate alloc] initWithParent: this];
    NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL: [NSURL URLWithString: [NSString stringWithUTF8String: url.c_str()]]];
    [req setHTTPMethod:@"POST"];
    [req setHTTPBody:[NSData dataWithBytes:body.c_str() length:body.size()]];
    [req setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    mNSURLConnection = [[NSURLConnection alloc] initWithRequest: req delegate: mDelegate];
}

URLConnection::URLConnection(size_t newId, const std::string& newPHP, const std::vector<std::pair<std::string, std::string> >& newParams, const tFile& newFile)
:   mId(newId),
    mFile(tFile::kTemporaryDirectory, ""),
    mURL(newPHP),
    mUseFile(false),
    mBadResponse(true)
{
    mDelegate = [[PrivateDelegate alloc] initWithParent: this];

    // create request
    NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL: [NSURL URLWithString: [NSString stringWithUTF8String: newPHP.c_str()]]];
    [req setCachePolicy:NSURLRequestReloadIgnoringLocalCacheData];
    [req setHTTPShouldHandleCookies:NO];
    [req setTimeoutInterval:30];
    [req setHTTPMethod:@"POST"];

    // set Content-Type in HTTP header
    NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@", @"abc123"];
    [req setValue:contentType forHTTPHeaderField: @"Content-Type"];

    // post body
    NSMutableData *body = [NSMutableData data];

    // add params (all params are strings)
    for (size_t i = 0; i < newParams.size(); i++)
    {
        NSString* key   = [NSString stringWithUTF8String:newParams[i].first.c_str()];
        NSString* value = [NSString stringWithUTF8String:newParams[i].second.c_str()];

        [body appendData:[[NSString stringWithFormat:@"--%@\r\n", @"abc123"] dataUsingEncoding:NSUTF8StringEncoding]];
        [body appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n", key] dataUsingEncoding:NSUTF8StringEncoding]];
        [body appendData:[[NSString stringWithFormat:@"%@\r\n", value] dataUsingEncoding:NSUTF8StringEncoding]];
    }

    // add file data
    NSData *fileData = [NSData dataWithContentsOfFile:[NSString stringWithUTF8String:newFile.GetFullPath().c_str()]];
    if (fileData)
    {
        [body appendData:[[NSString stringWithFormat:@"--%@\r\n", @"abc123"] dataUsingEncoding:NSUTF8StringEncoding]];

        [body appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"filename\"; filename=\"%s\"\r\n",
                           newFile.getFilename().c_str()]
                          dataUsingEncoding:NSUTF8StringEncoding]];
        [body appendData:[[NSString stringWithUTF8String:"Content-Type: application/octet-stream\r\n\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];

        [body appendData:fileData];
        [body appendData:[[NSString stringWithFormat:@"\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];
    }

    [body appendData:[[NSString stringWithFormat:@"--%@--\r\n", @"abc123"] dataUsingEncoding:NSUTF8StringEncoding]];

    // setting the body of the post to the reqeust
    [req setHTTPBody:body];

    // set the content-length
    NSString *postLength = [NSString stringWithFormat:@"%d", [body length]];
    [req setValue:postLength forHTTPHeaderField:@"Content-Length"];

    mNSURLConnection = [[NSURLConnection alloc] initWithRequest: req delegate: mDelegate];
}

URLConnection::~URLConnection()
{
    [mNSURLConnection release];
    [mDelegate release];
}

void URLConnection::DidReceiveResponse(const void* response, int responseCode)
{
#pragma unused(response)
    mBadResponse = (responseCode != 200);
}

void URLConnection::DidReceiveData(const void* data, uint32_t len)
{
    if (mUseFile)
    {
        mFOS->write(data, len);
    }
    else
    {
        for(uint32_t i = 0; i < len; i++)
        {
            mString += ((char*)data)[i];
        }
    }
}
void URLConnection::DidFailWithError(const std::string& error)
{
#pragma unused(error)
    if (mUseFile)
    {
        delete mFOS;
    }
    URLLoader::getInstance()->notify(URLLoaderEvent(mId, URLLoaderEvent::kLoadFail, mURL, mString));

    delete this;
}

void URLConnection::DidFinishLoading()
{
    if (mUseFile)
    {
        delete mFOS;
        URLLoader::getInstance()->notify(URLLoaderEvent(mId, mBadResponse ?  URLLoaderEvent::kLoadFail : URLLoaderEvent::kLoadedFile, mURL, mString));
    }
    else
    {
        URLLoader::getInstance()->notify(URLLoaderEvent(mId, mBadResponse ?  URLLoaderEvent::kLoadFail : URLLoaderEvent::kLoadedString, mURL, mString));
    }

    delete this;
}

URLLoader::URLLoader()
{
}

void URLLoader::loadString(size_t newId, const std::string& newURL)
{
    NSLog(@"URLLoader::loadString: \"%s\"", newURL.c_str());

    new URLConnection(newId, newURL);
}

void URLLoader::loadFile(size_t newId, const std::string& newURL, const tFile& newFile)
{
    NSLog(@"URLLoader::loadFile: \"%s\"", newURL.c_str());

    new URLConnection(newId, newURL, newFile);
}

void URLLoader::postJSON(size_t newId, const std::string& newURL, const std::string& newBody)
{
    new URLConnection(newId, newURL, newBody);
}

void URLLoader::postFile(size_t newId, const std::string& newPHP, const std::vector<std::pair<std::string, std::string> >& newParams, const tFile& newFile)
{
    new URLConnection(newId, newPHP, newParams, newFile);
}
