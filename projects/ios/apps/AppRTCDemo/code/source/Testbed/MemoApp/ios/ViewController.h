#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

@interface ViewController : UIViewController
<UITextFieldDelegate, UITableViewDelegate,
UITableViewDataSource, UITabBarDelegate,
UIAlertViewDelegate, AVAudioRecorderDelegate>
{
}

@property (nonatomic, strong) IBOutlet UIView* mStartView;
@property (nonatomic, strong) IBOutlet UIView* mSigningInView;
@property (nonatomic, strong) IBOutlet UIView* mTabView;
@property (nonatomic, strong) IBOutlet UIView* mMyInboxView;
@property (nonatomic, strong) IBOutlet UIView* mRecordAudioView;
@property (nonatomic, strong) IBOutlet UIView* mMyRecordingsView;
@property (nonatomic, strong) IBOutlet UIView* mSendToGroupView;
@property (nonatomic, strong) IBOutlet UIView* mPlayAudioView;

@property (nonatomic, strong) IBOutlet UITextField* mLoginUsername;
@property (nonatomic, strong) IBOutlet UITextField* mLoginPassword;

@property (nonatomic, strong) IBOutlet UITableView* mGroupTable;
@property (nonatomic, strong) IBOutlet UITableView* mMyRecordingsTable;

@property (nonatomic, strong) IBOutlet UITabBar* mTabBar;

@property (nonatomic, strong) IBOutlet UITabBarItem* mInboxTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mMemosTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mNewMemoTab;

@property (nonatomic, strong) IBOutlet UIButton* mStartRecordingButton;
@property (nonatomic, strong) IBOutlet UIButton* mStopRecordingButton;
@property (nonatomic, strong) IBOutlet UIButton* mCancelRecordingButton;
@property (nonatomic, strong) IBOutlet UILabel* mRecordingStatusLabel;

@property (nonatomic, strong) IBOutlet UIButton* mPlayAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mStopAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mDeleteAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mSendAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mCancelAudioButton;

@property (nonatomic, strong) AVAudioRecorder* mRecorder;

-(void)ctorRecorder;
-(void)dtorRecorder;
-(void)startRecorder;
-(void)stopRecorder;

-(IBAction) signInPressed:(id)sender;

-(IBAction) startRecordingPressed:(id)sender;
-(IBAction) stopRecordingPressed:(id)sender;
-(IBAction) cancelRecordingPressed:(id)sender;

-(IBAction) playAudioPressed:(id)sender;
-(IBAction) stopAudioPressed:(id)sender;
-(IBAction) deleteAudioPressed:(id)sender;
-(IBAction) sendAudioPressed:(id)sender;
-(IBAction) cancelAudioPressed:(id)sender;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item;

-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex;

@end
