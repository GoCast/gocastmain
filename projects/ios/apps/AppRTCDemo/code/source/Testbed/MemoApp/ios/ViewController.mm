#include "ViewController.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"

#include "MemoEvent.h"
#include "MemoEventManager.h"

#import "InboxCell.h"

std::vector<std::string> gUserListEntries;
std::vector<std::string> gMyInboxListEntries;
std::vector<std::string> gMyGroupsListEntries;
std::vector<std::string> gMemberListEntries;

@interface ViewController()
{
}
@end

@implementation ViewController

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    [self.mInboxTable registerNib:[UINib nibWithNibName:@"InboxCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"InboxCell"];

    [self ctorRecorder];
    self.view.autoresizesSubviews = YES;

    if (floor(NSFoundationVersionNumber) > NSFoundationVersionNumber_iOS_6_1)
    {
        CGRect r = self.view.bounds;
        r.origin.y -= 20;
        [self.view setBounds:r];
    }
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
    [self.mLoginUsername resignFirstResponder];
    [self.mLoginPassword resignFirstResponder];

    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSignInPressed));
}

-(IBAction) newAccountPressed:(id)sender
{
#pragma unused(sender)
    [self.mLoginUsername resignFirstResponder];
    [self.mLoginPassword resignFirstResponder];

    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kNewAccountPressed));
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

-(IBAction) saveRecordingPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSaveRecordingPressed));
}

-(IBAction) sendRecordingPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSendRecordingPressed));
}

-(IBAction) playAudioPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kPlayAudioPressed));
}

-(IBAction) sendAudioPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSendAudioPressed));
}

-(IBAction) changePasswordPressed:(id)sender
{
#pragma unused(sender)
    [self.mOldPassword resignFirstResponder];
    [self.mNewPassword resignFirstResponder];
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kChangePasswordPressed));
}

-(IBAction) logOutPressed:(id)sender
{
#pragma unused(sender)
    [self.mOldPassword resignFirstResponder];
    [self.mNewPassword resignFirstResponder];
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kLogOutPressed));
}

-(IBAction) editProfilePressed:(id)sender
{
#pragma unused(sender)
    [self.mOldPassword resignFirstResponder];
    [self.mNewPassword resignFirstResponder];
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kEditProfilePressed));
}

-(IBAction) saveProfilePressed:(id)sender
{
#pragma unused(sender)
    [self.mOldPassword resignFirstResponder];
    [self.mNewPassword resignFirstResponder];
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSaveProfilePressed));
}

//mMyGroupsView
-(IBAction) addGroupPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kAddGroupPressed));
}

-(IBAction) editGroupPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kEditGroupPressed));
}

-(IBAction) saveGroupPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSaveGroupPressed));
}

//mSendToGroupView
-(IBAction) sendSendToGroupPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kSendSendToGroupPressed));
}

-(IBAction) cancelSendToGroupPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kCancelSendToGroupPressed));
}

//mVersionCheckView
-(IBAction) retryVersionCheckPressed:(id)sender
{
#pragma unused(sender)
    MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kRetryVersionCheckPressed));
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
    else if (textField == self.mKanjiName)
    {
        [self.mKanjiName resignFirstResponder];
        [self.mKanaName becomeFirstResponder];
    }
    else if (textField == self.mKanaName)
    {
        [self.mKanaName resignFirstResponder];
    }
    else if (textField == self.mGroupName)
    {
        [self.mGroupName resignFirstResponder];
    }

    return NO;
}

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
#pragma unused(section)

    if (tableView == self.mSendToGroupTable)
    {
        return (NSInteger)gUserListEntries.size();
    }
    else if (tableView == self.mInboxTable)
    {
        return (NSInteger)gMyInboxListEntries.size();
    }
    else if (tableView == self.mCurrentGroupsTable)
    {
        return (NSInteger)gMyGroupsListEntries.size();
    }
    else if (tableView == self.mEditGroupTable)
    {
        return (NSInteger)gMemberListEntries.size();
    }

    return (NSInteger)1;
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    [cell setBackgroundColor:[UIColor whiteColor]];
}

-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(indexPath)
    if (tableView == self.mSendToGroupTable)
    {
        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"MemoAppTableItem";

        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.textLabel.text = [NSString stringWithUTF8String:gUserListEntries[indexPath.row].c_str()];

        cell.imageView.image = nil;
        
        return cell;
    }
    else if (tableView == self.mEditGroupTable)
    {
        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"MemoAppTableItem";

        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.textLabel.text = [NSString stringWithUTF8String:gMemberListEntries[indexPath.row].c_str()];

        cell.imageView.image = nil;
        
        return cell;
    }
    else if (tableView == self.mCurrentGroupsTable)
    {
        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"MemoAppTableItem";

        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.textLabel.text = [NSString stringWithUTF8String:gMyGroupsListEntries[indexPath.row].c_str()];

        cell.imageView.image = nil;
        
        return cell;
    }
    else if (tableView == self.mInboxTable)
    {
        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"InboxCell";

        InboxCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[InboxCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        std::string from;
        std::string date;

        std::string str = gMyInboxListEntries[(size_t)indexPath.row];

        if (str.find('-', 0) != std::string::npos)
        {
            from = str.substr(str.find('-', 0) + 1);
        }
        else
        {
            from = "Me";
        }

        char buf[80];
        sprintf(buf, "%s/%s/%s %02d:%s %s",
                str.substr(4, 2).c_str(), str.substr(6, 2).c_str(), str.substr(0,4).c_str(),
                (atoi(str.substr(8, 2).c_str()) >= 12 ? -12 : 0) + atoi(str.substr(8, 2).c_str()),
                str.substr(10, 2).c_str(),
                (atoi(str.substr(8, 2).c_str()) >= 12 ? "PM" : "AM"));

        date = buf;

        cell.mFrom.text = [NSString stringWithUTF8String:from.c_str()];
        cell.mDate.text = [NSString stringWithUTF8String:date.c_str()];

        return cell;
    }
    else
    {
        const char* names[1] =
        {
            "Unimplemented",
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

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (tableView == self.mInboxTable)
    {
        return YES;
    }
    else if (tableView == self.mCurrentGroupsTable)
    {
        return YES;
    }
    else if (tableView == self.mEditGroupTable)
    {
        return NO;
    }
    return NO;
}

// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (editingStyle == UITableViewCellEditingStyleDelete)
    {
        if (tableView == self.mInboxTable)
        {
            MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kTableItemDeleted, (tUInt32)indexPath.row));
        }
        if (tableView == self.mCurrentGroupsTable)
        {
            MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kTableItemDeleted, (tUInt32)indexPath.row));
        }
        if (tableView == self.mEditGroupTable)
        {
            MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kTableItemDeleted, (tUInt32)indexPath.row));
        }
    }
}

-(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item
{
#pragma unused(tabBar)
    if (item == self.mInboxTab)
    {
        MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kInboxTabPressed));
    }
    else if (item == self.mNewMemoTab)
    {
        MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kNewMemoTabPressed));
    }
    else if (item == self.mGroupsTab)
    {
        MemoEventManager::getInstance()->notify(MemoEvent(MemoEvent::kGroupsTabPressed));
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
