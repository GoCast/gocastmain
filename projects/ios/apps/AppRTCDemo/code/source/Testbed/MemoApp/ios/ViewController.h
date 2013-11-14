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
@property (nonatomic, strong) IBOutlet UIView* mSettingsView;

@property (nonatomic, strong) IBOutlet UIView* mEditProfileView;

@property (nonatomic, strong) IBOutlet UIView* mMyGroupsView;
@property (nonatomic, strong) IBOutlet UIView* mEditGroupView;

@property (nonatomic, strong) IBOutlet UIView* mSendToGroupView;
@property (nonatomic, strong) IBOutlet UIView* mPlayAudioView;

@property (nonatomic, strong) IBOutlet UIView* mOldVersionView;
@property (nonatomic, strong) IBOutlet UIView* mVersionCheckView;

@property (nonatomic, strong) IBOutlet UIView* mBlockingView;

//mStartView
@property (nonatomic, strong) IBOutlet UITextField* mLoginUsername;
@property (nonatomic, strong) IBOutlet UITextField* mLoginPassword;

//mMyRecordingsView
@property (nonatomic, strong) IBOutlet UITableView* mInboxTable;

//mNavigationBar
@property (nonatomic, strong) IBOutlet UINavigationBar* mNavigationBar;
@property (nonatomic, strong) IBOutlet UINavigationItem* mNavigationItem;

//mTabView
@property (nonatomic, strong) IBOutlet UITabBar* mTabBar;
@property (nonatomic, strong) IBOutlet UITabBarItem* mInboxTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mNewMemoTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mGroupsTab;
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
@property (nonatomic, strong) IBOutlet UIButton* mSendAudioButton;
@property (nonatomic, strong) IBOutlet UILabel* mAudioDurationLabel;
@property (nonatomic, strong) IBOutlet UILabel* mFrom;

//mSettingsView
@property (nonatomic, strong) IBOutlet UILabel* mLoggedInLabel;
@property (nonatomic, strong) IBOutlet UITextField* mOldPassword;
@property (nonatomic, strong) IBOutlet UITextField* mNewPassword;
@property (nonatomic, strong) IBOutlet UIButton* mChangePasswordButton;
@property (nonatomic, strong) IBOutlet UIButton* mLogOutButton;
@property (nonatomic, strong) IBOutlet UIButton* mEditProfileButton;

//mEditProfileView
@property (nonatomic, strong) IBOutlet UITextField* mKanjiName;
@property (nonatomic, strong) IBOutlet UITextField* mKanaName;
@property (nonatomic, strong) IBOutlet UIButton* mSaveProfileButton;

//mMyGroupsView
@property (nonatomic, strong) IBOutlet UITableView* mCurrentGroupsTable;
@property (nonatomic, strong) IBOutlet UIButton* mAddGroupButton;
@property (nonatomic, strong) IBOutlet UIButton* mEditGroupButton;

//mEditGroupView
@property (nonatomic, strong) IBOutlet UITextField* mGroupName;
@property (nonatomic, strong) IBOutlet UITableView* mEditGroupTable;
@property (nonatomic, strong) IBOutlet UIButton*    mSaveGroupButton;

//mSendToGroupView
@property (nonatomic, strong) IBOutlet UITableView* mSendToGroupTable;
@property (nonatomic, strong) IBOutlet UIButton* mSendSendtoGroupButton;
@property (nonatomic, strong) IBOutlet UIButton* mCancelSendToGroupButton;

//mVersionCheckView
@property (nonatomic, strong) IBOutlet UIButton* mRetryVersionCheckButton;

//mOldVersionView

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
-(IBAction) sendAudioPressed:(id)sender;

-(IBAction) changePasswordPressed:(id)sender;
-(IBAction) logOutPressed:(id)sender;
-(IBAction) editProfilePressed:(id)sender;

-(IBAction) saveProfilePressed:(id)sender;

//mMyGroupsView
-(IBAction) addGroupPressed:(id)sender;
-(IBAction) editGroupPressed:(id)sender;

//mEditGroupView
-(IBAction) saveGroupPressed:(id)sender;

//mSendToGroupView
-(IBAction) sendSendToGroupPressed:(id)sender;
-(IBAction) cancelSendToGroupPressed:(id)sender;

//mVersionCheckView
-(IBAction) retryVersionCheckPressed:(id)sender;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item;

-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex;

@end
