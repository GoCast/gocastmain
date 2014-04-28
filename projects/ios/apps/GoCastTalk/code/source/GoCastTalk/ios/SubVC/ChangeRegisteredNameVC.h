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
    UITableViewDataSource,
    UIPickerViewDelegate,
    UIPickerViewDataSource
>
{
    ChangeRegisteredNameScreen* mPeer;
    JSONObject                  mInitObject;
    size_t                      mPickedIndex;
}

//mInboxView

@property (nonatomic, strong) IBOutlet UIScrollView*    mScrollView;

@property (nonatomic, strong) IBOutlet UITableView*     mTable;

@property (nonatomic, strong) IBOutlet UITextField*     mKanji;
@property (nonatomic, strong) IBOutlet UITextField*     mKana;
@property (nonatomic, strong) IBOutlet UILabel*         mEmail;

@property (nonatomic, strong) IBOutlet UIView*          mAbovePickerView;
@property (nonatomic, strong) IBOutlet UIPickerView*    mPicker;

@property (nonatomic, strong) IBOutlet UIView*          mPickerType;
@property (nonatomic, strong) IBOutlet UIView*          mNonPickerType;

@property (nonatomic, strong) IBOutlet UIView*          mBlockingView;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

// returns the number of 'columns' to display.
- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView;

// returns the # of rows in each component..
- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component;
- (NSString*)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component;

- (void)pickerView:(UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component;

-(void)setPickerViewVisible:(bool)newVisible;

-(void)setBlockingViewVisible:(bool)newVisible;

-(void) popSelf;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(void)customInit:(const JSONObject&)newObject;

-(IBAction)savePressed;

@end
