#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class CreateContactScreen;

@interface CreateContactVC : UIViewController
<
    UITextFieldDelegate,
    UITableViewDelegate,
    UITableViewDataSource
>
{
    CreateContactScreen* mPeer;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UIScrollView*    mScrollView;
@property (nonatomic, strong) IBOutlet UITableView*     mTable;

@property (nonatomic, strong) IBOutlet UITextField*     mKanji;
@property (nonatomic, strong) IBOutlet UITextField*     mKana;
@property (nonatomic, strong) IBOutlet UITextField*     mEmail;
@property (nonatomic, strong) IBOutlet UIView*          mBlockingView;

@property (nonatomic, strong) IBOutlet UILabel*         mTitleLabel;
@property (nonatomic, strong) IBOutlet UILabel*         mFullNameLabel;
@property (nonatomic, strong) IBOutlet UILabel*         mNickNameLabel;
@property (nonatomic, strong) IBOutlet UILabel*         mEmailAddressLabel;
@property (nonatomic, strong) IBOutlet UIButton*        mDoneButton;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)setBlockingViewVisible:(bool)newVisible;

-(void) popSelf;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(IBAction)savePressed;

@end
