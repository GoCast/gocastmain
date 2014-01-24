#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

#include <map>
class JSONValue;
typedef std::map<std::string, JSONValue> JSONObject;

class RecordMessageScreen;

@interface RecordMessageVC : UIViewController
<
    UITableViewDelegate,
    UITableViewDataSource
>
{
    JSONObject mInitObject;
    RecordMessageScreen* mPeer;
}

//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mTable;

@property (nonatomic, strong) IBOutlet UIButton*        mPauseButton;
@property (nonatomic, strong) IBOutlet UIButton*        mRecordButton;
@property (nonatomic, strong) IBOutlet UIButton*        mPlayButton;

#pragma mark Construction / Destruction
- (void)viewDidLoad;
- (void)viewWillDisappear:(BOOL)animated;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(IBAction)pausePressed;
-(IBAction)recordPressed;
-(IBAction)playPressed;

-(void)customInit:(const JSONObject&)newObject;

-(void)popSelf;

-(void) setWaitToRecordUI;
-(void) setWaitToPlayUI;
-(void) setPlayingUI;
-(void) setPausedUI;
-(void) setRecordingUI;

-(void) setWaitForTranscriptUI;

@end
