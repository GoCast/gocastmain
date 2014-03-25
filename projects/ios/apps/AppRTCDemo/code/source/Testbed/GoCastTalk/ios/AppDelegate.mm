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
    0x3a, 0x42, 0x1c, 0x01, 0xca, 0x56, 0x04, 0x33, 0xb1, 0xd6,
    0x98, 0x87, 0x61, 0xc6, 0x22, 0x6e, 0xc5, 0xa2, 0xd2, 0xe5,
    0x74, 0x27, 0x91, 0xdd, 0xac, 0x24, 0x62, 0x10, 0xb1, 0x58,
    0xd9, 0xeb, 0x9b, 0xf5, 0xed, 0x65, 0x4b, 0xf1, 0x99, 0xfc,
    0xc7, 0x31, 0x83, 0x28, 0xf7, 0xa6, 0x96, 0xbc, 0x48, 0x69,
    0xa2, 0xbc, 0x90, 0x33, 0x99, 0x3c, 0x57, 0xfb, 0x4d, 0x08,
    0x54, 0x26, 0xf3, 0xef
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

    //Force new memo tab to load
    [self.tabBarController setSelectedIndex:1];

    self->mTabBarHeight     = (size_t)self.tabBarController.tabBar.frame.size.height;
    self->mScreenHeight     = (size_t)[[UIScreen mainScreen] bounds].size.height;
    self->mNavBarHeight     = (size_t)self.mInboxNavBar.frame.size.height;
    self->mStatusBarHeight  = (size_t)[UIApplication sharedApplication].statusBarFrame.size.height;

    [self ctorRecorder];

    if (floor(NSFoundationVersionNumber) > NSFoundationVersionNumber_iOS_6_1)
    {
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
-(void)ctorRecorder
{
    [UIDevice currentDevice].proximityMonitoringEnabled = YES;

    [SpeechKit setupWithID:@"NMDPTRIAL_tjgrant20140214222500"
                      host:@"sandbox.nmdp.nuancemobility.net"
                      port:443
                    useSSL:NO
                  delegate:self];

    // Set the audio file
    NSArray *pathComponents = [NSArray arrayWithObjects:
                               NSTemporaryDirectory(),
                               @"scratch.caf",
                               nil];
    NSURL *outputFileURL = [NSURL fileURLWithPathComponents:pathComponents];

    // Setup audio session
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayAndRecord error:nil];

    [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:nil];

    // Define the recorder setting
    NSMutableDictionary *recordSetting = [[NSMutableDictionary alloc] init];

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
    _mRecorder = [[AVAudioRecorder alloc] initWithURL:outputFileURL settings:recordSetting error:&err];

    if (err)
    {
        NSLog(@"%@",[err localizedDescription]);
        assert(0);
    }

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
    [self stopNuanceRecorder];

    [_mRecorder stop];

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
    
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTranscriptFinished, "Transcription not available."));

	[voiceSearch release];
	voiceSearch = nil;
}

-(void)pushMessageSent
{
    [self.tabBarController presentViewController:[[[MessageSentVC alloc] init] autorelease] animated:YES completion:nil];
}

@end

