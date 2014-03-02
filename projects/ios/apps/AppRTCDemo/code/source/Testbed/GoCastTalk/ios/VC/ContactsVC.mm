#include "ContactsVC.h"
#include "ContactDetailsVC.h"
#include "EditContactsVC.h"
#include "ChangeRegisteredNameVC.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

#include "Testbed/GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface ContactsVC()
{
}
@end

@implementation ContactsVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    [self.mTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];

    self.navigationController.navigationBar.translucent = NO;

    if (!self->mIsChild)
    {
        UIBarButtonItem *anotherButton = [[[UIBarButtonItem alloc] initWithTitle:@"編集" style:UIBarButtonItemStylePlain target:self action:@selector(helpButton:)] autorelease];
        self.navigationItem.rightBarButtonItem = anotherButton;
    }

    self.view.autoresizesSubviews = YES;

    mPeer = new ContactsScreen(self, self->mIsChild, self->mIdentifier);
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
        self->mIdentifier = NULL;
        self->mInGroupsView = false;
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
        if (self->mInGroupsView)
        {
            return (NSInteger)InboxScreen::mGroups.size();
        }

        return (NSInteger)InboxScreen::mContacts.size();
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
        std::string subheading;

        if (!self->mInGroupsView)
        {
            heading = InboxScreen::mContacts[(size_t)indexPath.row].mObject["kanji"].mString;

            if (heading.empty())
            {
                heading = InboxScreen::mContacts[(size_t)indexPath.row].mObject["email"].mString;
            }
        }
        else
        {
            heading = InboxScreen::mGroups[(size_t)indexPath.row].mObject["name"].mString;

            for(size_t i = 0; i < InboxScreen::mGroups[(size_t)indexPath.row].mObject["emails"].mArray.size(); i++)
            {
                subheading += InboxScreen::mGroups[(size_t)indexPath.row].mObject["emails"].mArray[i].mString;
                if (i != InboxScreen::mGroups[(size_t)indexPath.row].mObject["emails"].mArray.size() - 1)
                {
                    subheading += ", ";
                }
            }
        }

        cell.mHeading.text = [NSString stringWithUTF8String:heading.c_str()];
        cell.mSub.text = [NSString stringWithUTF8String:subheading.c_str()];
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
    if (tableView == self.mTable)
    {
        if (self->mInGroupsView)
        {
            mPeer->groupPressed((size_t)indexPath.row);
        }
        else
        {
            mPeer->contactPressed((size_t)indexPath.row);
        }
    }
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (tableView == self.mTable)
    {
        return self->mIsChild ? NO : YES;
    }

    return NO;
}

// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (editingStyle == UITableViewCellEditingStyleDelete)
    {
        if (!self->mInGroupsView)
        {
            mPeer->deleteContactPressed((size_t)indexPath.row);
        }
        else
        {
            mPeer->deleteGroupPressed((size_t)indexPath.row);
        }
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
    if (!self->mInGroupsView)
    {
        mPeer->editContactsPressed();
    }
    else
    {
        mPeer->editGroupsPressed();
    }
}

-(IBAction)contactsGroupsValueChanged:(id)sender
{
#pragma unused(sender)
    self->mInGroupsView = !self->mInGroupsView;
    [self.mTable reloadData];
}

-(void) pushContactDetails:(const JSONObject&)newObject
{
    ContactDetailsVC* nextVC = [[[ContactDetailsVC alloc] initWithNibName:@"ContactDetailsVC" bundle:nil] autorelease];
    [nextVC customInit:newObject];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void) pushEditContacts
{
    EditContactsVC* nextVC = [[[EditContactsVC alloc] initWithNibName:@"EditContactsVC" bundle:nil] autorelease];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void) pushChangeRegisteredName:(const JSONObject&)newObject
{
    ChangeRegisteredNameVC* nextVC = [[[ChangeRegisteredNameVC alloc] initWithNibName:@"ChangeRegisteredNameVC" bundle:nil] autorelease];
    [nextVC customInit:newObject];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void) customInit:(bool)newIsChild withIdentifier:(void *)newIdentifier
{
    mIsChild = newIsChild;
    mIdentifier = newIdentifier;
}

-(void) popSelf
{
    [(UINavigationController*)self.parentViewController popViewControllerAnimated:TRUE];
}

@end

