#include "ViewController.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"

#include "GCTEvent.h"
#include "GCTEventManager.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

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

    [self.mInboxTable registerNib:[UINib nibWithNibName:@"InboxEntryCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"InboxEntryCell"];
    [self.mHistoryTable registerNib:[UINib nibWithNibName:@"InboxEntryCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"InboxEntryCell"];
    [self.mInboxMessageOptionsTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];
    [self.mRecordMessageOptionsTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];
    [self.mMessageHistoryOptionsTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];
    [self.mSettingsTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];

    [self ctorRecorder];
    self.view.autoresizesSubviews = YES;

    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_6_1)
    {
        [[UIApplication sharedApplication] setStatusBarHidden:YES withAnimation:UIStatusBarAnimationNone];
//        CGRect r = self.view.bounds;
//        r.origin.y += 20;
//        [self.view setBounds:r];
    }

    self.mInboxMessageView.contentSize = CGSizeMake(320, 593);
    self.mMessageHistoryView.contentSize = CGSizeMake(320, 429);
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


- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
#pragma unused(textField)
    [textField endEditing:YES];
    return YES;
}

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
#pragma unused(tableView, section)

    if (tableView == self.mInboxTable)
    {
        return (NSInteger)3;
    }
    else if (tableView == self.mHistoryTable)
    {
        return (NSInteger)3;
    }
    else if (tableView == self.mInboxMessageOptionsTable)
    {
        return (NSInteger)3;
    }
    else if (tableView == self.mMessageHistoryOptionsTable)
    {
        return (NSInteger)1;
    }
    else if (tableView == self.mRecordMessageOptionsTable)
    {
        return (NSInteger)2;
    }
    else if (tableView == self.mSettingsTable)
    {
        return (NSInteger)4;
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
    const char* names[1] =
    {
        "Unimplemented",
    };

    if (tableView == self.mInboxTable)
    {
        const char* from[] =
        {
            "Sato Taro",
            "Yamada Hanako",
            "Planning 2",
        };

        const char* date[] =
        {
            "12/21 12:24",
            "12/20 12:12",
            "12/18 11:43",
        };

        const char* transcription[] =
        {
            "「知りません。日本語で何か…",
            "「でもでもそんなの関係ねえ…",
            "「ニューヨークで入浴…",
        };

        const bool recv[] =
        {
            true,
            false,
            false,
        };

        const bool isGroup[] =
        {
            false,
            false,
            true,
        };

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"InboxEntryCell";

        InboxEntryCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[InboxEntryCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mFrom.text = [NSString stringWithUTF8String:from[indexPath.row]];
        cell.mDate.text = [NSString stringWithUTF8String:date[indexPath.row]];
        cell.mTranscription.text = [NSString stringWithUTF8String:transcription[indexPath.row]];
        cell.mStatusIcon.image = [UIImage imageNamed:(recv[indexPath.row] ? @"icon-receive.png" : @"icon-sent.png")];
        cell.mFrom.textColor =  isGroup[indexPath.row] ?
            [UIColor colorWithRed:0.0f green:0.47f blue:1.0f alpha:1.0f] :
            [UIColor colorWithRed:0.0f green:0.0f  blue:0.0f alpha:1.0f];

        return cell;
    }
    else if (tableView == self.mHistoryTable)
    {
        const char* from[] =
        {
            "Self",
            "Self",
            "Sato Taro",
        };

        const char* date[] =
        {
            "12/18 11:43",
            "12/17 10:12",
            "12/15  8:45",
        };

        const char* transcription[] =
        {
            "「何でもいい…",
            "「任せる…",
            "「明日何時に電話していい…",
        };

        const bool recv[] =
        {
            true,
            false,
            false,
        };

        const bool isGroup[] =
        {
            false,
            false,
            true,
        };

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"InboxEntryCell";

        InboxEntryCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[InboxEntryCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mFrom.text = [NSString stringWithUTF8String:from[indexPath.row]];
        cell.mDate.text = [NSString stringWithUTF8String:date[indexPath.row]];
        cell.mTranscription.text = [NSString stringWithUTF8String:transcription[indexPath.row]];
        cell.mStatusIcon.image = [UIImage imageNamed:(recv[indexPath.row] ? @"icon-receive.png" : @"icon-sent.png")];
        cell.mFrom.textColor =  isGroup[indexPath.row] ?
        [UIColor colorWithRed:0.0f green:0.47f blue:1.0f alpha:1.0f] :
        [UIColor colorWithRed:0.0f green:0.0f  blue:0.0f alpha:1.0f];
        
        return cell;
    }
    else if (tableView == self.mInboxMessageOptionsTable)
    {
        const char* heading[] =
        {
            "Past Messages",
            "Reply Message",
            "Delete",
        };

        const char* subheading[] =
        {
            "Show message history",
            "Send recorded message",
            "Delete this message",
        };

        const bool hasRightArrow[] =
        {
            true,
            true,
            false,
        };

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"HeadingSubCell";

        HeadingSubCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[HeadingSubCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mHeading.text = [NSString stringWithUTF8String:heading[indexPath.row]];
        cell.mSub.text = [NSString stringWithUTF8String:subheading[indexPath.row]];
        cell.mRightArrow.hidden = hasRightArrow[indexPath.row] ? NO : YES;

        return cell;
    }
    else if (tableView == self.mMessageHistoryOptionsTable)
    {
        const char* heading[] =
        {
            "Reply Message",
        };

        const char* subheading[] =
        {
            "Send recorded message",
        };

        const bool hasRightArrow[] =
        {
            true,
        };

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"HeadingSubCell";

        HeadingSubCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[HeadingSubCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mHeading.text = [NSString stringWithUTF8String:heading[indexPath.row]];
        cell.mSub.text = [NSString stringWithUTF8String:subheading[indexPath.row]];
        cell.mRightArrow.hidden = hasRightArrow[indexPath.row] ? NO : YES;
        
        return cell;
    }
    else if (tableView == self.mRecordMessageOptionsTable)
    {
        const char* heading[] =
        {
            "Done, Send",
            "Cancel and Delete",
        };

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"HeadingSubCell";

        HeadingSubCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[HeadingSubCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mHeading.text = [NSString stringWithUTF8String:heading[indexPath.row]];
        cell.mSub.text = [NSString stringWithUTF8String:""];
        cell.mRightArrow.hidden = YES;
        
        return cell;
    }
    else if (tableView == self.mSettingsTable)
    {
        const char* heading[] =
        {
            "Registered Name",
            "Change Password",
            "Log Out",
            "About this app",
        };

        const char* subheading[] =
        {
            "Change registered name",
            "Change user's password",
            "Log out from current user",
            "About GoCastTalk",
        };

        const bool hasRightArrow[] =
        {
            true,
            true,
            false,
            true,
        };

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"HeadingSubCell";

        HeadingSubCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[HeadingSubCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mHeading.text = [NSString stringWithUTF8String:heading[indexPath.row]];
        cell.mSub.text = [NSString stringWithUTF8String:subheading[indexPath.row]];
        cell.mRightArrow.hidden = hasRightArrow[indexPath.row] ? NO : YES;
        
        return cell;
    }
    else
    {
        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"TableItem";

        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.textLabel.text = [NSString stringWithUTF8String:names[0]];

        cell.imageView.image = nil;

        return cell;
    }
}

-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTableItemSelected, (tUInt32)indexPath.row));
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    return NO;
}

// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (editingStyle == UITableViewCellEditingStyleDelete)
    {
//        if (tableView == self.mInboxTable)
//        {
//            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTableItemDeleted, (tUInt32)indexPath.row));
//        }
    }
}

-(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item
{
#pragma unused(tabBar)
    if (item == self.mInboxTab)
    {
        GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kInboxTabPressed));
    }
    else if (item == self.mNewMemoTab)
    {
        GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kNewMemoTabPressed));
    }
    else if (item == self.mContactsTab)
    {
        GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kContactsTabPressed));
    }
    else if (item == self.mGroupsTab)
    {
        GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kGroupsTabPressed));
    }
    else if (item == self.mSettingsTab)
    {
        GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kSettingsTabPressed));
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

@end
