#include <string>

#import "AppDelegate.h"
#import "ViewController.h"

#include "Base/package.h"

#include "GCTEvent.h"
#include "GCTEventManager.h"

#import "TestFlight.h"

AppDelegate* gAppDelegateInstance = NULL;

extern std::vector<std::string> gUserListEntries;
extern std::vector<std::string> gMyInboxListEntries;
extern std::vector<std::string> gMyGroupsListEntries;
extern std::vector<std::string> gMemberListEntries;

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

#ifdef ADHOC
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
//    [TestFlight setDeviceIdentifier:[[UIDevice currentDevice] uniqueIdentifier]];
#pragma clang diagnostic pop
    [TestFlight takeOff:@"9d7d1e2c-62c3-45d9-8506-cb0a9752ca47"];
#endif

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

    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kAppDelegateInit));

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

#pragma mark -

-(void)hideAllViews
{
    self.viewController.mTabBar.selectedItem = self.viewController.mInboxTab;
    [self.viewController.mTabView setHidden:YES];
    [self.viewController.mBlockingView setHidden:YES];
}

-(void)setNavigationBarTitle:(const std::string&)newTitle
{
    [self.viewController.mTabView setHidden:NO];
    self.viewController.mNavigationItem.title = [NSString stringWithUTF8String:newTitle.c_str()];
    [self.viewController.mNavigationBar setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
}

-(void)setBlockingViewVisible:(bool)newVisible
{
    [self.viewController.mBlockingView setHidden:(newVisible) ? NO : YES];
}


-(void)startRecorder
{
    [self.viewController startRecorder];
}

-(void)stopRecorder
{
    [self.viewController stopRecorder];
}

@end
