#include "RecordMessageVC.h"
#include "ContactsVC.h"
#include "InboxVC.h"

#include "Base/package.h"
#include "Io/package.h"

#include "Testbed/GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"
#import "CCCell.h"

@interface RecordMessageVC()
{
}
@end

@implementation RecordMessageVC

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

    [self.mTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];
    [self.mToTable registerNib:[UINib nibWithNibName:@"CCCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"CCCell"];

    self.view.autoresizesSubviews = YES;

    UIBarButtonItem *anotherButton = [[[UIBarButtonItem alloc] initWithTitle:@"削除" style:UIBarButtonItemStylePlain target:self action:@selector(helpButton:)] autorelease];
    self.navigationItem.rightBarButtonItem = anotherButton;

    mPeer = new RecordMessageScreen(self, mInitObject, mIsForwarded, mIsChild);

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

    if (self)
    {
        self->mIsChild = false;
    }

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
            "完了して送信",   // "Done, Send",
            "中止して削除",   // "Cancel and Delete",
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

        cell.mHeading.text = [NSString stringWithUTF8String:heading[indexPath.row]];
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
                [cell setAsZero:self->mToExpanded withLabel:"クリックして宛先を表示"]; //"Add recipients"
                break;
                
            default:
                [cell setAsNonZero:(size_t)indexPath.row - 1 withLabel:InboxScreen::nameFromEmail(mPeer->getTo((size_t)indexPath.row - 1))];
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
    [self.mScrollView setContentOffset:CGPointMake(0, self.mTranscription.frame.origin.y - 60) animated:YES];
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

-(void)customInit:(const JSONObject&)newObject isForwarded:(bool)newIsForwarded
{
    mInitObject     = newObject;
    mIsForwarded    = newIsForwarded;
    mIsChild        = true;
}

-(void) pushContacts
{
    ContactsVC* nextVC = [[[ContactsVC alloc] initWithNibName:@"ContactsVC" bundle:nil] autorelease];
    [nextVC customInit:true withIdentifier:mPeer];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void)popSelf
{
    [(UINavigationController*)self.parentViewController popViewControllerAnimated:TRUE];
}

-(void)popAllInboxViews
{
    [gAppDelegateInstance.mInboxVC popToRootViewControllerAnimated:NO];
    [((InboxVC*)gAppDelegateInstance.mInboxVC.topViewController).mTable scrollRectToVisible:CGRectMake(0, 0, 1, 1) animated:YES];
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

-(void)pushMessageSent
{
    [gAppDelegateInstance pushMessageSent];
}

-(void)refreshExpanded
{
    [self expandTo];
}

-(void) setWaitToRecordUI
{
    self.mStatusLabel.text = @"メッセージを録音";
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
    self.mStatusLabel.text = @"メッセージを再生";
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
}

-(void) setPlayingUI
{
    self.mStatusLabel.text = @"再生中・・・";
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
    self.mStatusLabel.text = @"メッセージを再生";
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
    self.mStatusLabel.text = @"録音中・・・";
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

@end

