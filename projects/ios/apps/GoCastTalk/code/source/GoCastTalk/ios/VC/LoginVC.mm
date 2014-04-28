#include "LoginVC.h"
#include "InboxMessageVC.h"

#import <MessageUI/MessageUI.h>

#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

#include "GoCastTalk/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"

extern std::string kBaseURL;

@interface LoginVC()
{
}
@end

@implementation LoginVC

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
#if (ADHOC || DEBUG)
    [self.mBaseURL setHidden:NO];
#else
    [self.mBaseURL setHidden:YES];
#endif

    [super viewDidLoad];

    self.view.autoresizesSubviews = YES;

    mPeer = new LoginScreen(self);
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

-(void)setBlockingViewVisible:(bool)newVisible
{
    [self.mBlockingView setHidden:newVisible ? NO : YES];
}

-(void)textFieldDidBeginEditing:(UITextField *)textField
{
    if ((textField == self.mEmail) ||
        (textField == self.mPassword))
    {
        [self.mScrollView setContentOffset:CGPointMake(0, self.mEmail.frame.origin.y - 64) animated:YES];
    }
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
#pragma unused(textField)
    [textField endEditing:YES];
    [self.mScrollView setContentOffset:CGPointMake(0, 0) animated:YES];
    return YES;
}

-(IBAction) signInPressed
{
    const char* email = [self.mEmail.text UTF8String];
    const char* password = [self.mPassword.text UTF8String];
    const char* baseURL = [self.mBaseURL.text UTF8String];

    LoginScreen::mBaseURL = baseURL ? baseURL : kBaseURL;

    mPeer->signInPressed(email ? email : "", password ? password : "");
}

-(IBAction) signUpPressed
{
    const char* email = [self.mEmail.text UTF8String];
    const char* password = [self.mPassword.text UTF8String];

    mPeer->signUpPressed(email ? email : "", password ? password : "");
}

-(IBAction) troublePressed
{
    const char* email = [self.mEmail.text UTF8String];

    mPeer->troublePressed(email ? email : "");
}

-(void) sendEmailTo:(const std::string&)newTo
{
    if ([MFMailComposeViewController canSendMail])
    {
        std::string body;// = "Please reset my password. My email is ";
        body += (self.mEmail.text) ? [self.mEmail.text UTF8String] : "";
        body += " のパスワード再設定をお願いします。";
        MFMailComposeViewController *mailer = [[MFMailComposeViewController alloc] init];
        mailer.mailComposeDelegate = self;
        [mailer setSubject:[NSString stringWithUTF8String:"パスワード再設定依頼"]]; // "Password reset request"
        NSArray *toRecipients = [NSArray arrayWithObjects:[NSString stringWithUTF8String:newTo.c_str()], nil];
        [mailer setToRecipients:toRecipients];
        NSString *emailBody = [NSString stringWithUTF8String:body.c_str()];
        [mailer setMessageBody:emailBody isHTML:NO];
        [self presentViewController:mailer animated:YES completion:nil];
        [mailer release];
    }
}

- (void)mailComposeController:(MFMailComposeViewController *)controller
          didFinishWithResult:(MFMailComposeResult)result
                        error:(NSError *)error
{
#pragma unused(controller, result, error)
    [self dismissViewControllerAnimated:YES completion:NULL];
}

-(void) setLoginName:(const std::string&)newName
{
    self.mEmail.text = [NSString stringWithUTF8String:newName.c_str()];
    self.mBaseURL.text = [NSString stringWithUTF8String:LoginScreen::mBaseURL.c_str()];
}

-(void) popSelf
{
    [gAppDelegateInstance.tabBarController dismissViewControllerAnimated:NO completion:nil];
}

@end

