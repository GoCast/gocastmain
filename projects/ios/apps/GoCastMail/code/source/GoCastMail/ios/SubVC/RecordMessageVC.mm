#include "RecordMessageVC.h"

#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "GoCastMail/package.h"

#import "InboxEntryCell.h"
#import "HeadingSubCell.h"
#import "CCCell.h"

@interface RecordMessageVC()
{
}
@end

@implementation RecordMessageVC

#pragma mark CCCell helper methods

#define kCellSize 40

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    self.view.autoresizesSubviews = YES;

    mPeer = new RecordMessageScreen(self, mInitObject);

    self->mScrollPreExpansion = self.mScrollView.contentSize;

    [self setTranscriptionEnabled:false];

    [self switchToInboxTab];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
}

- (id)init
{
    self = [super init];

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

-(void)textViewDidBeginEditing:(UITextView *)textView
{
#pragma unused(textView)
    [self.mScrollView setContentOffset:CGPointMake(0, self.mTranscription.frame.origin.y - 64) animated:YES];
}

-(BOOL)textView:(UITextView *)textView shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text
{
#pragma unused(range)

    if([text isEqualToString:@"\n"])
    {
        [textView resignFirstResponder];
        return NO;
    }

    return YES;
}

#pragma mark CCCellDelegate stuff
-(void)onAddPressed
{
    [self pushContacts];
}

-(void)onDelPressed:(const size_t &)i
{
#pragma unused(i)
}

-(void)setBlockingViewVisible:(bool)newVisible
{
#pragma unused(newVisible)
}

-(IBAction)recordPressed
{
    mPeer->recordPressed();
}

-(IBAction)readPressed
{
    mPeer->readPressed();
}

-(IBAction)composePressed
{
    mPeer->composePressed();
}

-(IBAction)helpButton:(UIBarButtonItem*)sender
{
#pragma unused(sender)
}

-(void)customInit:(const JSONObject&)newObject
{
    mInitObject     = newObject;
}

-(void) pushContacts
{
//    ContactsVC* nextVC = [[[ContactsVC alloc] initWithNibName:@"ContactsVC" bundle:nil] autorelease];
//    [nextVC customInit:true withIdentifier:mPeer];
//    [(UINavigationController*)self.parentViewController  pushViewController:nextVC animated:YES];
}

-(void)popSelf
{
    [(UINavigationController*)self.parentViewController popViewControllerAnimated:TRUE];
}

-(void)popAllInboxViews
{
//    [gAppDelegateInstance.mInboxVC popToRootViewControllerAnimated:NO];
//    [((InboxVC*)gAppDelegateInstance.mInboxVC.topViewController).mTable scrollRectToVisible:CGRectMake(0, 0, 1, 1) animated:YES];
}

-(void)startEditingTranscription
{
    CGRect r = self.mTranscription.frame;
    [self.mScrollView scrollRectToVisible:r animated:YES];
    [self.mTranscription becomeFirstResponder];
}

-(void)switchToInboxTab
{
    [gAppDelegateInstance.tabBarController setSelectedIndex:0];
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kInboxTabPressed));
}

-(void)switchToNewMemoTab
{
    [gAppDelegateInstance.tabBarController setSelectedIndex:1];
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kNewMemoTabPressed));
}

-(void)refreshExpanded
{
}

-(void) setTimeLabel:(const std::string&)newLabel
{
#pragma unused(newLabel)
}

-(void) setTranscription:(const std::string&)newLabel
{
    self.mTranscription.text = [NSString stringWithUTF8String:newLabel.c_str()];
}

-(std::string) getTranscription
{
    NSString* result = self.mTranscription.text;

    return result ? [result UTF8String] : "";
}

-(void) setTranscriptionEnabled:(bool)newEnabled
{
    [self.mTranscription setEditable:newEnabled];
}

-(void) setSliderPercentage:(float)newPercentage
{
#pragma unused(newPercentage)
}

-(void) sendEmailTo:(const JSONArray&)newTo withAttachment:(const tFile&)audioFile usingName:(const std::string&)newName
{
    if ([MFMailComposeViewController canSendMail])
    {
        std::string body;
        body += std::string("voice email pre");
        body += [self.mTranscription.text UTF8String] ? [self.mTranscription.text UTF8String] : "";
        body += std::string("voice email post");

        MFMailComposeViewController *mailer = [[MFMailComposeViewController alloc] init];
        mailer.mailComposeDelegate = self;
        [mailer setSubject:[NSString stringWithUTF8String:"GoCast Talk Voice Memo"]];
        NSMutableArray *toRecipients = [NSMutableArray array];

        for(size_t i = 0; i < newTo.size(); i++)
        {
            [toRecipients addObject:[NSString stringWithUTF8String:newTo[i].mString.c_str()]];
        }

        [mailer setToRecipients:toRecipients];
        NSString *emailBody = [NSString stringWithUTF8String:body.c_str()];
        [mailer setMessageBody:emailBody isHTML:NO];

        NSData* data = [NSData dataWithContentsOfFile:[NSString stringWithUTF8String:audioFile.GetFullPath().c_str()]];
        [mailer addAttachmentData:data mimeType:@"audio/wav" fileName:[NSString stringWithUTF8String:newName.c_str()]];
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

@end

