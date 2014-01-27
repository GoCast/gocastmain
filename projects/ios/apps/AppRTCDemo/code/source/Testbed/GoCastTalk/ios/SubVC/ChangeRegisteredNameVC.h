#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class ChangeRegisteredNameScreen;

@interface ChangeRegisteredNameVC : UIViewController
<
    UITextFieldDelegate,
    UITableViewDelegate,
    UITableViewDataSource
>
{
    ChangeRegisteredNameScreen* mPeer;
    JSONObject                  mInitObject;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;

@property (nonatomic, strong) IBOutlet UITextField*     mKanji;
@property (nonatomic, strong) IBOutlet UITextField*     mKana;
@property (nonatomic, strong) IBOutlet UILabel*         mEmail;
@property (nonatomic, strong) IBOutlet UIView*          mBlockingView;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)setBlockingViewVisible:(bool)newVisible;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(void)customInit:(const JSONObject&)newObject;

-(IBAction)savePressed;

@end
