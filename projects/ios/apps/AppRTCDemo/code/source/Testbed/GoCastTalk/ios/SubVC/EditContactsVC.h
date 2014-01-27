#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class EditContactsScreen;

@interface EditContactsVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource
>
{
    EditContactsScreen* mPeer;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;
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

-(void) pushChangeRegisteredName:(const JSONObject&)newObject;

@end
