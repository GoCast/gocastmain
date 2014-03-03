#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class ContactsScreen;

@interface ContactsVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource
>
{
    ContactsScreen* mPeer;
    void*           mIdentifier;
    bool            mIsChild;
    BOOL            mInGroupsView;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*         mTable;
@property (nonatomic, strong) IBOutlet UISegmentedControl*  mContactsGroupsSegment;
@property (nonatomic, strong) IBOutlet UIView*          mBlockingView;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)setBlockingViewVisible:(bool)newVisible;

-(void) reloadTable;

-(IBAction)helpButton:(UIBarButtonItem*)sender;

-(IBAction)contactsGroupsValueChanged:(id)sender;

-(void) pushContactDetails:(const JSONObject&)newObject;
-(void) pushEditContacts;
-(void) pushChangeRegisteredName:(const JSONObject&)newObject;
-(void) pushGroupView:(const JSONObject&)newObject;

-(void) customInit:(bool)newIsChild withIdentifier:(void*)newIdentifier;

-(void) popSelf;

@end

