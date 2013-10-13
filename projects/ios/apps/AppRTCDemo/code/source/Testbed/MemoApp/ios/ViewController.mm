#include "ViewController.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"

#include "MemoEvent.h"
#include "MemoEventManager.h"

std::vector<std::string> gMyRecordingsEntries;

@interface ViewController()
{
}
@end

@implementation ViewController

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    [self ctorRecorder];
    self.view.autoresizesSubviews = YES;
}

- (void)viewDidUnload
{
    [self dtorRecorder];

    [super viewDidUnload];
}

- (void)dealloc
{
    [super dealloc];
}

#pragma mark tOrientationEvent generation
- (void)viewWillLayoutSubviews
{
    [self willRotateToInterfaceOrientation:self.interfaceOrientation duration:0];
    [self didRotateFromInterfaceOrientation:self.interfaceOrientation];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
#pragma unused(interfaceOrientation)
    [UIView setAnimationsEnabled:NO];

    tOrientationEvent::OrientationType type = tOrientationEvent::kPortrait;

    switch(interfaceOrientation)
    {
        default:
        case UIInterfaceOrientationPortrait:            type = tOrientationEvent::kPortrait; break;
        case UIInterfaceOrientationPortraitUpsideDown:  type = tOrientationEvent::kPortraitUpsidedown; break;
        case UIInterfaceOrientationLandscapeLeft:       type = tOrientationEvent::kLandscapeLeft; break;
        case UIInterfaceOrientationLandscapeRight:      type = tOrientationEvent::kLandscapeRight; break;
    }

    tOrientationEvent msg(tOrientationEvent::kAllowOrientation, type);
    tInputManager::getInstance()->tSubject<tOrientationEvent &>::notify(msg);

    return msg.mAllowed ? YES : NO;
}

- (void)sendOrientationChangedMessage:(UIInterfaceOrientation)toInterfaceOrientation
{
    tOrientationEvent::OrientationType type = tOrientationEvent::kPortrait;

    switch(toInterfaceOrientation)
    {
        default:
        case UIInterfaceOrientationPortrait:            type = tOrientationEvent::kPortrait; break;
        case UIInterfaceOrientationPortraitUpsideDown:  type = tOrientationEvent::kPortraitUpsidedown; break;
        case UIInterfaceOrientationLandscapeLeft:       type = tOrientationEvent::kLandscapeLeft; break;
        case UIInterfaceOrientationLandscapeRight:      type = tOrientationEvent::kLandscapeRight; break;
    }

    tOrientationEvent msg(tOrientationEvent::kOrientationChanged, type);
    tInputManager::getInstance()->tSubject<tOrientationEvent &>::notify(msg);
}

- (void)willRotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration
{
#pragma unused(duration)
    [UIView setAnimationsEnabled:NO];

    [self sendOrientationChangedMessage:toInterfaceOrientation];
}

- (void)didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation
{
#pragma unused(fromInterfaceOrientation)
    [super didRotateFromInterfaceOrientation:fromInterfaceOrientation];
    [UIView setAnimationsEnabled:YES];
}

#pragma mark Audio Recording
-(void)ctorRecorder
{
    // Set the audio file
    NSArray *pathComponents = [NSArray arrayWithObjects:
                               NSTemporaryDirectory(),
                               @"scratch.m4a",
                               nil];
    NSURL *outputFileURL = [NSURL fileURLWithPathComponents:pathComponents];

    // Setup audio session
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayAndRecord error:nil];

    [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:nil];

    // Define the recorder setting
    NSMutableDictionary *recordSetting = [[NSMutableDictionary alloc] init];

    [recordSetting setValue:[NSNumber numberWithInt:kAudioFormatMPEG4AAC] forKey:AVFormatIDKey];
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
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setActive:YES error:nil];

    // Start recording
    [_mRecorder record];
}

-(void)stopRecorder
{
    [_mRecorder stop];

    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    [audioSession setActive:NO error:nil];
}


#pragma mark Button Presses
-(IBAction) signInPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSignInPressed));
}

-(IBAction) startRecordingPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kStartRecordingPressed));
}
-(IBAction) stopRecordingPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kStopRecordingPressed));
}

-(IBAction) cancelRecordingPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kCancelRecordingPressed));
}

-(IBAction) playAudioPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kPlayAudioPressed));
}

-(IBAction) stopAudioPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kStopAudioPressed));
}

-(IBAction) deleteAudioPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kDeleteAudioPressed));
}

-(IBAction) sendAudioPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSendAudioPressed));
}

-(IBAction) cancelAudioPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kCancelAudioPressed));
}

-(IBAction) changePasswordPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kChangePasswordPressed));
}

-(IBAction) logOutPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kLogOutPressed));
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
    if (textField == self.mLoginUsername)
    {
        [self.mLoginUsername resignFirstResponder];
        [self.mLoginPassword becomeFirstResponder];
    }
    else if (textField == self.mLoginPassword)
    {
        [self.mLoginPassword resignFirstResponder];
    }
    else if (textField == self.mOldPassword)
    {
        [self.mOldPassword resignFirstResponder];
        [self.mNewPassword becomeFirstResponder];
    }
    else if (textField == self.mNewPassword)
    {
        [self.mNewPassword resignFirstResponder];
    }

    return NO;
}

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
#pragma unused(section)

    if (tableView == self.mMyRecordingsTable)
    {
        return (NSInteger)gMyRecordingsEntries.size();
    }

    return (NSInteger)5;
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    [cell setBackgroundColor:[UIColor whiteColor]];
}

-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(indexPath)
    if (tableView == self.mMyRecordingsTable)
    {
        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"MemoAppTableItem";

        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.textLabel.text = [NSString stringWithUTF8String:gMyRecordingsEntries[indexPath.row].c_str()];

        cell.imageView.image = nil;
        
        return cell;
    }
    else
    {
        const char* names[5] =
        {
            "Yoji Izaki",
            "Shinzo Abe",
            "Barack Obama",
            "TJ Grant",
            "Manjesh Mallavali",
        };
    #pragma unused(indexPath)

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"HUDDemoTableItem";

        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.textLabel.text = [NSString stringWithUTF8String:names[indexPath.row]];

        cell.imageView.image = nil;

        return cell;
    }
}

-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kTableItemSelected, (tUInt32)indexPath.row));
}

-(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item
{
#pragma unused(tabBar)
    if (item == self.mInboxTab)
    {
        MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kInboxTabPressed));
    }
    else if (item == self.mMemosTab)
    {
        MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kMemosTabPressed));
    }
    else if (item == self.mNewMemoTab)
    {
        MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kNewMemoTabPressed));
    }
    else if (item == self.mSettingsTab)
    {
        MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSettingsTabPressed));
    }
}

-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
#pragma unused(alertView)
    if (buttonIndex == 0)
    {
        MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kOKYesAlertPressed));
    }
    else
    {
        MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kNoAlertPressed));
    }
}

@end
