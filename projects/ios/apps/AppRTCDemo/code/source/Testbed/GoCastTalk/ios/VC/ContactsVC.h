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
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void) reloadTable;

-(IBAction)helpButton:(UIBarButtonItem*)sender;

-(void) pushContactDetails:(const JSONObject&)newObject;
-(void) pushEditContacts;

-(void) customInit:(bool)newIsChild withIdentifier:(void*)newIdentifier;

-(void) popSelf;

@end

