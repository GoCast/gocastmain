#include "GroupViewVC.h"
#include "RecordMessageVC.h"

#include "Base/package.h"
#include "Io/package.h"
#include "Math/package.h"

#include "Testbed/GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface GroupViewVC()
{
}
@end

@implementation GroupViewVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    char buf[80];

    [super viewDidLoad];

    self.navigationController.navigationBar.translucent = NO;

    [self.mTable registerNib:[UINib nibWithNibName:@"HeadingSubCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"HeadingSubCell"];

    self.view.autoresizesSubviews = YES;
    self.view.opaque = NO;

    mPeer = new GroupViewScreen(self, mInitObject);

    sprintf(buf, "%d people", (int)mInitObject["emails"].mArray.size());

    self.mTitle.text = [NSString stringWithUTF8String:mInitObject["name"].mString.c_str()];
    self.mCount.text = [NSString stringWithUTF8String:buf];
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
        return (NSInteger)mInitObject["emails"].mArray.size();
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

        cell.mHeading.text  = [NSString stringWithUTF8String:InboxScreen::nameFromEmail(mInitObject["emails"].mArray[(size_t)indexPath.row].mString).c_str()];
        cell.mSub.text      = [NSString stringWithUTF8String:mInitObject["emails"].mArray[(size_t)indexPath.row].mString.c_str()];

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
#pragma unused(tableView, indexPath)
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

-(IBAction)sendMessagePressed
{
    mPeer->pressSendMessage();
}

@end
