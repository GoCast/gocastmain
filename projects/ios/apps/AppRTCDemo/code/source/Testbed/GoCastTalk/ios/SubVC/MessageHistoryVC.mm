#include "MessageHistoryVC.h"
#include "RecordMessageVC.h"
#include "InboxMessageVC.h"

#include "Base/package.h"
#include "Io/package.h"

#include "Testbed/GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface MessageHistoryVC()
{
}
@end

@implementation MessageHistoryVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    [self.mTable registerNib:[UINib nibWithNibName:@"InboxEntryCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"InboxEntryCell"];
    [self.mOptionsTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];

    self.view.autoresizesSubviews = YES;

    mPeer = new MessageHistoryScreen(self, mInitObject);

    std::string date    = mInitObject["date"].mString;
    std::string result  = "xx/xx xx:xx";

    if (date.size() == 16)
    {
        result = date.substr(4,2) + "/" + date.substr(6,2) + " " + date.substr(8,2) + ":" + date.substr(10,2);
    }

    self.mReceive.image = [UIImage imageNamed:((mInitObject["from"].mString != InboxScreen::mToken) ? @"icon-receive.png" : @"icon-sent.png")];
    self.mFrom.text = [NSString stringWithUTF8String:mInitObject["from"].mString.c_str()];
    self.mDate.text = [NSString stringWithUTF8String:result.c_str()];
    self.mTranscription.text = [NSString stringWithUTF8String:mInitObject["transcription"].mObject["ja"].mString.c_str()];

    self.mTranscription.numberOfLines = 0;
    [self.mTranscription sizeToFit];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];

    if (![[self.navigationController viewControllers] containsObject:self])
    {
        GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kPop));
    }
}

- (void)dealloc
{
    [super dealloc];
}

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
#pragma unused(tableView, section)

    if (tableView == self.mTable)
    {
        return (NSInteger)mPeer->getInboxSize() - 1;
    }
    else if (tableView == self.mOptionsTable)
    {
        return (NSInteger)1;
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
        tableView.backgroundView = nil;

        static NSString *simpleTableIdentifier = @"InboxEntryCell";

        InboxEntryCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[InboxEntryCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        cell.mFrom.text = [NSString stringWithUTF8String:mPeer->getFrom(indexPath.row + 1).c_str()];
        cell.mDate.text = [NSString stringWithUTF8String:mPeer->getDate(indexPath.row + 1).c_str()];
        cell.mTranscription.text = [NSString stringWithUTF8String:mPeer->getTranscription(indexPath.row + 1).c_str()];
        cell.mStatusIcon.image = [UIImage imageNamed:(mPeer->getIsReceive(indexPath.row + 1) ? @"icon-receive.png" : @"icon-sent.png")];
        cell.mFrom.textColor =  mPeer->getIsGroup(indexPath.row + 1) ?
        [UIColor colorWithRed:0.0f green:0.47f blue:1.0f alpha:1.0f] :
        [UIColor colorWithRed:0.0f green:0.0f  blue:0.0f alpha:1.0f];

        cell.mTranscription.numberOfLines = 0;
        [cell.mTranscription sizeToFit];

        return cell;

    }
    else if (tableView == self.mOptionsTable)
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
        mPeer->selectItem((size_t)indexPath.row + 1);
    }
    else if (tableView == self.mOptionsTable)
    {
        switch (indexPath.row)
        {
            case 0: mPeer->replyPressed(); break;

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

-(void)customInit:(const JSONObject&)newObject
{
    mInitObject = newObject;
}

-(void) pushInboxMessage:(const JSONObject&)newObject
{
    InboxMessageVC* nextVC = [[[InboxMessageVC alloc] initWithNibName:@"InboxMessageVC" bundle:nil] autorelease];
    [nextVC customInit:newObject];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void) pushRecordMessage:(const JSONObject &)newObject
{
    RecordMessageVC* nextVC = [[[RecordMessageVC alloc] initWithNibName:@"RecordMessageVC" bundle:nil] autorelease];
    [nextVC customInit:newObject];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

@end
