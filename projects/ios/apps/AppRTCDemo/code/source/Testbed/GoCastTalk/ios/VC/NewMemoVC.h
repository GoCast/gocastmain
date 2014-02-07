#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class NewMemoScreen;

@interface NewMemoVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource
>
{
    NewMemoScreen* mPeer;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;
@property (nonatomic, strong) IBOutlet UITextView*      mToList;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(IBAction)addContactsPressed;
-(IBAction)addGroupsPressed;
-(IBAction)clearPressed;

-(void) pushRecordMessage:(const JSONObject&)newObject;
-(void) pushContacts:(void*)identifier;

-(void)updateToList:(const std::string&) newToList;

@end
