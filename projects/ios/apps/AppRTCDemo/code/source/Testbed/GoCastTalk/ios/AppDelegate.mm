#include <string>

#import "AppDelegate.h"
#import "GoCastTalkVC.h"

#import "SubVC/ChangeRegisteredNameVC.h"
#import "SubVC/ContactDetailsVC.h"
#import "SubVC/EditContactsVC.h"
#import "SubVC/InboxMessageVC.h"
#import "SubVC/MessageHistoryVC.h"
#import "SubVC/RecordMessageVC.h"

#import "VC/ContactsVC.h"
#import "VC/GroupsVC.h"

#import "VC/LoginVC.h"

#include "Base/package.h"

#include "GCTEvent.h"
#include "GCTEventManager.h"

#import "TestFlight.h"

AppDelegate* gAppDelegateInstance = NULL;

extern std::vector<std::string> gUserListEntries;
extern std::vector<std::string> gMyInboxListEntries;
extern std::vector<std::string> gMyGroupsListEntries;
extern std::vector<std::string> gMemberListEntries;

const unsigned char SpeechKitApplicationKey[] =
{
    0xe1, 0x4e, 0xf3, 0x80, 0x7d, 0x6a, 0xc2, 0x69, 0xbd, 0xa9,
    0xd4, 0xc1, 0x2e, 0xdf, 0xcf, 0x0e, 0x97, 0xd3, 0x07, 0x7a,
    0x33, 0x41, 0xd3, 0xb0, 0xf8, 0x77, 0x6f, 0x16, 0x79, 0x80,
    0x49, 0x5a, 0xcf, 0x3c, 0xdb, 0x4c, 0xa6, 0x9d, 0xb5, 0x64,
    0x46, 0x89, 0x25, 0x75, 0x69, 0xf4, 0x83, 0x00, 0xc8, 0x8b,
    0x7a, 0xfb, 0xcc, 0x4d, 0xab, 0xc4, 0xc4, 0x1a, 0xda, 0x3d,
    0x9b, 0x23, 0x98, 0x6a
};

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

    [self ctorRecorder];

    //TODO: This removes the "groups" tab, for now; so remove it later
    NSMutableArray * vcs = [NSMutableArray arrayWithArray:[self.tabBarController viewControllers]];

	[vcs removeObjectAtIndex:3];

	[vcs removeObjectAtIndex:1];

	[self.tabBarController setViewControllers:vcs];

    if (floor(NSFoundationVersionNumber) > NSFoundationVersionNumber_iOS_6_1)
    {
        [self.mInboxNavBar      setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mNewMemoNavBar    setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mContactsNavBar   setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mGroupsNavBar     setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mSettingsNavBar   setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
    }

    [self.window setRootViewController:self.tabBarController];
    [self.window makeKeyAndVisible];

    [self.tabBarController presentViewController:[[[LoginVC alloc] init] autorelease] animated:YES completion:nil];

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
    [self dtorRecorder];

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


#pragma mark Audio Recording
-(void)ctorRecorder
{
    [SpeechKit setupWithID:@"NMDPTRIAL_hmizusawa20131113014320"
                      host:@"sandbox.nmdp.nuancemobility.net"
                      port:443
                    useSSL:NO
                  delegate:self];

    // Set the audio file
    NSArray *pathComponents = [NSArray arrayWithObjects:
                               NSTemporaryDirectory(),
                               @"scratch.wav",
                               nil];
    NSURL *outputFileURL = [NSURL fileURLWithPathComponents:pathComponents];

    // Setup audio session
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayAndRecord error:nil];

    [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:nil];

    // Define the recorder setting
    NSMutableDictionary *recordSetting = [[NSMutableDictionary alloc] init];

    [recordSetting setValue:[NSNumber numberWithInt:kAudioFormatLinearPCM] forKey:AVFormatIDKey];
    [recordSetting setValue:[NSNumber numberWithFloat:16000.0] forKey:AVSampleRateKey];
    [recordSetting setValue:[NSNumber numberWithInt: 1] forKey:AVNumberOfChannelsKey];

    // Initiate and prepare the recorder
    _mRecorder = [[AVAudioRecorder alloc] initWithURL:outputFileURL settings:recordSetting error:NULL];
    _mRecorder.delegate = self;
    _mRecorder.meteringEnabled = YES;
    [_mRecorder prepareToRecord];

    [recordSetting release];
}

-(void)dtorRecorder
{
    [_mRecorder release];
}

-(void)startRecorder
{
    if (voiceSearch) [voiceSearch release];

    voiceSearch = [[SKRecognizer alloc] initWithType:SKDictationRecognizerType
                                           detection:SKNoEndOfSpeechDetection
                                            language:@"ja_jp"
                                            delegate:self];
}

-(void)stopRecorder
{
    [voiceSearch stopRecording];

    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    [audioSession setActive:NO error:nil];
}

-(void)startRecorderInternal
{
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setActive:YES error:nil];

    // Start recording
    [_mRecorder record];
}

-(void)stopRecorderInternal
{
    [_mRecorder stop];

    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    [audioSession setActive:NO error:nil];
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

-(void)pushChangeRegisterdName:(int)tabID
{
#pragma unused(tabID)
//    ChangeRegisteredNameVC* nextVC = [[[ChangeRegisteredNameVC alloc] initWithNibName:@"ChangeRegisteredNameVC" bundle:nil] autorelease];
//    [mTabVC[tabID] pushViewController:nextVC animated:YES];
}

-(void)pushContactDetails:(int)tabID
{
#pragma unused(tabID)
//    ContactDetailsVC* nextVC = [[[ContactDetailsVC alloc] initWithNibName:@"ContactDetailsVC" bundle:nil] autorelease];
//    [mTabVC[tabID] pushViewController:nextVC animated:YES];
}

-(void)pushEditContacts:(int)tabID
{
#pragma unused(tabID)
//    EditContactsVC* nextVC = [[[EditContactsVC alloc] initWithNibName:@"EditContactsVC" bundle:nil] autorelease];
//    [mTabVC[tabID] pushViewController:nextVC animated:YES];
}

-(void)pushInboxMessage:(int)tabID
{
#pragma unused(tabID)
//    InboxMessageVC* nextVC = [[[InboxMessageVC alloc] initWithNibName:@"InboxMessageVC" bundle:nil] autorelease];
//    [mTabVC[tabID] pushViewController:nextVC animated:YES];
}

-(void)pushMessageHistory:(int)tabID
{
#pragma unused(tabID)
//    MessageHistoryVC* nextVC = [[[MessageHistoryVC alloc] initWithNibName:@"MessageHistoryVC" bundle:nil] autorelease];
//    [mTabVC[tabID] pushViewController:nextVC animated:YES];
}

-(void)pushRecordMessage:(int)tabID
{
#pragma unused(tabID)
//    RecordMessageVC* nextVC = [[[RecordMessageVC alloc] initWithNibName:@"RecordMessageVC" bundle:nil] autorelease];
//    [mTabVC[tabID] pushViewController:nextVC animated:YES];
}

-(void)pushContacts:(int)tabID
{
#pragma unused(tabID)
//    ContactsVC* nextVC = [[[ContactsVC alloc] initWithNibName:@"ContactsVC" bundle:nil] autorelease];
//    [mTabVC[tabID] pushViewController:nextVC animated:YES];
}

-(void)pushGroups:(int)tabID
{
#pragma unused(tabID)
//    GroupsVC* nextVC = [[[GroupsVC alloc] initWithNibName:@"ContactsVC" bundle:nil] autorelease];
//    [mTabVC[tabID] pushViewController:nextVC animated:YES];
}

-(void)popInbox:(bool)animated
{
    [self.mInboxVC popViewControllerAnimated:((animated) ? TRUE : FALSE)];
}

-(void)popNewMemo:(bool)animated
{
    [self.mNewMemoVC popViewControllerAnimated:((animated) ? TRUE : FALSE)];
}

-(void)popContacts:(bool)animated
{
    [self.mContactsVC popViewControllerAnimated:((animated) ? TRUE : FALSE)];
}

-(void)popGroups:(bool)animated
{
    [self.mGroupsVC popViewControllerAnimated:((animated) ? TRUE : FALSE)];
}

-(void)popSettings:(bool)animated
{
    [self.mSettingsVC popViewControllerAnimated:((animated) ? TRUE : FALSE)];
}

-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
#pragma unused(alertView)
    if (buttonIndex == 0)
    {
        GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kOKYesAlertPressed));
    }
    else
    {
        GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kNoAlertPressed));
    }
}

-(void)audioRecorderDidFinishRecording:(AVAudioRecorder *)recorder successfully:(BOOL)flag
{
#pragma unused(recorder, flag)
}

#pragma mark -
#pragma mark SKRecognizerDelegate methods

- (void)recognizerDidBeginRecording:(SKRecognizer *)recognizer
{
#pragma unused(recognizer)
    NSLog(@"Recording started.");
    [self startRecorderInternal];
}

- (void)recognizerDidFinishRecording:(SKRecognizer *)recognizer
{
#pragma unused(recognizer)
    NSLog(@"Recording finished.");
    [self stopRecorderInternal];
}

- (void)recognizer:(SKRecognizer *)recognizer didFinishWithResults:(SKRecognition *)results
{
#pragma unused(recognizer)
    NSString* result = [NSString stringWithUTF8String:""];

    NSLog(@"Got results.");
    NSLog(@"Session id [%@].", [SpeechKit sessionID]); // for debugging purpose: printing out the speechkit session id

    size_t numOfResults = [results.results count];

    if (numOfResults > 0)
    {
        result = [results firstResult];
    }

    NSLog(@"Result %@", result);

    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTranscriptFinished, [result UTF8String]));

    //	if (numOfResults > 1)
    //		alternativesDisplay.text = [[results.results subarrayWithRange:NSMakeRange(1, numOfResults-1)] componentsJoinedByString:@"\n"];

    //    if (results.suggestion) {
    //        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Suggestion"
    //                                                        message:results.suggestion
    //                                                       delegate:nil
    //                                              cancelButtonTitle:@"OK"
    //                                              otherButtonTitles:nil];
    //        [alert show];
    //        [alert release];
    //
    //    }

	[voiceSearch release];
	voiceSearch = nil;
}

- (void)recognizer:(SKRecognizer *)recognizer didFinishWithError:(NSError *)error suggestion:(NSString *)suggestion
{
#pragma unused(recognizer, error, suggestion)

    NSLog(@"Got error.");
    NSLog(@"Session id [%@].", [SpeechKit sessionID]); // for debugging purpose: printing out the speechkit session id

    //    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error"
    //                                                    message:[error localizedDescription]
    //                                                   delegate:nil
    //                                          cancelButtonTitle:@"OK"
    //                                          otherButtonTitles:nil];
    //    [alert show];
    //    [alert release];
    //
    //    if (suggestion) {
    //        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Suggestion"
    //                                                        message:suggestion
    //                                                       delegate:nil
    //                                              cancelButtonTitle:@"OK"
    //                                              otherButtonTitles:nil];
    //        [alert show];
    //        [alert release];
    //
    //    }
    
	[voiceSearch release];
	voiceSearch = nil;
}

@end

