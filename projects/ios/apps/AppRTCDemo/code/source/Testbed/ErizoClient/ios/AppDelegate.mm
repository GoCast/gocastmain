#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"

#import "AppDelegate.h"
#import "ViewController.h"

AppDelegate* gAppDelegateInstance = NULL;

@implementation AppDelegate

@synthesize window, viewController;

- (id)init
{
    /** If you need to do any extra app-specific initialization, you can do it here
     *  -jm
     **/
    NSHTTPCookieStorage* cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];

    [cookieStorage setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];

    self = [super init];

    gAppDelegateInstance = self;

    return self;
}

#pragma mark UIApplicationDelegate implementation

/**
 * This is main kick off after the app inits, the views and Settings are setup here. (preferred - iOS4 and up)
 */
- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
#pragma unused(application, launchOptions)

    CGRect screenBounds = [[UIScreen mainScreen] bounds];
    self.window = [[[UIWindow alloc] initWithFrame:screenBounds] autorelease];
    self.window.autoresizesSubviews = YES;


//    if ([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone)
//    {
        self.viewController = [[[MainViewController alloc] initWithNibName:@"MainViewController" bundle:nil] autorelease];
//    }

    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];

    return YES;
}

- (NSUInteger)application:(UIApplication*)application supportedInterfaceOrientationsForWindow:(UIWindow*)window
{
#pragma unused(application, window)

    // iPhone doesn't support upside down by default, while the iPad does.  Override to allow all orientations always, and let the root view controller decide what's allowed (the supported orientations mask gets intersected).
    NSUInteger supportedInterfaceOrientations = (1 << UIInterfaceOrientationPortrait) | (1 << UIInterfaceOrientationLandscapeLeft) | (1 << UIInterfaceOrientationLandscapeRight) | (1 << UIInterfaceOrientationPortraitUpsideDown);
    
    return supportedInterfaceOrientations;
}

#pragma mark -

-(void)showWebLoadingView
{
//    [self.viewController.mWebLoadingView setHidden:NO];
}

-(void)hideWebLoadingView
{
//    [self.viewController.mWebLoadingView setHidden:YES];
}

-(std::string) getScreenName
{
    const char* result = [self.viewController.mScreenName.text UTF8String];
    return result ? result : "";
}

-(std::string) getRoomID
{
    const char* result = [self.viewController.mRoomName.text UTF8String];
    return result ? result : "";
}

-(void)setRoomID:(const std::string&)newRoomID
{
    self.viewController.mRoomName.text = [NSString stringWithUTF8String:newRoomID.c_str()];
}

-(void)setGoButtonEnabled:(bool)newEnabled
{
    [self.viewController.mRoomNameGo setEnabled:(newEnabled ? YES : NO)];
    self.viewController.mRoomNameGo.alpha = (newEnabled ? 1.0f : 0.4f);
}

#pragma mark -

@end
