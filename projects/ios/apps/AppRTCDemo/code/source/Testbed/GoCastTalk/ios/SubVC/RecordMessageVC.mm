#include "RecordMessageVC.h"
#include "ContactsVC.h"

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
-(void)expandTo
{
    CGRect f;
    size_t count = mPeer->getToCount() + 1;

    f = self.mToTable.frame;
    f.size.height = 27 * count;
    [self.mToTable setFrame:f];

    f = self.mBottomHalf.frame;
    f.origin.y = 27 * count;
    [self.mBottomHalf setFrame:f];

    self->mToExpanded = true;
    [self.mToTable reloadData];

    CGSize s = self->mScrollPreExpansion;

    s.height += 27 * (count - 1);

    [self.mScrollView setContentSize:s];
}

-(void)contractTo
{
    CGRect f;

    f = self.mToTable.frame;
    f.size.height = 27;
    [self.mToTable setFrame:f];

    f = self.mBottomHalf.frame;
    f.origin.y = 27;
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

    mPeer = new RecordMessageScreen(self, mInitObject);

    self->mScrollPreExpansion = self.mScrollView.contentSize;
    [self contractTo];

//    self.mToLabel.text = [NSString stringWithUTF8String:("to: " + mPeer->getTo()).c_str()];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
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

        cell.mHeading.textColor = [UIColor whiteColor];
        cell.mContentView.backgroundColor = colors[indexPath.row];

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
                [cell setAsZero:self->mToExpanded];
                break;
                
            default:
                [cell setAsNonZero:(size_t)indexPath.row - 1 withLabel:mPeer->getTo((size_t)indexPath.row - 1)];
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

-(void)customInit:(const JSONObject&)newObject
{
    mInitObject = newObject;
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

-(void)refreshExpanded
{
    [self expandTo];
}

-(void) setWaitToRecordUI
{
    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:NO];
    [self.mPlayButton   setHidden:YES];
    [self.mStopButton   setHidden:YES];
}

-(void) setWaitToPlayUI
{
    [self.mPlayButton   setEnabled:YES];

    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:NO];
    [self.mStopButton   setHidden:YES];
}

-(void) setPlayingUI
{
    [self.mPauseButton  setHidden:NO];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:YES];
    [self.mStopButton   setHidden:YES];
}

-(void) setPausedUI
{
    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:NO];
    [self.mStopButton   setHidden:YES];
}

-(void) setRecordingUI
{
    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:YES];
    [self.mStopButton   setHidden:NO];
}

-(void) setWaitForTranscriptUI
{
    [self.mPlayButton   setEnabled:NO];

    [self.mPauseButton  setHidden:YES];
    [self.mRecordButton setHidden:YES];
    [self.mPlayButton   setHidden:NO];
    [self.mStopButton   setHidden:YES];
}

@end

