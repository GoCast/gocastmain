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
@property (nonatomic, strong) IBOutlet UIView* mTabView;

@property (nonatomic, strong) IBOutlet UIView* mMyInboxView;
@property (nonatomic, strong) IBOutlet UIView* mRecordAudioView;
@property (nonatomic, strong) IBOutlet UIView* mMyRecordingsView;
@property (nonatomic, strong) IBOutlet UIView* mSettingsView;

@property (nonatomic, strong) IBOutlet UIView* mSendToGroupView;
@property (nonatomic, strong) IBOutlet UIView* mPlayAudioView;

@property (nonatomic, strong) IBOutlet UIView* mBlockingView;

//mStartView
@property (nonatomic, strong) IBOutlet UITextField* mLoginUsername;
@property (nonatomic, strong) IBOutlet UITextField* mLoginPassword;

//mMyRecordingsView
@property (nonatomic, strong) IBOutlet UITableView* mInboxTable;
@property (nonatomic, strong) IBOutlet UITableView* mMyRecordingsTable;

//mTabView
@property (nonatomic, strong) IBOutlet UITabBar* mTabBar;
@property (nonatomic, strong) IBOutlet UITabBarItem* mInboxTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mNewMemoTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mSettingsTab;

//mRecordAudioView
@property (nonatomic, strong) IBOutlet UIButton* mStartRecordingButton;
@property (nonatomic, strong) IBOutlet UIButton* mStopRecordingButton;
@property (nonatomic, strong) IBOutlet UIButton* mCancelRecordingButton;
@property (nonatomic, strong) IBOutlet UIButton* mSaveRecordingButton;
@property (nonatomic, strong) IBOutlet UIButton* mSendRecordingButton;
@property (nonatomic, strong) IBOutlet UILabel* mRecordingStatusLabel;

//mPlayAudioView
@property (nonatomic, strong) IBOutlet UIButton* mPlayAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mStopAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mDeleteAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mSendAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mCancelAudioButton;

//mSettingsView
@property (nonatomic, strong) IBOutlet UILabel* mLoggedInLabel;
@property (nonatomic, strong) IBOutlet UITextField* mOldPassword;
@property (nonatomic, strong) IBOutlet UITextField* mNewPassword;
@property (nonatomic, strong) IBOutlet UIButton* mChangePasswordButton;
@property (nonatomic, strong) IBOutlet UIButton* mLogOutButton;

//mSendToGroupView
@property (nonatomic, strong) IBOutlet UITableView* mSendToGroupTable;
@property (nonatomic, strong) IBOutlet UIButton* mSendSendtoGroupButton;
@property (nonatomic, strong) IBOutlet UIButton* mCancelSendToGroupButton;

@property (nonatomic, strong) AVAudioRecorder* mRecorder;

-(void)ctorRecorder;
-(void)dtorRecorder;
-(void)startRecorder;
-(void)stopRecorder;

-(IBAction) signInPressed:(id)sender;
-(IBAction) newAccountPressed:(id)sender;

-(IBAction) startRecordingPressed:(id)sender;
-(IBAction) stopRecordingPressed:(id)sender;
-(IBAction) cancelRecordingPressed:(id)sender;
-(IBAction) saveRecordingPressed:(id)sender;
-(IBAction) sendRecordingPressed:(id)sender;

-(IBAction) playAudioPressed:(id)sender;
-(IBAction) stopAudioPressed:(id)sender;
-(IBAction) deleteAudioPressed:(id)sender;
-(IBAction) sendAudioPressed:(id)sender;
-(IBAction) cancelAudioPressed:(id)sender;

-(IBAction) changePasswordPressed:(id)sender;
-(IBAction) logOutPressed:(id)sender;

//mSendToGroupView
-(IBAction) sendSendToGroupPressed:(id)sender;
-(IBAction) cancelSendToGroupPressed:(id)sender;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item;

-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex;

@end
