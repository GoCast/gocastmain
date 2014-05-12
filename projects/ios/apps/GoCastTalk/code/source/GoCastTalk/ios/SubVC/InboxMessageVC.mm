#include "InboxMessageVC.h"
#include "RecordMessageVC.h"
#include "MessageHistoryVC.h"

#include "Base/package.h"
#include "Io/package.h"
#include "Math/package.h"

#include "GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface InboxMessageVC()
{
}
@end

@implementation InboxMessageVC

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
    f.origin.y = mOriginalBottomY + kCellSize * (count - 1);
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
    f.origin.y = mOriginalBottomY;
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

    mPeer = new InboxMessageScreen(self, mInitObject);

    self->mScrollPreExpansion   = self.mScrollView.contentSize;
    self->mOriginalBottomY      = self.mBottomHalf.frame.origin.y;
    [self contractTo];

    std::string date    = InboxScreen::gmtToLocal(mInitObject["date"].mString);
    std::string result  = "xx/xx xx:xx";

    if (date.size() == 16)
    {
        result = date.substr(4,2) + "/" + date.substr(6,2) + " " + date.substr(8,2) + ":" + date.substr(10,2);
    }

    self.mReceive.image = [UIImage imageNamed:((mInitObject["from"].mString != InboxScreen::mEmailAddress) ? @"icon-receive.png" : @"icon-sent.png")];

    std::string email   = mInitObject["from"].mString;
    std::string from    = InboxScreen::nameFromEmail(email);

    if (from.empty())
    {
        from = email;
    }

    self.mFrom.text = [NSString stringWithUTF8String:from.c_str()];
    self.mDate.text = [NSString stringWithUTF8String:result.c_str()];

    if (!mInitObject["transcription"].mObject["ja"].mString.empty())
    {
        self.mTranscription.text = [NSString stringWithUTF8String:mInitObject["transcription"].mObject["ja"].mString.c_str()];
    }
    else
    {
        self.mTranscription.text = [NSString stringWithUTF8String:I18N::getInstance()->retrieve("Transcription not available").c_str()];
    }

    [self.mSlider setValue:0];
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
        return (NSInteger)3;
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
#pragma unused(indexPath)
    if (tableView == self.mTable)
    {
        [cell setBackgroundColor:[UIColor whiteColor]];
    }
    else if (tableView == self.mToTable)
    {
        [cell setBackgroundColor:[UIColor colorWithRed:0.9f green:0.9f blue:0.9f alpha:1.0f]];
    }
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
            "Reply Message",
            "Past Messages",
            "Delete",
        };

        const char* subheading[] =
        {
            "Send recorded message",
            "Show message history",
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

        cell.mHeading.text = [NSString stringWithUTF8String:I18N::getInstance()->retrieve(heading[indexPath.row]).c_str()];
        cell.mSub.text = [NSString stringWithUTF8String:I18N::getInstance()->retrieve(subheading[indexPath.row]).c_str()];
        cell.mRightArrow.hidden = hasRightArrow[indexPath.row] ? NO : YES;

        cell.mHeading.textColor = [UIColor whiteColor];
        cell.mSub.textColor     = [UIColor whiteColor];

        switch (indexPath.row)
        {
            case 0: cell.mContentView.backgroundColor = [UIColor colorWithRed:0.8f green:0.6f blue:1.0f alpha:1.0f]; break;
            case 1: cell.mContentView.backgroundColor = [UIColor colorWithRed:0.6f green:0.6f blue:1.0f alpha:1.0f]; break;
            case 2: cell.mContentView.backgroundColor = [UIColor colorWithRed:1.0f green:0.6f blue:0.8f alpha:1.0f]; break;

            default:
                break;
        }

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

        [cell setDelegate:nil];

        switch (indexPath.row)
        {
            case 0:
                [cell setAsZero:self->mToExpanded withLabel:(mToExpanded ? "" : I18N::getInstance()->retrieve("Click to view recipients"))]; //
                break;

            default:
                [cell setAsNonZero:(size_t)indexPath.row - 1 withLabel:InboxScreen::nameFromEmail(mPeer->getTo((size_t)indexPath.row - 1))];
                break;
        }
        [cell noButtons];

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
#pragma unused(tableView)

    if (tableView == self.mTable)
    {
        switch (indexPath.row)
        {
            case 0: mPeer->replyPressed(); break;
            case 1: mPeer->pastPressed(); break;
            case 2: mPeer->deletePressed(); break;

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

-(void)setBlockingViewVisible:(bool)newVisible
{
    [self.mBlockingView setHidden:newVisible ? NO : YES];
}

-(void)customInit:(const JSONObject&)newObject
{
    mInitObject = newObject;
}

-(IBAction)playPressed
{
    mPeer->playPressed();
}

-(void)setButtonImagePlay
{
    [self.mPlayButton setImage:[UIImage imageNamed:@"button-play-white.png"] forState:UIControlStateNormal];
}

-(void)setButtonImagePause
{
    [self.mPlayButton setImage:[UIImage imageNamed:@"button-pause-white.png"] forState:UIControlStateNormal];
}

-(void)setTimeLabel:(const std::string&)newLabel
{
    self.mTime.text = [NSString stringWithUTF8String:newLabel.c_str()];
}

-(void) popSelf
{
    [(UINavigationController*)self.parentViewController popViewControllerAnimated:TRUE];
}

-(void) pushMessageHistory:(const JSONObject &)newObject
{
    MessageHistoryVC* nextVC = [[[MessageHistoryVC alloc] initWithNibName:@"MessageHistoryVC" bundle:nil] autorelease];
    [nextVC customInit:newObject];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void) setSliderPercentage:(float)newPercentage
{
    [self.mSlider setValue:newPercentage];
}

@end

