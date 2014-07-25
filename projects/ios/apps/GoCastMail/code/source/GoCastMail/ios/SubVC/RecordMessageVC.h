#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>
#import <CCCell.h>

#include <map>
class JSONValue;
class JSONArray;
typedef std::map<std::string, JSONValue> JSONObject;

class tFile;

class RecordMessageScreen;

@interface RecordMessageVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource,
    CCCellDelegate,
    MFMailComposeViewControllerDelegate
>
{
    JSONObject mInitObject;
    RecordMessageScreen* mPeer;
    bool    mToExpanded;
    CGSize  mScrollPreExpansion;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UIScrollView*    mScrollView;

@property (nonatomic, strong) IBOutlet UIImageView*     mInbox;
@property (nonatomic, strong) IBOutlet UIImageView*     mNewMessage;
@property (nonatomic, strong) IBOutlet UIImageView*     mBeforeVoice;
@property (nonatomic, strong) IBOutlet UIImageView*     mAfterVoice;
@property (nonatomic, strong) IBOutlet UIImageView*     mRevisedInbox;

@property (nonatomic, strong) IBOutlet UIView*          mBottomHalf;

@property (nonatomic, strong) IBOutlet UIButton*        mRecordButton;
@property (nonatomic, strong) IBOutlet UIButton*        mReadButton;
@property (nonatomic, strong) IBOutlet UIButton*        mComposeButton;

@property (nonatomic, strong) IBOutlet UITextView*      mTranscription;
@property (nonatomic, strong) IBOutlet UITextView*      mMessage;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

#pragma mark CCCellDelegate stuff
-(void)onAddPressed;
-(void)onDelPressed:(const size_t &)i;

-(void)setBlockingViewVisible:(bool)newVisible;

-(IBAction)recordPressed;
-(IBAction)readPressed;
-(IBAction)composePressed;

-(void)customInit:(const JSONObject&)newObject;

-(void)pushContacts;
-(void)popSelf;
-(void)popAllInboxViews;

-(void)startEditingTranscription;

-(void)switchToInboxTab;
-(void)switchToNewMemoTab;

-(void)refreshExpanded;

-(void) setTimeLabel:(const std::string&)newLabel;
-(void) setTranscription:(const std::string&)newLabel;
-(std::string) getTranscription;
-(void) setTranscriptionEnabled:(bool)newEnabled;

-(void) setMessage:(const std::string&)newLabel;
-(std::string) getMessage;

-(void) setSliderPercentage:(float)newPercentage;

-(void) sendEmailTo:(const JSONArray&)newTo withAttachment:(const tFile&)audioFile usingName:(const std::string&)newName;

-(void) setImage:(const size_t)i;

@end
