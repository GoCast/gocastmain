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

    self.navigationController.navigationBar.translucent = NO;

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

        heading = InboxScreen::nameFromEmail(InboxScreen::mContacts[(size_t)indexPath.row].mObject["email"].mString);

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
    mPeer->itemPressed((size_t)indexPath.row);
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (tableView == self.mTable)
    {
        return YES;
    }

    return NO;
}

// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    if (editingStyle == UITableViewCellEditingStyleDelete)
    {
        mPeer->deletePressed((size_t)indexPath.row);
    }
}

-(void)setBlockingViewVisible:(bool)newVisible
{
    [self.mBlockingView setHidden:newVisible ? NO : YES];
}

- (void)peoplePickerNavigationControllerDidCancel:(ABPeoplePickerNavigationController *)peoplePicker
{
#pragma unused(peoplePicker)
    [self dismissViewControllerAnimated:YES completion:nil];
}


- (BOOL)peoplePickerNavigationController:(ABPeoplePickerNavigationController *)peoplePicker
      shouldContinueAfterSelectingPerson:(ABRecordRef)person
{
#pragma unused(peoplePicker, person)

    NSString* nsKanjiGiven      = (__bridge NSString*)ABRecordCopyValue(person, kABPersonFirstNameProperty);
    NSString* nsKanjiSurname    = (__bridge NSString*)ABRecordCopyValue(person, kABPersonLastNameProperty);
    NSString* nsKanaGiven       = (__bridge NSString*)ABRecordCopyValue(person, kABPersonFirstNamePhoneticProperty);
    NSString* nsKanaSurname     = (__bridge NSString*)ABRecordCopyValue(person, kABPersonLastNamePhoneticProperty);

    std::string kanjiGiven      = nsKanjiGiven      ? [[nsKanjiGiven autorelease] UTF8String] : "";
    std::string kanjiSurname    = nsKanjiSurname    ? [[nsKanjiSurname autorelease] UTF8String] : "";
    std::string kanaGiven       = nsKanaGiven       ? [[nsKanaGiven autorelease] UTF8String] : "";
    std::string kanaSurname     = nsKanaSurname     ? [[nsKanaSurname autorelease] UTF8String] : "";

    JSONObject newContact;

    ABMultiValueRef emailMultiValue = ABRecordCopyValue(person, kABPersonEmailProperty);
    NSArray *emailAddresses = [(NSArray *)ABMultiValueCopyArrayOfAllValues(emailMultiValue) autorelease];
    NSString* nsEmail;

    switch ([emailAddresses count])
    {
        case 0: newContact["email"] = std::string(""); break;
        case 1:
            nsEmail = [emailAddresses objectAtIndex:0];
            newContact["email"] = (nsEmail ? [nsEmail UTF8String] : std::string(""));
            break;

        default:
            newContact["email"] = JSONArray();

            for(size_t i = 0; i < [emailAddresses count]; i++)
            {
                newContact["email"].mArray.push_back(JSONValue(std::string([[emailAddresses objectAtIndex: i] UTF8String])));
            }
            break;
    }

    CFRelease(emailMultiValue);

    newContact["kanji"]     = kanjiSurname + ((!kanjiSurname.empty() && !kanjiGiven.empty()) ? " " : "") + kanjiGiven;
    newContact["kana"]      = kanaSurname  + ((!kanaSurname.empty()  && !kanaGiven.empty())  ? " " : "") + kanaGiven;

    if ([emailAddresses count] == 0 || ([emailAddresses count] == 1 && newContact["email"].mString.empty()))
    {
        [self dismissViewControllerAnimated:YES completion:^
         {
             UIAlertView* alert = [[UIAlertView alloc] init];

             alert.message = [NSString stringWithUTF8String:"Contact does not have an email address"];
             [alert addButtonWithTitle:@"オーケー"]; // "Okay"

             [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];

             [alert release];
         }
         ];
    }
    else
    {
        [self dismissViewControllerAnimated:YES completion:^
         {
             [self pushChangeRegisteredName:newContact];
         }
         ];
    }

    return NO;
}

- (BOOL)peoplePickerNavigationController:(ABPeoplePickerNavigationController *)peoplePicker
      shouldContinueAfterSelectingPerson:(ABRecordRef)person
                                property:(ABPropertyID)property
                              identifier:(ABMultiValueIdentifier)identifier
{
#pragma unused(peoplePicker, person, property, identifier)
    return NO;
}

-(void) reloadTable
{
    [self.mTable reloadData];
}

-(IBAction)helpButton:(UIBarButtonItem *)sender
{
#pragma unused(sender)
}

-(IBAction)createButton:(id)sender
{
#pragma unused(sender)
    mPeer->createPressed();
}

-(IBAction)importButton:(id)sender
{
#pragma unused(sender)
    ABPeoplePickerNavigationController *picker =
    [[ABPeoplePickerNavigationController alloc] init];
    picker.peoplePickerDelegate = self;

    [self presentViewController:picker animated:YES completion:nil];
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
