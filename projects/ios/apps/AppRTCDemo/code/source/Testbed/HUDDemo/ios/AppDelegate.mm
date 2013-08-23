#import "AppDelegate.h"
#import "ViewController.h"

#include "Base/package.h"

#include "HUDEvent.h"
#include "HUDEventManager.h"

AppDelegate* gAppDelegateInstance = NULL;

@implementation AppDelegate

@synthesize window = mWindow;
@synthesize viewController = mViewController;

#pragma mark Constructor / Destructor

- (id)init
{
    self = [super init];

    gAppDelegateInstance = self;

    return self;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#pragma unused(application, launchOptions)
    self.window = [[[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]] autorelease];
    // Override point for customization after application launch.
    if ([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone)
    {
//        if([[UIScreen mainScreen] bounds].size.height == 568)
//        {
//            self.viewController = [[[ViewController alloc] initWithNibName:@"ViewController_iPhone5" bundle:nil] autorelease];
//        }
//        else
        {
            self.viewController = [[[ViewController alloc] initWithNibName:@"ViewController_iPhone" bundle:nil] autorelease];
        }
    }
//    else
//    {
//        self.viewController = [[[ViewController alloc] initWithNibName:@"ViewController_iPad" bundle:nil] autorelease];
//    }

    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];

    HUDEventManager::getInstance()->notify(HUDEvent(HUDEvent::kAppDelegateInit));

    return YES;
}

- (void)applicationWillTerminate:(UIApplication *)application
{
#pragma unused(application)
    tApplication::getInstance()->quit();
}

- (void)dealloc
{
    [mWindow release];
    [mViewController release];
    [super dealloc];
}

#pragma mark Suspend / Resume

- (void)applicationWillResignActive:(UIApplication *)application
{
#pragma unused(application)
    tApplication::getInstance()->suspend();
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
#pragma unused(application)
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
#pragma unused(application)
    tApplication::getInstance()->resume();
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
#pragma unused(application)
    tApplication::getInstance()->resume();
}

-(void)setLoginScreenVisible:(bool)newVisible
{
    [self.viewController.mLoginView setHidden:(newVisible) ? NO : YES];
}

-(void)setGroupMemberScreenVisible:(bool)newVisible
{
    [self.viewController.mGroupMemberView setHidden:(newVisible) ? NO : YES];
}

-(void)setInCallScreenVisible:(bool)newVisible
{
    [self.viewController.mInCallView setHidden:(newVisible) ? NO : YES];
}

-(void)setActiveModeScreenVisible:(bool)newVisible
{
    [self.viewController.mActiveModeView setHidden:(newVisible) ? NO : YES];
}

-(void)setAddMemberScreenVisible:(bool)newVisible
{
    [self.viewController.mAddMemberView setHidden:(newVisible) ? NO : YES];
}

-(void)setMakeNewGroupScreenVisible:(bool)newVisible
{
    [self.viewController.mMakeNewGroupView setHidden:(newVisible) ? NO : YES];
}

-(void)setEditGroupScreenVisible:(bool)newVisible
{
    [self.viewController.mEditGroupView setHidden:(newVisible) ? NO : YES];
}

-(void)setLiveRecordScreenVisible:(bool)newVisible
{
    [self.viewController.mLiveRecordView setHidden:(newVisible) ? NO : YES];
}

-(void)setPlaybackEmailScreenVisible:(bool)newVisible
{
    [self.viewController.mPlaybackEmailView setHidden:(newVisible) ? NO : YES];
}

@end
