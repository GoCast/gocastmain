#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>
#import <UIKit/UIKit.h>
#import <AddressBookUI/AddressBookUI.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class EditContactsScreen;

@interface EditContactsVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource,
    ABPeoplePickerNavigationControllerDelegate
>
{
    EditContactsScreen* mPeer;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;
@property (nonatomic, strong) IBOutlet UIButton*        mCreateButton;
@property (nonatomic, strong) IBOutlet UIButton*        mImportButton;
@property (nonatomic, strong) IBOutlet UIView*          mBlockingView;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

- (void)peoplePickerNavigationControllerDidCancel:(ABPeoplePickerNavigationController *)peoplePicker;

- (BOOL)peoplePickerNavigationController:(ABPeoplePickerNavigationController *)peoplePicker
      shouldContinueAfterSelectingPerson:(ABRecordRef)person;

- (BOOL)peoplePickerNavigationController:(ABPeoplePickerNavigationController *)peoplePicker
      shouldContinueAfterSelectingPerson:(ABRecordRef)person
                                property:(ABPropertyID)property
                              identifier:(ABMultiValueIdentifier)identifier;

-(void)setBlockingViewVisible:(bool)newVisible;

-(void) reloadTable;

-(IBAction)helpButton:(UIBarButtonItem*)sender;

-(IBAction)createButton:(id)sender;
-(IBAction)importButton:(id)sender;

-(void) pushCreateContact;
-(void) pushChangeRegisteredName:(const JSONObject&)newObject;

@end
