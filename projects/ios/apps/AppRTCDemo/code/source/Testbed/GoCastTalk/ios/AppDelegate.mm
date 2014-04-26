#import <TargetConditionals.h>
#include <string>

#import "AppDelegate.h"

#import "SubVC/ChangeRegisteredNameVC.h"
#import "SubVC/ContactDetailsVC.h"
#import "SubVC/EditContactsVC.h"
#import "SubVC/InboxMessageVC.h"
#import "SubVC/MessageHistoryVC.h"
#import "SubVC/RecordMessageVC.h"

#import "VC/ContactsVC.h"

#import "VC/LoginVC.h"
#import "SubVC/MessageSentVC.h"

#include "Base/package.h"
#include "Io/package.h"

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
    0x9c, 0xf2, 0x24, 0xb9, 0xdf, 0x9b, 0x4d, 0x92, 0x98, 0x7b,
    0x8e, 0x56, 0x60, 0x20, 0x03, 0xb1, 0xd7, 0x5f, 0xb7, 0x55,
    0x8b, 0x04, 0x8e, 0xd9, 0x8b, 0x81, 0xf8, 0xe1, 0xcd, 0x61,
    0x9d, 0x69, 0x53, 0xc1, 0x22, 0x32, 0x5c, 0x6f, 0xc4, 0xf4,
    0xeb, 0x53, 0x4a, 0x4b, 0x73, 0x4d, 0xfd, 0x4a, 0xac, 0xb4,
    0x9f, 0x38, 0xb8, 0x2e, 0x11, 0x43, 0xaf, 0x09, 0x24, 0x7c,
    0x6a, 0xc1, 0xe6, 0xbd
};

@implementation AppDelegate

@synthesize window = mWindow;

#pragma mark Constructor / Destructor

- (id)init
{
    self = [super init];

    gAppDelegateInstance = self;

    return self;
}

- (void)application:(UIApplication*)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData*)deviceToken
{
#pragma unused(application)
    NSString *devToken = [[[[deviceToken description]
                            stringByReplacingOccurrencesOfString:@"<" withString:@""]
                           stringByReplacingOccurrencesOfString:@">" withString:@""]
                          stringByReplacingOccurrencesOfString:@" " withString:@""];

	NSLog(@"My token is: %@", devToken);

    const char* devTokenStr = [devToken UTF8String];

    tFile deviceTokenFile(tFile::kPreferencesDirectory, "device.txt");

    if (devTokenStr && !deviceTokenFile.exists())
    {
        deviceTokenFile.write(devTokenStr);
    }
}

- (void)application:(UIApplication*)application didFailToRegisterForRemoteNotificationsWithError:(NSError*)error
{
#pragma unused(application)
	NSLog(@"Failed to get token, error: %@", error);
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#pragma unused(application, launchOptions)

    tFile deviceTokenFile(tFile::kPreferencesDirectory, "device.txt");

    deviceTokenFile.remove();

#if !(TARGET_IPHONE_SIMULATOR)
    [[UIApplication sharedApplication] registerForRemoteNotificationTypes: (UIRemoteNotificationTypeBadge |
                                                                            UIRemoteNotificationTypeSound |
                                                                            UIRemoteNotificationTypeAlert)];
#endif

#ifdef ADHOC
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
//    [TestFlight setDeviceIdentifier:[[UIDevice currentDevice] uniqueIdentifier]];
#pragma clang diagnostic pop
    [TestFlight takeOff:@"acdfdb22-9897-4439-979e-d7665c9ab7e5"];
#endif

    //Force new memo tab to load
    [self.tabBarController setSelectedIndex:1];

    self->mTabBarHeight     = (size_t)self.tabBarController.tabBar.frame.size.height;
    self->mScreenHeight     = (size_t)[[UIScreen mainScreen] bounds].size.height;
    self->mNavBarHeight     = (size_t)self.mInboxNavBar.frame.size.height;
    self->mStatusBarHeight  = (size_t)[UIApplication sharedApplication].statusBarFrame.size.height;

    [self ctorRecorder];

    if (floor(NSFoundationVersionNumber) > NSFoundationVersionNumber_iOS_6_1)
    {
        [self.mInboxNavBar      setBackgroundImage:[UIImage imageNamed:@"banner2.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mNewMemoNavBar    setBackgroundImage:[UIImage imageNamed:@"banner2.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mContactsNavBar   setBackgroundImage:[UIImage imageNamed:@"banner2.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mSettingsNavBar   setBackgroundImage:[UIImage imageNamed:@"banner2.png"] forBarMetrics:UIBarMetricsDefault];
    }
    else
    {
        [[UISegmentedControl appearance] setTintColor:[UIColor colorWithRed:0.6f green:0.8f blue:0.8f alpha:1.0f]];
        [[UINavigationBar appearance] setTintColor:[UIColor colorWithRed:0.6f green:0.8f blue:0.8f alpha:1.0f]];
        [[UIBarButtonItem appearance] setTintColor:[UIColor colorWithRed:0.6f green:0.8f blue:0.8f alpha:1.0f]];
        [self.mInboxNavBar      setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mNewMemoNavBar    setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mContactsNavBar   setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
        [self.mSettingsNavBar   setBackgroundImage:[UIImage imageNamed:@"banner.png"] forBarMetrics:UIBarMetricsDefault];
    }

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
    [self dtorRecorder];

    [mWindow release];
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

#pragma mark Audio Recording
-(void)ctorEmailRecorder
{
    [UIDevice currentDevice].proximityMonitoringEnabled = YES;

    [SpeechKit setupWithID:@"NMDPPRODUCTION_GoCast_Inc_GoCast_Talk_20140310195747"
                      host:@"biy.nmdp.nuancemobility.net"
                      port:443
                    useSSL:NO
                  delegate:self];

    // Set the audio file
    NSArray *pathComponents = [NSArray arrayWithObjects: NSTemporaryDirectory(), @"scratch.wav", nil];
    NSURL *outputFileURL = [NSURL fileURLWithPathComponents:pathComponents];

    // Setup audio session
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayAndRecord error:nil];

    [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:nil];

    // Define the recorder setting
    NSMutableDictionary *recordSetting = [[NSMutableDictionary alloc] init];

    //Changed codec slightly so .WAV emails work
    [recordSetting setValue :[NSNumber numberWithInt: kAudioFormatLinearPCM]   forKey:AVFormatIDKey];

    NSError* err = nil;

    // Initiate and prepare the recorder
    _mEmailRecorder = [[AVAudioRecorder alloc] initWithURL:outputFileURL settings:recordSetting error:&err];

    if (err)
    {
        NSLog(@"%@",[err localizedDescription]);
        assert(0);
    }

    _mEmailRecorder.delegate = self;
    _mEmailRecorder.meteringEnabled = YES;
    [_mEmailRecorder prepareToRecord];

    [recordSetting release];
}

-(void)ctorServerRecorder
{
    [UIDevice currentDevice].proximityMonitoringEnabled = YES;

    [SpeechKit setupWithID:@"NMDPTRIAL_gocast20140310195109"
                      host:@"sandbox.nmdp.nuancemobility.net"
                      port:443
                    useSSL:NO
                  delegate:self];

    // Set the audio file
    NSArray *pathComponents = [NSArray arrayWithObjects: NSTemporaryDirectory(), @"scratch.caf", nil];
    NSURL *outputFileURL = [NSURL fileURLWithPathComponents:pathComponents];

    // Setup audio session
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayAndRecord error:nil];

    [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:nil];

    // Define the recorder setting
    NSMutableDictionary *recordSetting = [[NSMutableDictionary alloc] init];

    //Changed codec slightly so .WAV emails work
    [recordSetting setValue :[NSNumber numberWithInt: kAudioFormatAppleIMA4]   forKey:AVFormatIDKey];
    [recordSetting setValue :[NSNumber numberWithFloat: 16000.0]            forKey:AVSampleRateKey];
    [recordSetting setValue :[NSNumber numberWithInt: 1]                    forKey:AVNumberOfChannelsKey];
    [recordSetting setValue :[NSNumber numberWithInt: 8]                    forKey:AVLinearPCMBitDepthKey];
    [recordSetting setValue :[NSNumber numberWithBool: NO]                  forKey:AVLinearPCMIsBigEndianKey];
    [recordSetting setValue :[NSNumber numberWithBool: NO]                  forKey:AVLinearPCMIsFloatKey];
    [recordSetting setValue :[NSNumber numberWithInt: 12000]                forKey:AVEncoderBitRateKey];
    [recordSetting setValue :[NSNumber numberWithInt: 8]                    forKey:AVEncoderBitDepthHintKey];
    [recordSetting setValue :[NSNumber numberWithInt: 8]                    forKey:AVEncoderBitRatePerChannelKey];
    [recordSetting setValue :[NSNumber numberWithInt: AVAudioQualityMin]    forKey:AVEncoderAudioQualityKey];

    NSError* err = nil;

    // Initiate and prepare the recorder
    _mServerRecorder = [[AVAudioRecorder alloc] initWithURL:outputFileURL settings:recordSetting error:&err];

    if (err)
    {
        NSLog(@"%@",[err localizedDescription]);
        assert(0);
    }

    _mServerRecorder.delegate = self;
    _mServerRecorder.meteringEnabled = YES;
    [_mServerRecorder prepareToRecord];
    
    [recordSetting release];
}

-(void)ctorRecorder
{
    [self ctorEmailRecorder];
    [self ctorServerRecorder];
}

-(void)dtorRecorder
{
    [_mServerRecorder release];
    [_mEmailRecorder release];
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
    [self stopNuanceRecorder];

    [_mEmailRecorder stop];
    [_mServerRecorder stop];

    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    [audioSession setActive:NO error:nil];
}

-(void)stopNuanceRecorder
{
    [voiceSearch stopRecording];
}

-(void)startRecorderInternal
{
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setActive:YES error:nil];

    // Start recording
    [_mEmailRecorder record];
    [_mServerRecorder record];
}

-(void)stopRecorderInternal
{
    [_mEmailRecorder stop];
    [_mServerRecorder stop];

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
        else if (viewController == self.mSettingsVC)
        {
            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kSettingsTabPressed));
        }
    }
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
    [self stopNuanceRecorder];
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

    //"Transcription not available."
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTranscriptFinished, "(テキストはまだありません)\n\n無料サービス期間中は、自動テキスト化は１日あたり２０回までご利用いただけます。"));

	[voiceSearch release];
	voiceSearch = nil;
}

-(void)pushMessageSent
{
    [self.tabBarController presentViewController:[[[MessageSentVC alloc] init] autorelease] animated:YES completion:nil];
}

@end

