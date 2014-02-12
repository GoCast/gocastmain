#include "NewMemoVC.h"
#include "RecordMessageVC.h"
#include "ContactsVC.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

#include "Testbed/GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface NewMemoVC()
{
}
@end

@implementation NewMemoVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    [self.mTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];

    self.view.autoresizesSubviews = YES;

    mPeer = new NewMemoScreen(self);
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
        const char* heading[] =
        {
            "Record Message",
        };

        const char* subheading[] =
        {
            "Send a voice message",
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
#pragma unused(tableView, indexPath)
    mPeer->replyPressed();
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

-(IBAction)addContactsPressed
{
    mPeer->addContactsPressed();
}

-(IBAction)addGroupsPressed
{
    mPeer->addGroupsPressed();
}

-(IBAction)clearPressed
{
    mPeer->clearPressed();
}

-(void) pushRecordMessage:(const JSONObject&)newObject
{
    RecordMessageVC* nextVC = [[[RecordMessageVC alloc] initWithNibName:@"RecordMessageVC" bundle:nil] autorelease];
    [nextVC customInit:newObject isForwarded:false];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void) pushContacts:(void*)identifier
{
    ContactsVC* nextVC = [[[ContactsVC alloc] initWithNibName:@"ContactsVC" bundle:nil] autorelease];
    [nextVC customInit:true withIdentifier:identifier];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void)updateToList:(const std::string&) newToList
{
    self.mToList.text = [NSString stringWithUTF8String:newToList.c_str()];
}

@end
