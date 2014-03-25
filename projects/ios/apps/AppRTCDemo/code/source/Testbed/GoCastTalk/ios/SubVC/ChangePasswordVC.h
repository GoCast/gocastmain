#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class ChangePasswordScreen;

@interface ChangePasswordVC : UIViewController
<
    UITextFieldDelegate,
    UITableViewDelegate,
    UITableViewDataSource
>
{
    ChangePasswordScreen* 	mPeer;
    size_t              	mPickedIndex;
}

//mInboxView

@property (nonatomic, strong) IBOutlet UIScrollView*    mScrollView;

@property (nonatomic, strong) IBOutlet UITableView*     mTable;

@property (nonatomic, strong) IBOutlet UITextField*     mOldPassword;
@property (nonatomic, strong) IBOutlet UITextField*     mNewPassword;

@property (nonatomic, strong) IBOutlet UIView*          mBlockingView;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(std::string)getOldPassword;
-(std::string)getNewPassword;

-(void)setBlockingViewVisible:(bool)newVisible;

-(void) popSelf;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(IBAction)savePressed;

@end
