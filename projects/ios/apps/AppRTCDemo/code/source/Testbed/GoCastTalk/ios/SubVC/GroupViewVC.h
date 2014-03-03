#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class GroupViewScreen;

@interface GroupViewVC : UIViewController
<
    UITextFieldDelegate,
    UITableViewDelegate,
    UITableViewDataSource
>
{
    GroupViewScreen*    mPeer;
    JSONObject          mInitObject;
}

//mInboxView

@property (nonatomic, strong) IBOutlet UITableView*     mTable;
@property (nonatomic, strong) IBOutlet UILabel*         mTitle;
@property (nonatomic, strong) IBOutlet UILabel*         mCount;
@property (nonatomic, strong) IBOutlet UIButton*        mButton;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void) popSelf;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(void)customInit:(const JSONObject&)newObject;

-(void) pushRecordMessage:(const JSONObject&)newObject;

-(IBAction)sendMessagePressed;

@end
