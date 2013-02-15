#import "AppDelegate.h"
#import "ViewController.h"

#import <Cordova/CDVPlugin.h>

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
#pragma unused(application)

    NSURL* url = [launchOptions objectForKey:UIApplicationLaunchOptionsURLKey];
//    NSString* invokeString = nil;

    if (url && [url isKindOfClass:[NSURL class]]) {
//        invokeString = [url absoluteString];
        NSLog(@"HelloWorld launchOptions = %@", url);
    }

    CGRect screenBounds = [[UIScreen mainScreen] bounds];
    self.window = [[[UIWindow alloc] initWithFrame:screenBounds] autorelease];
    self.window.autoresizesSubviews = YES;

    self.viewController = [[[MainViewController alloc] init] autorelease];
    self.viewController.useSplashScreen = YES;
    self.viewController.wwwFolderName = @"www";
    self.viewController.startPage = @"index.html";
//    self.viewController.invokeString = invokeString;

    // NOTE: To control the view's frame size, override [self.viewController viewWillAppear:] in your view controller.

    // check whether the current orientation is supported: if it is, keep it, rather than forcing a rotation
    BOOL forceStartupRotation = YES;
    UIDeviceOrientation curDevOrientation = [[UIDevice currentDevice] orientation];

    if (UIDeviceOrientationUnknown == curDevOrientation) {
        // UIDevice isn't firing orientation notifications yet… go look at the status bar
        curDevOrientation = (UIDeviceOrientation)[[UIApplication sharedApplication] statusBarOrientation];
    }

    if (UIDeviceOrientationIsValidInterfaceOrientation(curDevOrientation)) {
        if ([self.viewController supportsOrientation:curDevOrientation]) {
            forceStartupRotation = NO;
        }
    }

    if (forceStartupRotation) {
        UIInterfaceOrientation newOrient;
        if ([self.viewController supportsOrientation:UIInterfaceOrientationPortrait]) {
            newOrient = UIInterfaceOrientationPortrait;
        } else if ([self.viewController supportsOrientation:UIInterfaceOrientationLandscapeLeft]) {
            newOrient = UIInterfaceOrientationLandscapeLeft;
        } else if ([self.viewController supportsOrientation:UIInterfaceOrientationLandscapeRight]) {
            newOrient = UIInterfaceOrientationLandscapeRight;
        } else {
            newOrient = UIInterfaceOrientationPortraitUpsideDown;
        }

        NSLog(@"AppDelegate forcing status bar to: %d from: %d", newOrient, curDevOrientation);
        [[UIApplication sharedApplication] setStatusBarOrientation:newOrient];
    }

    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];

    return YES;
}

// this happens while we are running ( in the background, or from within our own app )
// only valid if HelloWorld-Info.plist specifies a protocol to handle
- (BOOL)application:(UIApplication*)application handleOpenURL:(NSURL*)url
{
#pragma unused(application)

    if (!url) {
        return NO;
    }

    // calls into javascript global function 'handleOpenURL'
    NSString* jsString = [NSString stringWithFormat:@"handleOpenURL(\"%@\");", url];
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:jsString];

    // all plugins will get the notification, and their handlers will be called
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];

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
    [self.viewController.mWebLoadingView setHidden:NO];
}

-(void)hideWebLoadingView
{
    [self.viewController.mWebLoadingView setHidden:YES];
}

-(void)showLoginView
{
    [self.viewController.mLoginView setHidden:NO];
}

-(void)hideLoginView
{
    [self.viewController.mLoginView setHidden:YES];
}

-(void)showLoggingInView
{
    [self.viewController.mLoggingInView setHidden:NO];
}

-(void)hideLoggingInView
{
    [self.viewController.mLoggingInView setHidden:YES];
}

-(void)showBlankSpot
{
    [self.viewController.mBlankSpotView setHidden:NO];
}

-(void)hideBlankSpot
{
    [self.viewController.mBlankSpotView setHidden:YES];
}

static bool firstTime = true;
-(void)showWhiteboardSpot
{
    if (firstTime)
    {
        firstTime = false;

        //*** TJG: Load OpenGL View once, attach it to whiteboard screen, re-use for each spot as needed
        CGRect glBounds = CGRectMake(32, 32, 256, 256);
        self.glView = [[[OpenGLView alloc] initWithFrame:glBounds] autorelease];
        [self.viewController.mWhiteboardSpotView addSubview:_glView];
    }
    [self.viewController.mWhiteboardSpotView setHidden:NO];
}

-(void)hideWhiteboardSpot
{
    [self.viewController.mWhiteboardSpotView setHidden:YES];
}

-(void)showNicknameInUse
{
    [self.viewController.mNicknameInUseView setHidden:NO];
}

-(void)hideNicknameInUse
{
    [self.viewController.mNicknameInUseView setHidden:YES];
}

-(void)setSpotLabel:(const std::string&)newStr
{
    self.viewController.mWhiteboardSpotLabel.text = [NSString stringWithCString:newStr.c_str() encoding:NSUTF8StringEncoding];
}

-(void)showLeftSpot
{
    [self.viewController.mLeftSpot setHidden:NO];
}

-(void)hideLeftSpot
{
    [self.viewController.mLeftSpot setHidden:YES];
}

-(void)showRightSpot
{
    [self.viewController.mRightSpot setHidden:NO];
}

-(void)hideRightSpot
{
    [self.viewController.mRightSpot setHidden:YES];
}

#pragma mark -

//-(void)loadLoginScreen
//{
//    [self.viewController.mWBView setHidden:YES];
//    [self.viewController.mLoginView setHidden:NO];
////    LoginView *myView = [[[LoginView alloc] initWithFrame:self.viewController.view.bounds] autorelease];
////    [self.viewController.view addSubview:myView];
////    [myView release];
//}
//
//-(void)loadLoadingScreen
//{
//    [self.viewController.mLoginView setHidden:YES];
//    [self.viewController.mWBView setHidden:NO];
//}
//
//-(void)loadWhiteboardScreen
//{
//    CGRect glBounds = CGRectMake(10, 10, 300, 300);
//    self.glView = [[[OpenGLView alloc] initWithFrame:glBounds] autorelease];
//    [self.viewController.view addSubview:_glView];
//}

@end
