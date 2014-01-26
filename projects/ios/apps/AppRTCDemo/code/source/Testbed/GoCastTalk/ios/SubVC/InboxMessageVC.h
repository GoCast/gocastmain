#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class InboxMessageScreen;

@interface InboxMessageVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource
>
{
    JSONObject mInitObject;
    InboxMessageScreen* mPeer;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UIImageView*     mReceive;
@property (nonatomic, strong) IBOutlet UILabel*         mFrom;
@property (nonatomic, strong) IBOutlet UILabel*         mDate;
@property (nonatomic, strong) IBOutlet UITextView*      mTranscription;
@property (nonatomic, strong) IBOutlet UIButton*        mPlayButton;
@property (nonatomic, strong) IBOutlet UISlider*        mSlider;
@property (nonatomic, strong) IBOutlet UILabel*         mTime;

@property (nonatomic, strong) IBOutlet UITableView*     mTable;
@property (nonatomic, strong) IBOutlet UIView*          mBlockingView;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)setBlockingViewVisible:(bool)newVisible;

-(void)customInit:(const JSONObject&)newObject;

-(IBAction)playPressed;

-(void)setButtonImagePlay;
-(void)setButtonImagePause;

-(void)setTimeLabel:(const std::string&)newLabel;

-(void) popSelf;

-(void) pushRecordMessage:(const JSONObject&)newObject;
-(void) pushMessageHistory:(const JSONObject &)newObject;

@end
