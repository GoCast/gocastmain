#include "EditAllGroupsVC.h"

#include "Base/package.h"
#include "Io/package.h"
#include "Math/package.h"

#include "Testbed/GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface EditAllGroupsVC()
{
}
@end

@implementation EditAllGroupsVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    self.navigationController.navigationBar.translucent = NO;

    [self.mTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];

    self.view.autoresizesSubviews = YES;
    self.view.opaque = NO;

    mPeer = new EditAllGroupsScreen(self);
}

- (void)viewDidLayoutSubviews
{
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
        return (NSInteger)InboxScreen::mGroups.size();
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

        heading = InboxScreen::mGroups[(size_t)indexPath.row].mObject["name"].mString;

        for(size_t i = 0; i < InboxScreen::mGroups[(size_t)indexPath.row].mObject["emails"].mArray.size(); i++)
        {
            subheading += InboxScreen::mGroups[(size_t)indexPath.row].mObject["emails"].mArray[i].mString;
            if (i != InboxScreen::mGroups[(size_t)indexPath.row].mObject["emails"].mArray.size() - 1)
            {
                subheading += ", ";
            }
        }

        cell.mHeading.text = [NSString stringWithUTF8String:heading.c_str()];
        cell.mSub.text = [NSString stringWithUTF8String:subheading.c_str()];
        [cell.mRightArrow setHidden:YES];

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
        mPeer->groupPressed((size_t)indexPath.row);
    }
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    return YES;
}

// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (editingStyle == UITableViewCellEditingStyleDelete)
    {
        mPeer->deleteGroupPressed((size_t)indexPath.row);
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

-(void) popSelf
{
    [(UINavigationController*)self.parentViewController popViewControllerAnimated:TRUE];
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
#pragma unused(textField)
    [textField endEditing:YES];
    return YES;
}

-(IBAction)createPressed
{
    mPeer->pressCreate();
}

@end
