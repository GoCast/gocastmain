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

@property (nonatomic, strong) IBOutlet UIView*          mBottomHalf;

@property (nonatomic, strong) IBOutlet UITableView*     mTable;
@property (nonatomic, strong) IBOutlet UITableView*     mToTable;

@property (nonatomic, strong) IBOutlet UILabel*         mStatusLabel;
@property (nonatomic, strong) IBOutlet UIButton*        mPauseButton;
@property (nonatomic, strong) IBOutlet UIButton*        mRecordButton;
@property (nonatomic, strong) IBOutlet UIButton*        mPlayButton;
@property (nonatomic, strong) IBOutlet UIButton*        mStopButton;

@property (nonatomic, strong) IBOutlet UILabel*         mTime;
@property (nonatomic, strong) IBOutlet UITextView*      mTranscription;

@property (nonatomic, strong) IBOutlet UISlider*        mSlider;

@property (nonatomic, strong) IBOutlet UIView*          mBlockingView;

@property (nonatomic, strong) IBOutlet UILabel*         mTranscriptionLabel;

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

-(IBAction)pausePressed;
-(IBAction)recordPressed;
-(IBAction)playPressed;
-(IBAction)stopPressed;

-(IBAction)helpButton:(UIBarButtonItem*)sender;

-(void)customInit:(const JSONObject&)newObject;

-(void)pushContacts;
-(void)popSelf;
-(void)popAllInboxViews;

-(void)startEditingTranscription;

-(void)switchToInboxTab;
-(void)switchToNewMemoTab;
-(void)pushMessageSent;

-(void)refreshExpanded;

-(void) setWaitToRecordUI;
-(void) setWaitToPlayUI;
-(void) setPlayingUI;
-(void) setPausedUI;
-(void) setRecordingUI;

-(void) setWaitForTranscriptUI;

-(void) setTimeLabel:(const std::string&)newLabel;
-(void) setTranscription:(const std::string&)newLabel;
-(std::string) getTranscription;
-(void) setTranscriptionEnabled:(bool)newEnabled;

-(void) setSliderPercentage:(float)newPercentage;

-(void) sendEmailTo:(const JSONArray&)newTo withAttachment:(const tFile&)audioFile usingName:(const std::string&)newName;

-(void) refreshLanguage;

@end
