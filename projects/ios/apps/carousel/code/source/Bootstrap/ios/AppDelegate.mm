//
//  HelloOpenGLAppDelegate.m
//  HelloOpenGL
//
//  Created by Ray Wenderlich on 5/24/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "AppDelegate.h"

@implementation AppDelegate
@synthesize glView=_glView;

@synthesize window=_window;

- (id)init
{
    /** If you need to do any extra app-specific initialization, you can do it here
     *  -jm
     **/
    NSHTTPCookieStorage* cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];

    [cookieStorage setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];

    self = [super init];
    return self;
}

//// this happens while we are running ( in the background, or from within our own app )
//// only valid if HelloWorld-Info.plist specifies a protocol to handle
//- (BOOL)application:(UIApplication*)application handleOpenURL:(NSURL*)url
//{
//#pragma unused(application)
//
//    if (!url) {
//        return NO;
//    }
//
//    // calls into javascript global function 'handleOpenURL'
//    NSString* jsString = [NSString stringWithFormat:@"handleOpenURL(\"%@\");", url];
//    [self.viewController.webView stringByEvaluatingJavaScriptFromString:jsString];
//
//    // all plugins will get the notification, and their handlers will be called
//    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
//
//    return YES;
//}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#pragma unused(application, launchOptions)
    // Override point for customization after application launch.
    CGRect screenBounds = [[UIScreen mainScreen] bounds];    
    self.glView = [[[OpenGLView alloc] initWithFrame:screenBounds] autorelease];
    [self.window addSubview:_glView];
    [self.window makeKeyAndVisible];
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application
{
#pragma unused(application)
    /*
     Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
     Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
     */
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
#pragma unused(application)
    /*
     Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later. 
     If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
     */
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
#pragma unused(application)
    /*
     Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
     */
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
#pragma unused(application)
    /*
     Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
     */
}

- (void)applicationWillTerminate:(UIApplication *)application
{
#pragma unused(application)
    /*
     Called when the application is about to terminate.
     Save data if appropriate.
     See also applicationDidEnterBackground:.
     */
}

- (void)dealloc
{
    [_glView release];
    [_window release];
    [super dealloc];
}

@end
