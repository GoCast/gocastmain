#include "EditOneGroupVC.h"
#include "RecordMessageVC.h"

#include "Base/package.h"
#include "Io/package.h"
#include "Math/package.h"

#include "Testbed/GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface EditOneGroupVC()
{
}
@end

@implementation EditOneGroupVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    self.navigationController.navigationBar.translucent = NO;

    [self.mTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];

    self.view.autoresizesSubviews = YES;
    self.view.opaque = NO;

    mPeer = new EditOneGroupScreen(self, mInitObject);

    self.mGroupName.text = [NSString stringWithUTF8String:mInitObject["name"].mString.c_str()];
}

- (void)viewDidLayoutSubviews
{
    CGRect q, r;

    q = [self.mTable frame];
    r = [self.mButton frame];

    r.origin.y   = gAppDelegateInstance->mScreenHeight;
    r.origin.y  -= gAppDelegateInstance->mTabBarHeight;
    r.origin.y  -= gAppDelegateInstance->mNavBarHeight;
    r.origin.y  -= gAppDelegateInstance->mStatusBarHeight;
    r.origin.y  -= 40;

    q.size.height = r.origin.y - q.origin.y - 5;

    [self.mTable setFrame:q];
    [self.mButton setFrame:r];
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

        cell.mHeading.text  = [NSString stringWithUTF8String:InboxScreen::mContacts[(size_t)indexPath.row].mObject["email"].mString.c_str()];
        cell.mSub.text      = [NSString stringWithUTF8String:InboxScreen::mContacts[(size_t)indexPath.row].mObject["email"].mString.c_str()];

        [cell.mCheckbox setHidden: mPeer->isChecked((size_t)indexPath.row) ? NO : YES];
        [cell.mNoCheckbox setHidden: mPeer->isChecked((size_t)indexPath.row) ? YES : NO];
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
        mPeer->contactPressed((size_t)indexPath.row);
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

-(void)customInit:(const JSONObject&)newObject
{
    mInitObject = newObject;
}

-(void) pushRecordMessage:(const JSONObject &)newObject
{
    RecordMessageVC* nextVC = [[[RecordMessageVC alloc] initWithNibName:@"RecordMessageVC" bundle:nil] autorelease];
    [nextVC customInit:newObject isForwarded:false];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(IBAction)donePressed
{
    const char* result = [self.mGroupName.text UTF8String];

    mPeer->pressDone(result ? result : "");
}

@end
