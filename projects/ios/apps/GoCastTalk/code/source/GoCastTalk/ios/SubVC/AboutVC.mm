#include "AboutVC.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

#include "GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

#define kScreenName "About"

extern std::string kBaseURL;

@interface AboutVC()
{
}
@end

@implementation AboutVC

-(void) refreshLanguage
{
    self.mAboutText.text = [NSString stringWithUTF8String:I18N::getInstance()->retrieve("about text").c_str()];
}

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    GoogleAnalytics::getInstance()->trackScreenEntry(kScreenName);

    [super viewDidLoad];

    [self refreshLanguage];

    //"Build date"
    self.mBuildDate.text = [NSString stringWithUTF8String:"Build date:\n"__DATE__ " @ " __TIME__ " PST"];

    CGRect r = self.mAboutText.frame;

    r.size.height  = gAppDelegateInstance->mScreenHeight;
    r.size.height -= gAppDelegateInstance->mStatusBarHeight;
    r.size.height -= gAppDelegateInstance->mNavBarHeight;
    r.size.height -= gAppDelegateInstance->mTabBarHeight;
    r.size.height -= r.origin.y;
    r.size.height -= 20;

    [self.mAboutText setFrame:r];

    self.view.autoresizesSubviews = NO;
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
}

- (void)dealloc
{
    [super dealloc];
}

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
#pragma unused(tableView, section)

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
//        if (tableView == self.mTable)
//        {
//            GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kTableItemDeleted, (tUInt32)indexPath.row));
//        }
    }
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
#pragma unused(textField)
    [textField endEditing:YES];
    [self.mScrollView setContentOffset:CGPointMake(0, 0) animated:YES];
    return YES;
}

-(void) popSelf
{
    [gAppDelegateInstance.tabBarController dismissViewControllerAnimated:YES completion:nil];
}

@end

