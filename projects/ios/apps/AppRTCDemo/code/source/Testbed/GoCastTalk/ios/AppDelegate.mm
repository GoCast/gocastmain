#include <string>

#import "AppDelegate.h"
#import "GoCastTalkVC.h"

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

    [self.window setRootViewController:self.tabBarController];
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
    [self setNavigationButtonVisible:false];

    self.viewController.mTabBar.selectedItem = self.viewController.mInboxTab;
    [self.viewController.mTabView setHidden:YES];

    [self.viewController.mInboxView setHidden:YES];
    [self.viewController.mNewMemoView setHidden:YES];
    [self.viewController.mContactsView setHidden:YES];
    [self.viewController.mGroupsView setHidden:YES];
    [self.viewController.mSettingsView setHidden:YES];

    //mInboxView
    [self.viewController.mInboxMessageView setHidden:YES];
    [self.viewController.mRecordMessageView setHidden:YES];
    [self.viewController.mMessageHistoryView setHidden:YES];

    //mContactsView
    [self.viewController.mContactDetailsView setHidden:YES];
    [self.viewController.mEditContactsView setHidden:YES];

    //mSettingsView
    [self.viewController.mChangeRegisteredNameView setHidden:YES];

    [self.viewController.mBlockingView setHidden:YES];
}

-(void)setInboxViewVisible:(bool)newVisible
{
    [self.viewController.mInboxView setHidden:(newVisible ? NO : YES)];

    NSIndexPath *indexPath = self.viewController.mInboxTable.indexPathForSelectedRow;
    if (indexPath)
    {
        [self.viewController.mInboxTable deselectRowAtIndexPath:indexPath animated:NO];
    }
}

-(void)setNewMemoViewVisible:(bool)newVisible
{
    [self.viewController.mNewMemoView setHidden:(newVisible ? NO : YES)];

    NSIndexPath *indexPath = self.viewController.mNewMemoOptionsTable.indexPathForSelectedRow;
    if (indexPath)
    {
        [self.viewController.mNewMemoOptionsTable deselectRowAtIndexPath:indexPath animated:NO];
    }
}

-(void)setContactsViewVisible:(bool)newVisible
{
    [self.viewController.mContactsView setHidden:(newVisible ? NO : YES)];

    NSIndexPath *indexPath = self.viewController.mContactsTable.indexPathForSelectedRow;
    if (indexPath)
    {
        [self.viewController.mContactsTable deselectRowAtIndexPath:indexPath animated:NO];
    }
}

-(void)setGroupsViewVisible:(bool)newVisible
{
    [self.viewController.mGroupsView setHidden:(newVisible ? NO : YES)];
}

-(void)setSettingsViewVisible:(bool)newVisible
{
    [self.viewController.mSettingsView setHidden:(newVisible ? NO : YES)];

    NSIndexPath *indexPath = self.viewController.mSettingsTable.indexPathForSelectedRow;
    if (indexPath)
    {
        [self.viewController.mSettingsTable deselectRowAtIndexPath:indexPath animated:NO];
    }
}

//mInboxView
-(void)setInboxMessageViewVisible:(bool)newVisible
{
    [self.viewController.mInboxMessageView setHidden:(newVisible ? NO : YES)];
    [self.viewController.mInboxMessageView setContentOffset:CGPointZero animated:NO];

    NSIndexPath *indexPath = self.viewController.mInboxMessageOptionsTable.indexPathForSelectedRow;
    if (indexPath)
    {
        [self.viewController.mInboxMessageOptionsTable deselectRowAtIndexPath:indexPath animated:NO];
    }
}

-(void)setRecordMessageViewVisible:(bool)newVisible
{
    [self.viewController.mRecordMessageView setHidden:(newVisible ? NO : YES)];

    NSIndexPath *indexPath = self.viewController.mRecordMessageOptionsTable.indexPathForSelectedRow;
    if (indexPath)
    {
        [self.viewController.mRecordMessageOptionsTable deselectRowAtIndexPath:indexPath animated:NO];
    }
}

-(void)setMessageHistoryViewVisible:(bool)newVisible
{
    [self.viewController.mMessageHistoryView setHidden:(newVisible ? NO : YES)];
}

//mContactsView
-(void)setContactDetailsViewVisible:(bool)newVisible
{
    [self.viewController.mContactDetailsView setHidden:(newVisible ? NO : YES)];

    NSIndexPath *indexPath = self.viewController.mContactDetailsOptionsTable.indexPathForSelectedRow;
    if (indexPath)
    {
        [self.viewController.mContactDetailsOptionsTable deselectRowAtIndexPath:indexPath animated:NO];
    }
}

-(void)setEditContactsViewVisible:(bool)newVisible
{
    [self.viewController.mEditContactsView setHidden:(newVisible ? NO : YES)];

    NSIndexPath *indexPath = self.viewController.mEditContactsTable.indexPathForSelectedRow;
    if (indexPath)
    {
        [self.viewController.mEditContactsTable deselectRowAtIndexPath:indexPath animated:NO];
    }
}


//mSettingsView
-(void)setChangeRegisteredNameViewVisible:(bool)newVisible
{
    [self.viewController.mChangeRegisteredNameView setHidden:(newVisible ? NO : YES)];
}

-(void)setNavigationBarTitle:(const std::string&)newTitle
{
    [self.viewController.mTabView setHidden:NO];
    self.viewController.mNavigationItem.title = [NSString stringWithUTF8String:newTitle.c_str()];
    [self.viewController.mNavigationBar setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
}

-(void)setNavigationButtonTitle:(const std::string&)newTitle
{
    self.viewController.mNavigationButton.title = [NSString stringWithUTF8String:newTitle.c_str()];
}

-(void)setNavigationButtonVisible:(bool)newVisible
{
    if (newVisible)
    {
        self.viewController.mNavigationItem.rightBarButtonItem = self.viewController.mNavigationButton;
    }
    else
    {
        self.viewController.mNavigationItem.rightBarButtonItem = nil;
    }
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

#pragma mark -

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UIViewController *)viewController
{
    if (tabBarController == self.tabBarController)
    {
        if (viewController == self.mInboxVC)
        {
            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kInboxTabPressed));
        }
        else if (viewController == self.mNewMemoVC)
        {
            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kNewMemoTabPressed));
        }
        else if (viewController == self.mContactsVC)
        {
            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kContactsTabPressed));
        }
        else if (viewController == self.mGroupsVC)
        {
            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kGroupsTabPressed));
        }
        else if (viewController == self.mSettingsVC)
        {
            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kSettingsTabPressed));
        }
    }
}

@end
