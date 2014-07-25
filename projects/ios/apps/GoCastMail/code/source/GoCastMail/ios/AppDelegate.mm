#import <TargetConditionals.h>
#include <string>

#import "AppDelegate.h"

#import "SubVC/RecordMessageVC.h"

#include "Base/package.h"
#include "Io/package.h"

#include "GCTEvent.h"
#include "GCTEventManager.h"

#import "TestFlight.h"

#import <OpenEars/PocketsphinxController.h> // Please note that unlike in previous versions of OpenEars, we now link the headers through the framework.
#import <OpenEars/FliteController.h>
#import <OpenEars/LanguageModelGenerator.h>
#import <OpenEars/OpenEarsLogging.h>
#import <OpenEars/AcousticModel.h>

AppDelegate* gAppDelegateInstance = NULL;

extern std::vector<std::string> gUserListEntries;
extern std::vector<std::string> gMyInboxListEntries;
extern std::vector<std::string> gMyGroupsListEntries;
extern std::vector<std::string> gMemberListEntries;

const unsigned char SpeechKitApplicationKey[] =
{
    0xb2, 0x46, 0xb7, 0x88, 0x47, 0x17, 0xfe, 0x71, 0x34, 0xe7,
    0xc3, 0x58, 0xce, 0x38, 0xf3, 0xc1, 0xbf, 0x20, 0x07, 0x7b,
    0x5d, 0x7d, 0xe9, 0x93, 0xe8, 0xaa, 0xbb, 0x46, 0xc2, 0x49,
    0xb2, 0x74, 0x8f, 0x69, 0xfc, 0xd6, 0x80, 0xfa, 0x47, 0xb5,
    0xe1, 0x0a, 0x0d, 0xb0, 0x42, 0x00, 0x71, 0x02, 0x21, 0x79,
    0x7d, 0x7e, 0xf6, 0x66, 0x11, 0xde, 0x10, 0xcc, 0x24, 0xd2,
    0x15, 0xd7, 0x46, 0xa5
};

@implementation AppDelegate

@synthesize window = mWindow;

@synthesize pocketsphinxController;
@synthesize openEarsEventsObserver;
@synthesize slt;
@synthesize pathToFirstDynamicallyGeneratedLanguageModel;
@synthesize pathToFirstDynamicallyGeneratedDictionary;

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
#if ENGLISH_ONLY
    [TestFlight takeOff:@"a366ad7d-8a69-4a44-8744-7fb11fee1f3b"];
#else
    [TestFlight takeOff:@"acdfdb22-9897-4439-979e-d7665c9ab7e5"];
#endif
#endif

    //Force new memo tab to load
    [self.tabBarController setSelectedIndex:1];

    self->mTabBarHeight     = (size_t)self.tabBarController.tabBar.frame.size.height;
    self->mScreenHeight     = (size_t)[[UIScreen mainScreen] bounds].size.height;
    self->mNavBarHeight     = (size_t)self.mInboxNavBar.frame.size.height;
    self->mStatusBarHeight  = (size_t)[UIApplication sharedApplication].statusBarFrame.size.height;

    [self ctorEars];
    [self ctorRecorder];
    [self ctorSynth];

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
    [self dtorSynth];
    [self dtorRecorder];
    [self dtorEars];

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

#pragma mark -
#pragma mark Lazy Allocation

// Lazily allocated PocketsphinxController.
- (PocketsphinxController *)pocketsphinxController {
	if (pocketsphinxController == nil) {
		pocketsphinxController = [[PocketsphinxController alloc] init];
        //pocketsphinxController.verbosePocketSphinx = TRUE; // Uncomment me for verbose debug output
        pocketsphinxController.outputAudio = FALSE;
#ifdef kGetNbest
        pocketsphinxController.returnNbest = TRUE;
        pocketsphinxController.nBestNumber = 5;
#endif
	}
	return pocketsphinxController;
}

// Lazily allocated slt voice.
- (Slt *)slt {
	if (slt == nil) {
		slt = [[Slt alloc] init];
	}
	return slt;
}

// Lazily allocated OpenEarsEventsObserver.
- (OpenEarsEventsObserver *)openEarsEventsObserver {
	if (openEarsEventsObserver == nil) {
		openEarsEventsObserver = [[OpenEarsEventsObserver alloc] init];
	}
	return openEarsEventsObserver;
}

// The last class we're using here is LanguageModelGenerator but I don't think it's advantageous to lazily instantiate it. You can see how it's used below.

- (void) startEars
{

    // startListeningWithLanguageModelAtPath:dictionaryAtPath:languageModelIsJSGF always needs to know the grammar file being used,
    // the dictionary file being used, and whether the grammar is a JSGF. You must put in the correct value for languageModelIsJSGF.
    // Inside of a single recognition loop, you can only use JSGF grammars or ARPA grammars, you can't switch between the two types.

    // An ARPA grammar is the kind with a .languagemodel or .DMP file, and a JSGF grammar is the kind with a .gram file.

    // If you wanted to just perform recognition on an isolated wav file for testing, you could do it as follows:

    // NSString *wavPath = [NSString stringWithFormat:@"%@/%@",[[NSBundle mainBundle] resourcePath], @"test.wav"];
    //[self.pocketsphinxController runRecognitionOnWavFileAtPath:wavPath usingLanguageModelAtPath:self.pathToGrammarToStartAppWith dictionaryAtPath:self.pathToDictionaryToStartAppWith languageModelIsJSGF:FALSE];  // Starts the recognition loop.

    // But under normal circumstances you'll probably want to do continuous recognition as follows:

    [self.pocketsphinxController startListeningWithLanguageModelAtPath:self.pathToFirstDynamicallyGeneratedLanguageModel dictionaryAtPath:self.pathToFirstDynamicallyGeneratedDictionary acousticModelAtPath:[AcousticModel pathToModel:@"AcousticModelEnglish"] languageModelIsJSGF:FALSE]; // Change "AcousticModelEnglish" to "AcousticModelSpanish" in order to perform Spanish recognition instead of English.

}

#pragma mark Audio Recording
-(void)ctorEmailRecorder
{
    [UIDevice currentDevice].proximityMonitoringEnabled = YES;

    [SpeechKit setupWithID:@"NMDPTRIAL_gocast20140310195109"
                      host:@"sandbox.nmdp.nuancemobility.net"
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

-(void)ctorEars
{
	[self.openEarsEventsObserver setDelegate:self]; // Make this class the delegate of OpenEarsObserver so we can get all of the messages about what OpenEars is doing.



    // This is the language model we're going to start up with. The only reason I'm making it a class property is that I reuse it a bunch of times in this example,
	// but you can pass the string contents directly to PocketsphinxController:startListeningWithLanguageModelAtPath:dictionaryAtPath:languageModelIsJSGF:

//    HEY GO CAST
//    READ MY NEW MESSAGES
//    READ FIVE
//    READ ME THE SECOND EMAIL
//    YES
//    OKAY FINISHED

    NSArray *firstLanguageArray = [[[NSArray alloc] initWithArray:[NSArray arrayWithObjects: // All capital letters.
                                                                   @"CAST",
                                                                   @"EMAIL",
                                                                   @"FINISHED",
                                                                   @"FIVE",
                                                                   @"GO",
                                                                   @"HEY",
                                                                   @"MAIL",
                                                                   @"MESSAGES",
                                                                   @"ME",
                                                                   @"MY",
                                                                   @"NEW",
                                                                   @"OKAY",
                                                                   @"READ",
                                                                   @"SECOND",
                                                                   @"TALK",
                                                                   @"THE",
                                                                   @"YES",
                                                                  nil]] autorelease];

	LanguageModelGenerator *languageModelGenerator = [[[LanguageModelGenerator alloc] init] autorelease];

    NSError *error = [languageModelGenerator generateLanguageModelFromArray:firstLanguageArray
                                                             withFilesNamed:@"FirstOpenEarsDynamicLanguageModel"
                                                     forAcousticModelAtPath:[AcousticModel pathToModel:@"AcousticModelEnglish"]]; // Change "AcousticModelEnglish" to "AcousticModelSpanish" in order to create a language model for Spanish recognition instead of English.

	NSDictionary *firstDynamicLanguageGenerationResultsDictionary = nil;
    if([error code] != noErr) {
        NSLog(@"Dynamic language generator reported error %@", [error description]);
    } else {
		firstDynamicLanguageGenerationResultsDictionary = [error userInfo];

		NSString *lmFile = [firstDynamicLanguageGenerationResultsDictionary objectForKey:@"LMFile"];
		NSString *dictionaryFile = [firstDynamicLanguageGenerationResultsDictionary objectForKey:@"DictionaryFile"];
		NSString *lmPath = [firstDynamicLanguageGenerationResultsDictionary objectForKey:@"LMPath"];
		NSString *dictionaryPath = [firstDynamicLanguageGenerationResultsDictionary objectForKey:@"DictionaryPath"];

		NSLog(@"Dynamic language generator completed successfully, you can find your new files %@\n and \n%@\n at the paths \n%@ \nand \n%@", lmFile,dictionaryFile,lmPath,dictionaryPath);

		self.pathToFirstDynamicallyGeneratedLanguageModel = lmPath;
		self.pathToFirstDynamicallyGeneratedDictionary = dictionaryPath;

        [self startEars];
    }
}

-(void)dtorEars
{
	openEarsEventsObserver.delegate = nil;
}

-(void)openEars
{
	[self.pocketsphinxController resumeRecognition];
}

-(void)closeEars
{
	[self.pocketsphinxController suspendRecognition];
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

-(void)startListening
{
    if (voiceSearch) [voiceSearch release];

    voiceSearch = [[SKRecognizer alloc] initWithType:SKDictationRecognizerType
                                           detection:SKShortEndOfSpeechDetection
                                            language:@"en_US"
                                            delegate:self];
}

-(void)startRecorder
{
    if (voiceSearch) [voiceSearch release];

    voiceSearch = [[SKRecognizer alloc] initWithType:SKDictationRecognizerType
                                           detection:SKLongEndOfSpeechDetection
                                            language:@"en_US"
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

-(void)ctorSynth
{
    _mSynthesizer = [[AVSpeechSynthesizer alloc] init];
    _mSynthesizer.delegate = self;
}

-(void)dtorSynth
{
    [_mSynthesizer release];
}

-(void)startSpeaking:(const std::string&)text
{
    AVSpeechUtterance *utterance = [[[AVSpeechUtterance alloc] initWithString:[NSString stringWithUTF8String:text.c_str()]] autorelease];
    utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.60f;
    utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-us"];
    [_mSynthesizer speakUtterance:utterance];
}

-(void)stopSpeaking
{
    [_mSynthesizer pauseSpeakingAtBoundary:AVSpeechBoundaryImmediate];
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

- (BOOL)tabBarController:(UITabBarController *)theTabBarController shouldSelectViewController:(UIViewController *)viewController
{
    return (theTabBarController.selectedViewController != viewController);
}

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
        if (alertView.alertViewStyle == UIAlertViewStylePlainTextInput ||
            alertView.alertViewStyle == UIAlertViewStyleSecureTextInput)
        {
            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kOKYesAlertPressed, [[alertView textFieldAtIndex:0].text UTF8String]));
        }
        else
        {
            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kOKYesAlertPressed));
        }
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

	[voiceSearch release];
	voiceSearch = nil;
}

- (void)recognizer:(SKRecognizer *)recognizer didFinishWithError:(NSError *)error suggestion:(NSString *)suggestion
{
#pragma unused(recognizer, error, suggestion)

    NSLog(@"Got error.");
    NSLog(@"Session id [%@].", [SpeechKit sessionID]); // for debugging purpose: printing out the speechkit session id

    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTranscriptFinished, std::string("Transcription not available")));

	[voiceSearch release];
	voiceSearch = nil;
}

#pragma mark AVSpeechSynthesizerDelegate methods

-(void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance *)utterance
{
#pragma unused(synthesizer, utterance)
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kSpeakingFinished));
}

- (void) pocketsphinxRecognitionLoopDidStart
{
	NSLog(@"Pocketsphinx is starting up."); // Log it.
}

- (void) pocketsphinxDidStartCalibration
{
	NSLog(@"Pocketsphinx calibration has started."); // Log it.
}

- (void) pocketsphinxDidCompleteCalibration
{
	NSLog(@"Pocketsphinx calibration is complete."); // Log it.
}

- (void) pocketsphinxDidStartListening
{
	NSLog(@"Pocketsphinx is now listening."); // Log it.
}

- (void) pocketsphinxDidResumeRecognition
{
    NSLog(@"*** PocketSphinx is ready.");
}

- (void) pocketsphinxDidReceiveHypothesis:(NSString *)hypothesis recognitionScore:(NSString *)recognitionScore utteranceID:(NSString *)utteranceID
{
    typedef std::pair<std::string, GCTEvent::EventType> xp;

    static xp vocab[] =
    {
        xp("hey go cast", GCTEvent::kSaidHeyGoCast),
        xp("read my new messages", GCTEvent::kSaidReadMyNewMessages),
        xp("read five", GCTEvent::kSaidReadFive),
        xp("read me the second email", GCTEvent::kSaidReadMeTheSecondEmail),
        xp("yes", GCTEvent::kSaidYes),
        xp("okay finished", GCTEvent::kSaidOkayFinished),
    };

	NSLog(@"The received hypothesis is %@ with a score of %@ and an ID of %@", hypothesis, recognitionScore, utteranceID); // Log it.

    std::string heard = [hypothesis UTF8String];
    std::transform(heard.begin(), heard.end(), heard.begin(), ::tolower);

    for(size_t i = 0; i < sizeof(vocab) / sizeof(xp); i++)
    {
        if (heard == vocab[i].first)
        {
            GCTEventManager::getInstance()->notify(GCTEvent(vocab[i].second));
            break;
        }
    }
}

@end

