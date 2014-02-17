#include "EditContactsVC.h"
#include "ChangeRegisteredNameVC.h"
#include "CreateContactVC.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

#include "Testbed/GoCastTalk/package.h"

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

    [self.mTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];

//    UIBarButtonItem *anotherButton = [[[UIBarButtonItem alloc] initWithTitle:@"Done" style:UIBarButtonItemStylePlain target:self action:@selector(helpButton:)] autorelease];
//    self.navigationItem.rightBarButtonItem = anotherButton;

    self.view.autoresizesSubviews = YES;

    mPeer = new EditContactsScreen(self);
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
        return (NSInteger)InboxScreen::mContacts.size() + 1;
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

        static NSString *simpleTableIdentifier = @"HeadingSubCell";

        HeadingSubCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

        if (cell == nil)
        {
            cell = [[[HeadingSubCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
        }

        std::string heading;

        if (indexPath.row != 0)
        {
            heading = InboxScreen::mContacts[(size_t)indexPath.row - 1].mObject["kanji"].mString;

            if (heading.empty())
            {
                heading = InboxScreen::mContacts[(size_t)indexPath.row - 1].mObject["email"].mString;
            }
        }
        else
        {
            heading = "メンバー作成"; // "Create new contact";
        }

        cell.mHeading.text = [NSString stringWithUTF8String:heading.c_str()];
        cell.mSub.text = [NSString stringWithUTF8String:""];
        cell.mRightArrow.hidden = YES;
        
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
    switch (indexPath.row)
    {
        case 0:     mPeer->createPressed(); break;
        default:    mPeer->itemPressed((size_t)indexPath.row - 1); break;
    }
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (tableView == self.mTable)
    {
        if (indexPath.row != 0)
        {
            return YES;
        }
    }

    return NO;
}

// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (editingStyle == UITableViewCellEditingStyleDelete)
    {
        mPeer->deletePressed((size_t)indexPath.row - 1);
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

-(void) reloadTable
{
    [self.mTable reloadData];
}

-(IBAction)helpButton:(UIBarButtonItem *)sender
{
#pragma unused(sender)
}

-(void) pushCreateContact
{
    CreateContactVC* nextVC = [[[CreateContactVC alloc] initWithNibName:@"CreateContactVC" bundle:nil] autorelease];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void) pushChangeRegisteredName:(const JSONObject&)newObject
{
    ChangeRegisteredNameVC* nextVC = [[[ChangeRegisteredNameVC alloc] initWithNibName:@"ChangeRegisteredNameVC" bundle:nil] autorelease];
    [nextVC customInit:newObject];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

@end
