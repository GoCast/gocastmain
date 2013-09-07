#import "AppDelegate.h"
#import "ViewController.h"

#include <string>

#include "Base/package.h"

#include "HUDEvent.h"
#include "HUDEventManager.h"

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
    if (newVisible)
    {
        tConfirm("Do you want to make a new group?");
    }
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
    if (newVisible)
    {
        if ([MFMailComposeViewController canSendMail])
        {
            MFMailComposeViewController *mailer = [[MFMailComposeViewController alloc] init];
            mailer.mailComposeDelegate = self.viewController;
            [mailer setSubject:@"GoCast Talk Record"];
//            NSArray *toRecipients = nil; //[NSArray arrayWithObjects:[NSString stringWithUTF8String:newMailTo.c_str()], nil];
//            [mailer setToRecipients:toRecipients];
            NSString *emailBody = @"Please click here to play back the recorded call:\n\n"
            "http://gocast.it/talk/archive/2013-08-26\n\n"
            "Duration 12 min 30 sec\n\n"
            "Sent via GoCast Talk http://gocast.it/talk/";
            [mailer setMessageBody:emailBody isHTML:NO];
//            [self.viewController presentViewController:mailer animated:YES completion:nil];
            [self.viewController presentViewController:mailer animated:YES completion:^{ }];
            [mailer release];
        }
    }
}

@end
