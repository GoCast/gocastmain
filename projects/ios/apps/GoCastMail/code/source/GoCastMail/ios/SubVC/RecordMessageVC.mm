#include "RecordMessageVC.h"

#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "GoCastMail/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"
#import "CCCell.h"

@interface RecordMessageVC()
{
}
@end

@implementation RecordMessageVC

-(void) refreshLanguage
{
    self.navigationItem.rightBarButtonItem.title = [NSString stringWithUTF8String:std::string("Delete").c_str()];
    self.mTranscriptionLabel.text = [NSString stringWithUTF8String:std::string("Automatic Transcription").c_str()];

    [self.mTable reloadData];
    [self.mToTable reloadData];
}

#pragma mark CCCell helper methods

#define kCellSize 40

-(void)expandTo
{
    CGRect f;
    size_t count = mPeer->getToCount() + 1;

    f = self.mToTable.frame;
    f.size.height = kCellSize * count;
    [self.mToTable setFrame:f];

    f = self.mBottomHalf.frame;
    f.origin.y = kCellSize * count;
    [self.mBottomHalf setFrame:f];

    self->mToExpanded = true;
    [self.mToTable reloadData];

    CGSize s = self->mScrollPreExpansion;

    s.height += kCellSize * (count - 1);

    [self.mScrollView setContentSize:s];
}

-(void)contractTo
{
    CGRect f;

    f = self.mToTable.frame;
    f.size.height = kCellSize;
    [self.mToTable setFrame:f];

    f = self.mBottomHalf.frame;
    f.origin.y = kCellSize;
    [self.mBottomHalf setFrame:f];

    self->mToExpanded = false;
    [self.mToTable reloadData];

    [self.mScrollView setContentSize:self->mScrollPreExpansion];
}

-(void)toggleExpand
{
    if (self->mToExpanded)
    {
        [self contractTo];
    }
    else
    {
        [self expandTo];
    }
}

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    UIBarButtonItem *anotherButton = [[[UIBarButtonItem alloc] initWithTitle:[NSString stringWithUTF8String:std::string("Delete").c_str()] style:UIBarButtonItemStylePlain target:self action:@selector(helpButton:)] autorelease];
    self.navigationItem.rightBarButtonItem = anotherButton;

    [self refreshLanguage];

    [self.mTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];
    [self.mToTable registerNib:[UINib nibWithNibName:@"CCCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"CCCell"];

    self.view.autoresizesSubviews = YES;

    mPeer = new RecordMessageScreen(self, mInitObject);

    self->mScrollPreExpansion = self.mScrollView.contentSize;
    [self contractTo];

    [self setTranscriptionEnabled:false];

    [self switchToInboxTab];
    //    self.mToLabel.text = [NSString stringWithUTF8String:("宛先: " + mPeer->getTo()).c_str()];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
}

- (id)init
{
    self = [super init];

    return self;
}

- (void)dealloc
{
    delete mPeer;

    [super dealloc];
}

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
#pragma unused(tableView, section)

    if (tableView == self.mTable)
    {
        return (NSInteger)2;
    }
    else if (tableView == self.mToTable)
    {
        if (!self->mToExpanded)
        {
            return (NSInteger)1;
        }

        return (NSInteger)mPeer->getToCount() + 1;
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

    if (tableView == self.mTable)
    {
        const char* heading[] =
        {
            "Done, Send",
            "Cancel and Delete",
        };

        UIColor* colors[] =
        {
            [UIColor colorWithRed:0.42f green:0.75f blue:0.87f alpha:1.0f],
            [UIColor colorWithRed:1.0f green:0.6f blue:0.8f alpha:1.0f],
        };

        UIColor* grayColors[] =
        {
            [UIColor colorWithRed:0.71f green:0.87f blue:0.93f alpha:1.0f],
            [UIColor colorWithRed:1.0f green:0.8f blue:0.9f alpha:1.0f],
        };

        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"HeadingSubCell";

        HeadingSubCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[HeadingSubCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mHeading.text = [NSString stringWithUTF8String:std::string(heading[indexPath.row]).c_str()];
        cell.mSub.text = [NSString stringWithUTF8String:""];
        cell.mRightArrow.hidden = YES;

        cell.mHeading.textColor = self.mTable.allowsSelection == YES ? [UIColor whiteColor] : [UIColor lightGrayColor];
        cell.mContentView.backgroundColor = self.mTable.allowsSelection == YES ? colors[indexPath.row] : grayColors[indexPath.row];

        return cell;
    }
    else if (tableView == self.mToTable)
    {
        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"CCCell";

        CCCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[CCCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        [cell setDelegate:self];

        switch (indexPath.row)
        {
            case 0:
                [cell setAsZero:self->mToExpanded withLabel:(mToExpanded ? "" : std::string("Click to view recipients"))];
                break;
                
            default:
                [cell setAsNonZero:(size_t)indexPath.row - 1 withLabel:"abc123"];
                break;
        }

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
    if (tableView == self.mTable)
    {
        switch (indexPath.row)
        {
            case 0: mPeer->donePressed(); break;
            case 1: mPeer->cancelPressed(); break;

            default:
                break;
        }
    }
    else if (tableView == self.mToTable)
    {
        switch (indexPath.row)
        {
            case 0: [self toggleExpand]; break;

            default:
                break;
        }
    }
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
//        if (tableView == self.mTable)
//        {
//            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTableItemDeleted, (tUInt32)indexPath.row));
//        }
    }
}

-(void)textViewDidBeginEditing:(UITextView *)textView
{
#pragma unused(textView)
    [self.mScrollView setContentOffset:CGPointMake(0, self.mTranscription.frame.origin.y - 64) animated:YES];
}

-(BOOL)textView:(UITextView *)textView shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text
{
#pragma unused(range)

    if([text isEqualToString:@"\n"])
    {
        [textView resignFirstResponder];
        return NO;
    }

    return YES;
}

#pragma mark CCCellDelegate stuff
-(void)onAddPressed
{
    [self pushContacts];
}

-(void)onDelPressed:(const size_t &)i
{
    mPeer->deleteTo(i);
    [self expandTo];
}

-(void)setBlockingViewVisible:(bool)newVisible
{
    [self.mBlockingView setHidden:newVisible ? NO : YES];
}

-(IBAction)pausePressed
{
    mPeer->pausePressed();
}

-(IBAction)recordPressed
{
    mPeer->recordPressed();
}

-(IBAction)playPressed
{
    mPeer->playPressed();
}

-(IBAction)stopPressed
{
    mPeer->stopPressed();
}

-(IBAction)helpButton:(UIBarButtonItem*)sender
{
#pragma unused(sender)
    mPeer->cancelPressed();
}

-(void)customInit:(const JSONObject&)newObject
{
    mInitObject     = newObject;
}

-(void) pushContacts
{
//    ContactsVC* nextVC = [[[ContactsVC alloc] initWithNibName:@"ContactsVC" bundle:nil] autorelease];
//    [nextVC customInit:true withIdentifier:mPeer];
//    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void)popSelf
{
    [(UINavigationController*)self.parentViewController popViewControllerAnimated:TRUE];
}

-(void)popAllInboxViews
{
//    [gAppDelegateInstance.mInboxVC popToRootViewControllerAnimated:NO];
//    [((InboxVC*)gAppDelegateInstance.mInboxVC.topViewController).mTable scrollRectToVisible:CGRectMake(0, 0, 1, 1) animated:YES];
}

-(void)startEditingTranscription
{
    CGRect r = self.mTranscription.frame;
    [self.mScrollView scrollRectToVisible:r animated:YES];
    [self.mTranscription becomeFirstResponder];
}

-(void)switchToInboxTab
{
    [gAppDelegateInstance.tabBarController setSelectedIndex:0];
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kInboxTabPressed));
}

-(void)switchToNewMemoTab
{
    [gAppDelegateInstance.tabBarController setSelectedIndex:1];
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kNewMemoTabPressed));
}

-(void)refreshExpanded
{
    [self expandTo];
}

-(void) setWaitToRecordUI
{
    self.mStatusLabel.text = [NSString stringWithUTF8String:std::string("Record a message").c_str()];
    self.mStatusLabel.textColor = [UIColor blackColor];
    [self setTimeLabel:""];

    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:NO];
    [self.mPlayButton   setHidden:YES];
    [self.mStopButton   setHidden:YES];

    self.mTable.allowsSelection = YES;
    [self.navigationItem.rightBarButtonItem setEnabled:YES];

    [self.mTable reloadData];

    [self.mSlider setEnabled:NO];
    [self.mSlider setValue:0];
}

-(void) setWaitToPlayUI
{
    self.mStatusLabel.text = [NSString stringWithUTF8String:std::string("Playback Message").c_str()];
    self.mStatusLabel.textColor = [UIColor blackColor];

    [self.mPlayButton   setEnabled:YES];

    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:NO];
    [self.mStopButton   setHidden:YES];

    self.mTable.allowsSelection = YES;
    [self.navigationItem.rightBarButtonItem setEnabled:YES];

    [self.mTable reloadData];

    [self.mSlider setEnabled:YES];
    [self setSliderPercentage:0.0f];
}

-(void) setPlayingUI
{
    self.mStatusLabel.text = [NSString stringWithUTF8String:std::string("Playing...").c_str()];
    self.mStatusLabel.textColor = [UIColor blackColor];

    [self.mPauseButton  setHidden:NO];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:YES];
    [self.mStopButton   setHidden:YES];

    self.mTable.allowsSelection = YES;
    [self.navigationItem.rightBarButtonItem setEnabled:YES];

    [self.mTable reloadData];

    [self.mSlider setEnabled:YES];
}

-(void) setPausedUI
{
    self.mStatusLabel.text = [NSString stringWithUTF8String:std::string("Playback Message").c_str()];
    self.mStatusLabel.textColor = [UIColor blackColor];
    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:NO];
    [self.mStopButton   setHidden:YES];

    self.mTable.allowsSelection = YES;
    [self.navigationItem.rightBarButtonItem setEnabled:YES];

    [self.mTable reloadData];

    [self.mSlider setEnabled:YES];
}

-(void) setRecordingUI
{
    self.mStatusLabel.text = [NSString stringWithUTF8String:std::string("Recording...").c_str()];
    self.mStatusLabel.textColor = [UIColor redColor];
    [self setTimeLabel:"00:00"];

    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:YES];
    [self.mStopButton   setHidden:NO];

    self.mTable.allowsSelection = NO;
    [self.navigationItem.rightBarButtonItem setEnabled:NO];

    [self.mTable reloadData];

    [self.mSlider setEnabled:NO];
    [self.mSlider setValue:0];
}

-(void) setWaitForTranscriptUI
{
    [self.mPlayButton   setEnabled:NO];

    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:NO];
    [self.mStopButton   setHidden:YES];

    self.mTable.allowsSelection = YES;
    [self.navigationItem.rightBarButtonItem setEnabled:YES];

    [self.mTable reloadData];

    [self.mSlider setEnabled:YES];
}

-(void) setTimeLabel:(const std::string&)newLabel
{
    self.mTime.text = [NSString stringWithUTF8String:newLabel.c_str()];
}

-(void) setTranscription:(const std::string&)newLabel
{
    self.mTranscription.text = [NSString stringWithUTF8String:newLabel.c_str()];
}

-(std::string) getTranscription
{
    NSString* result = self.mTranscription.text;

    return result ? [result UTF8String] : "";
}

-(void) setTranscriptionEnabled:(bool)newEnabled
{
    [self.mTranscription setEditable:newEnabled];
}

-(void) setSliderPercentage:(float)newPercentage
{
    [self.mSlider setValue:newPercentage];
}

-(void) sendEmailTo:(const JSONArray&)newTo withAttachment:(const tFile&)audioFile usingName:(const std::string&)newName
{
    if ([MFMailComposeViewController canSendMail])
    {
        std::string body;
        body += std::string("voice email pre");
        body += [self.mTranscription.text UTF8String] ? [self.mTranscription.text UTF8String] : "";
        body += std::string("voice email post");

        MFMailComposeViewController *mailer = [[MFMailComposeViewController alloc] init];
        mailer.mailComposeDelegate = self;
        [mailer setSubject:[NSString stringWithUTF8String:"GoCast Talk Voice Memo"]];
        NSMutableArray *toRecipients = [NSMutableArray array];

        for(size_t i = 0; i < newTo.size(); i++)
        {
            [toRecipients addObject:[NSString stringWithUTF8String:newTo[i].mString.c_str()]];
        }

        [mailer setToRecipients:toRecipients];
        NSString *emailBody = [NSString stringWithUTF8String:body.c_str()];
        [mailer setMessageBody:emailBody isHTML:NO];

        NSData* data = [NSData dataWithContentsOfFile:[NSString stringWithUTF8String:audioFile.GetFullPath().c_str()]];
        [mailer addAttachmentData:data mimeType:@"audio/wav" fileName:[NSString stringWithUTF8String:newName.c_str()]];
        [self presentViewController:mailer animated:YES completion:nil];
        [mailer release];
    }
}

- (void)mailComposeController:(MFMailComposeViewController *)controller
          didFinishWithResult:(MFMailComposeResult)result
                        error:(NSError *)error
{
#pragma unused(controller, result, error)
    [self dismissViewControllerAnimated:YES completion:NULL];
}

@end

