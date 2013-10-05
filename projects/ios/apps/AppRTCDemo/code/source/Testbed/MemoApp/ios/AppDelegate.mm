#include <string>

#import "AppDelegate.h"
#import "ViewController.h"

#include "Base/package.h"

#include "MemoEvent.h"
#include "MemoEventManager.h"

#import "TestFlight.h"

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

#ifdef ADHOC
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    [TestFlight setDeviceIdentifier:[[UIDevice currentDevice] uniqueIdentifier]];
#pragma clang diagnostic pop
    [TestFlight takeOff:@"64bf3141-d1a6-409a-ac0c-a4b7926fc51f"];
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

    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kAppDelegateInit));

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

-(void)hideAllViews
{
    [self.viewController.mStartView setHidden:YES];
    [self.viewController.mSigningInView setHidden:YES];
    [self.viewController.mTabView setHidden:YES];
    [self.viewController.mMyInboxView setHidden:YES];
    [self.viewController.mRecordAudioView setHidden:YES];
    [self.viewController.mMyRecordingsView setHidden:YES];
    [self.viewController.mSendToGroupView setHidden:YES];
    [self.viewController.mPlayRecordingView setHidden:YES];
}

-(void)setStartScreenVisible:(bool)newVisible
{
    [self.viewController.mStartView setHidden:(newVisible) ? NO : YES];
}

-(void)setSigningInScreenVisible:(bool)newVisible
{
    [self.viewController.mSigningInView setHidden:(newVisible) ? NO : YES];
}

-(void)setMyInboxScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    self.viewController.mTabBar.selectedItem = self.viewController.mInboxTab;
    [self.viewController.mMyInboxView setHidden:(newVisible) ? NO : YES];
}

-(void)setRecordAudioScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? YES : NO];
    self.viewController.mTabBar.selectedItem = self.viewController.mNewMemoTab;
    [self.viewController.mRecordAudioView setHidden:(newVisible) ? NO : YES];
}

-(void)setMyRecordingsScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    self.viewController.mTabBar.selectedItem = self.viewController.mMemosTab;
    [self.viewController.mMyRecordingsView setHidden:(newVisible) ? NO : YES];
}

-(void)setSendToGroupScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    [self.viewController.mSendToGroupView setHidden:(newVisible) ? NO : YES];
}

-(void)setPlayRecordingScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? YES : NO];
    [self.viewController.mPlayRecordingView setHidden:(newVisible) ? NO : YES];
}

-(void)setStartRecordingButtonEnabled:(bool)newEnabled
{
    [self.viewController.mStartRecordingButton setEnabled:(newEnabled ? YES : NO)];
    self.viewController.mStartRecordingButton.alpha = (newEnabled ? 1.0f : 0.4f);
}

-(void)setStopRecordingButtonEnabled:(bool)newEnabled
{
    [self.viewController.mStopRecordingButton setEnabled:(newEnabled ? YES : NO)];
    self.viewController.mStopRecordingButton.alpha = (newEnabled ? 1.0f : 0.4f);
}

-(void)setRecordingStatusLabel:(const std::string&)newStatus
{
    self.viewController.mRecordingStatusLabel.text = [NSString stringWithUTF8String:newStatus.c_str()];
}

@end
