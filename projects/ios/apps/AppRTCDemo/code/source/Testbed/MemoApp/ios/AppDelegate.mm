#include <string>

#import "AppDelegate.h"
#import "ViewController.h"

#include "Base/package.h"

#include "MemoEvent.h"
#include "MemoEventManager.h"

#import "TestFlight.h"

AppDelegate* gAppDelegateInstance = NULL;

extern std::vector<std::string> gUserListEntries;
extern std::vector<std::string> gMyInboxListEntries;
extern std::vector<std::string> gMyGroupsListEntries;

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
    [TestFlight takeOff:@"a2e5966d-ce00-4823-ab21-0838f794a4bc"];
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

#pragma mark -

-(void)hideAllViews
{
    [self.viewController.mStartView setHidden:YES];
    [self.viewController.mTabView setHidden:YES];
    [self.viewController.mMyInboxView setHidden:YES];
    [self.viewController.mRecordAudioView setHidden:YES];
    [self.viewController.mSendToGroupView setHidden:YES];
    [self.viewController.mPlayAudioView setHidden:YES];
    [self.viewController.mMyGroupsView setHidden:YES];
    [self.viewController.mEditGroupView setHidden:YES];
    [self.viewController.mSettingsView setHidden:YES];
    [self.viewController.mEditProfileView setHidden:YES];
    [self.viewController.mBlockingView setHidden:YES];
    [self.viewController.mOldVersionView setHidden:YES];
    [self.viewController.mVersionCheckView setHidden:YES];
}

-(void)setNavigationBarTitle:(const std::string&)newTitle
{
    self.viewController.mNavigationItem.title = [NSString stringWithUTF8String:newTitle.c_str()];
}

-(void)setBlockingViewVisible:(bool)newVisible
{
    [self.viewController.mBlockingView setHidden:(newVisible) ? NO : YES];
}

-(void)setStartScreenVisible:(bool)newVisible
{
    [self.viewController.mStartView setHidden:(newVisible) ? NO : YES];
}

#pragma mark Tab Screens

-(void)setMyInboxScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    self.viewController.mTabBar.selectedItem = self.viewController.mInboxTab;
    [self.viewController.mMyInboxView setHidden:(newVisible) ? NO : YES];
}

-(void)setRecordAudioScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    self.viewController.mTabBar.selectedItem = self.viewController.mNewMemoTab;
    [self.viewController.mRecordAudioView setHidden:(newVisible) ? NO : YES];
}

-(void)setMyGroupsScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    self.viewController.mTabBar.selectedItem = self.viewController.mGroupsTab;
    [self.viewController.mMyGroupsView setHidden:(newVisible) ? NO : YES];
}

-(void)setEditGroupScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    self.viewController.mTabBar.selectedItem = self.viewController.mGroupsTab;
    [self.viewController.mEditGroupView setHidden:(newVisible) ? NO : YES];
}

-(void)setSettingsScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    self.viewController.mTabBar.selectedItem = self.viewController.mSettingsTab;
    [self.viewController.mSettingsView setHidden:(newVisible) ? NO : YES];
}

-(void)setEditProfileScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    self.viewController.mTabBar.selectedItem = self.viewController.mSettingsTab;
    [self.viewController.mEditProfileView setHidden:(newVisible) ? NO : YES];
}

#pragma mark -

-(void)setSendToGroupScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    [self.viewController.mSendToGroupView setHidden:(newVisible) ? NO : YES];
}

-(void)setPlayAudioScreenVisible:(bool)newVisible
{
    [self.viewController.mTabView setHidden:(newVisible) ? NO : YES];
    [self.viewController.mPlayAudioView setHidden:(newVisible) ? NO : YES];
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

-(void)setCancelRecordingButtonVisible:(bool)newVisible
{
    [self.viewController.mCancelRecordingButton setHidden:(newVisible) ? NO : YES];
}

-(void)setSaveRecordingButtonVisible:(bool)newVisible
{
    [self.viewController.mSaveRecordingButton setHidden:(newVisible) ? NO : YES];
}

-(void)setSendRecordingButtonEnabled:(bool)newEnabled
{
    [self.viewController.mSendRecordingButton setEnabled:(newEnabled ? YES : NO)];
    self.viewController.mSendRecordingButton.alpha = (newEnabled ? 1.0f : 0.4f);
}


-(void)setRecordingStatusLabel:(const std::string&)newStatus
{
    self.viewController.mRecordingStatusLabel.text = [NSString stringWithUTF8String:newStatus.c_str()];
}

-(void)setPlayAudioButtonImage:(bool)newPlaying
{
    if (!newPlaying)
    {
        [self.viewController.mPlayAudioButton setImage:[UIImage imageNamed:@"play-button.png"] forState:UIControlStateNormal];
    }
    else
    {
        [self.viewController.mPlayAudioButton setImage:[UIImage imageNamed:@"pause-button.png"] forState:UIControlStateNormal];
    }
}

-(void)setPlayAudioDurationLabel:(const std::string&)newLabel
{
    self.viewController.mAudioDurationLabel.text =[NSString stringWithUTF8String:newLabel.c_str()];
}

-(void)setPlayAudioFromLabel:(const std::string&)newLabel
{
    self.viewController.mFrom.text = [NSString stringWithUTF8String:newLabel.c_str()];
}

-(void)setSendAudioButtonEnabled:(bool)newEnabled
{
    [self.viewController.mSendAudioButton setEnabled:(newEnabled ? YES : NO)];
    self.viewController.mSendAudioButton.alpha = (newEnabled ? 1.0f : 0.4f);
}

-(void)setVersionCheckScreenVisible:(bool)newVisible
{
    [self.viewController.mVersionCheckView setHidden:(newVisible) ? NO : YES];
}

-(void)setOldVersionScreenVisible:(bool)newVisible
{
    [self.viewController.mOldVersionView setHidden:(newVisible) ? NO : YES];
}

-(void)setRetryVersionCheckButtonEnabled:(bool)newEnabled
{
    [self.viewController.mRetryVersionCheckButton setEnabled:(newEnabled ? YES : NO)];
    self.viewController.mRetryVersionCheckButton.alpha = (newEnabled ? 1.0f : 0.4f);
}

//mStartView
-(std::string) getUsername
{
    const char* result = [self.viewController.mLoginUsername.text UTF8String];
    return result ? result : "";
}

-(std::string) getPassword
{
    const char* result = [self.viewController.mLoginPassword.text UTF8String];
    return result ? result : "";
}

-(std::string) getOldPassword
{
    const char* result = [self.viewController.mOldPassword.text UTF8String];
    return result ? result : "";
}

-(std::string) getNewPassword
{
    const char* result = [self.viewController.mNewPassword.text UTF8String];
    return result ? result : "";
}

//mEditProfileView
-(std::string) getKanjiName
{
    const char* result = [self.viewController.mKanjiName.text UTF8String];
    return result ? result : "";
}
-(std::string) getKanaName
{
    const char* result = [self.viewController.mKanaName.text UTF8String];
    return result ? result : "";
}

-(void) setKanjiName:(const std::string&)newName
{
    self.viewController.mKanjiName.text = [NSString stringWithUTF8String:newName.c_str()];
}

-(void) setKanaName:(const std::string&)newName
{
    self.viewController.mKanaName.text = [NSString stringWithUTF8String:newName.c_str()];
}

//mSettingsview
-(void)setSettingsLoggedInName:(const std::string&)newName
{
    self.viewController.mLoggedInLabel.text = [NSString stringWithUTF8String:newName.c_str()];
}

-(void)startRecorder
{
    [self.viewController startRecorder];
}

-(void)stopRecorder
{
    [self.viewController stopRecorder];
}

-(void)setUserListTable:(const std::vector<std::string>&)newEntries
{
    gUserListEntries.clear();
    gUserListEntries.insert(gUserListEntries.end(), newEntries.begin(), newEntries.end());

    [self.viewController.mSendToGroupTable reloadData];
}

-(void)setMyInboxTable:(const std::vector<std::string>&)newEntries
{
    gMyInboxListEntries.clear();
    gMyInboxListEntries.insert(gMyInboxListEntries.end(), newEntries.begin(), newEntries.end());

    [self.viewController.mInboxTable reloadData];
}

-(void)setMyGroupsTable:(const std::vector<std::string>&)newEntries
{
    gMyGroupsListEntries.clear();
    gMyGroupsListEntries.insert(gMyGroupsListEntries.end(), newEntries.begin(), newEntries.end());

    [self.viewController.mCurrentGroupsTable reloadData];
}


-(std::vector<size_t>)getSelectedFromUserListTable
{
    std::vector<size_t> result;

    NSArray* selectedIndexPaths = [self.viewController.mSendToGroupTable indexPathsForSelectedRows];

    if (selectedIndexPaths)
    {
        for (NSIndexPath* path in selectedIndexPaths)
        {
            result.push_back((size_t)path.row);
        }
    }
    
    return result;
}

@end
