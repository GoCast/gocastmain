#include "InboxVC.h"
#include "RecordMessageVC.h"
#include "ContactsVC.h"
#include "SettingsVC.h"
#include "InboxMessageVC.h"
#include "LoginVC.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

#include "GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

@interface InboxVC()
{
}
@end

@implementation InboxVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    [self.mTable registerNib:[UINib nibWithNibName:@"InboxEntryCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"InboxEntryCell"];

    UIRefreshControl *refreshControl = [[UIRefreshControl alloc] init];
    [refreshControl addTarget:self action:@selector(refresh:) forControlEvents:UIControlEventValueChanged];
    [self.mTable addSubview:refreshControl];

    self.view.autoresizesSubviews = YES;

    mPeer = new InboxScreen(self);
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
        return (NSInteger)mPeer->getInboxSize();
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

        cell.mFrom.font = [UIFont fontWithName:(mPeer->getIsRead((size_t)indexPath.row) ? @"Verdana" : @"Verdana-Bold") size:18.0f];
        cell.mContentView.backgroundColor = mPeer->getIsRead((size_t)indexPath.row) ?
            [UIColor colorWithRed:0.95f green:0.95f  blue:0.95f alpha:1.0f] :
            [UIColor colorWithRed:1.0f green:1.0f  blue:1.0f alpha:1.0f];


        cell.mFrom.text = [NSString stringWithUTF8String:InboxScreen::nameFromEmail(mPeer->getFrom((size_t)indexPath.row)).c_str()];
        cell.mDate.text = [NSString stringWithUTF8String:mPeer->getDate((size_t)indexPath.row).c_str()];
        [cell setTranscription:mPeer->getTranscription((size_t)indexPath.row)];
        cell.mStatusIcon.image = [UIImage imageNamed:([NSString stringWithUTF8String:I18N::getInstance()->retrieve(mPeer->getIsReceive((size_t)indexPath.row) ? "icon-receive.png" : "icon-sent.png").c_str()])];
        cell.mFrom.textColor =  mPeer->getIsGroup((size_t)indexPath.row) ?
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

+ (Class)layerClass
{
    return [CAGradientLayer class];
}

-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    mPeer->selectItem((size_t)indexPath.row);
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
        mPeer->deletePressed((size_t)indexPath.row);
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

    size_t size = mPeer->getInboxSize();
    size_t count= 0;
    for(size_t i = 0; i < size; i++)
    {
        count += mPeer->getIsRead(i) ? 0 : 1;
    }

    char buf[80];
    sprintf(buf, "%d", (int32_t)count);

    [((UITabBarItem *)[gAppDelegateInstance.mTabBar.items objectAtIndex:0]) setBadgeValue:(count ? [NSString stringWithUTF8String:buf] : nil)];
    [UIApplication sharedApplication].applicationIconBadgeNumber = (int)count;
}

-(void) pushInboxMessage:(const JSONObject&)newObject
{
    InboxMessageVC* nextVC = [[[InboxMessageVC alloc] initWithNibName:@"InboxMessageVC" bundle:nil] autorelease];
    [nextVC customInit:newObject];
    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void) pushLoginScreen
{
    [gAppDelegateInstance.tabBarController presentViewController:[[[LoginVC alloc] init] autorelease] animated:YES completion:nil];
}

-(void) resetAllTabs
{
    InboxVC*            tab0 = (InboxVC*)[gAppDelegateInstance.mInboxVC.viewControllers objectAtIndex:0];
    RecordMessageVC*    tab1 = (RecordMessageVC*)[gAppDelegateInstance.mNewMemoVC.viewControllers objectAtIndex:0];
    ContactsVC*         tab2 = (ContactsVC*)[gAppDelegateInstance.mContactsVC.viewControllers objectAtIndex:0];

    [tab0.mTable scrollRectToVisible:CGRectMake(0, 0, 1, 1) animated:YES];
    [tab1.mScrollView scrollRectToVisible:CGRectMake(0, 0, 1, 1) animated:YES];
    [tab2.mTable scrollRectToVisible:CGRectMake(0, 0, 1, 1) animated:YES];

    [gAppDelegateInstance.mInboxVC      popToRootViewControllerAnimated:NO];
    [gAppDelegateInstance.mNewMemoVC    popToRootViewControllerAnimated:NO];
    [gAppDelegateInstance.mContactsVC   popToRootViewControllerAnimated:NO];
    [gAppDelegateInstance.mSettingsVC   popToRootViewControllerAnimated:NO];
}

-(void) switchToInboxTab
{
    [gAppDelegateInstance.tabBarController setSelectedIndex:0];
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kInboxTabPressed));
}

- (void)refresh:(UIRefreshControl *)refreshControl
{
    [refreshControl endRefreshing];

    mPeer->refreshPressed();
}

@end

