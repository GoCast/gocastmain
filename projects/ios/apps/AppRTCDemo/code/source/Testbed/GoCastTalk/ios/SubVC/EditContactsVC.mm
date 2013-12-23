#include "EditContactsVC.h"

#include "Base/package.h"
#include "Math/package.h"

#include "GCTEvent.h"
#include "GCTEventManager.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface EditContactsVC()
{
}
@end

@implementation EditContactsVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    [self.mTable registerNib:[UINib nibWithNibName:@"InboxEntryCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"InboxEntryCell"];

    self.view.autoresizesSubviews = YES;
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
        return (NSInteger)3;
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
//        if (tableView == self.mTable)
//        {
//            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTableItemDeleted, (tUInt32)indexPath.row));
//        }
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
