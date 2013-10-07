#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>

@interface ViewController : UIViewController <UITextFieldDelegate, UITableViewDelegate, UITableViewDataSource, UITabBarDelegate>
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
@property (nonatomic, strong) IBOutlet UITableView* mMemberTable;
@property (nonatomic, strong) IBOutlet UITableView* mInCallTable;
@property (nonatomic, strong) IBOutlet UITableView* mEditMembersTable;
@property (nonatomic, strong) IBOutlet UITableView* mCallerTable;
@property (nonatomic, strong) IBOutlet UITableView* mRecipientsTable;

@property (nonatomic, strong) IBOutlet UITabBar* mTabBar;

@property (nonatomic, strong) IBOutlet UITabBarItem* mInboxTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mMemosTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mNewMemoTab;

@property (nonatomic, strong) IBOutlet UIButton* mStartRecordingButton;
@property (nonatomic, strong) IBOutlet UIButton* mStopRecordingButton;
@property (nonatomic, strong) IBOutlet UIButton* mCancelRecordingButton;
@property (nonatomic, strong) IBOutlet UILabel* mRecordingStatusLabel;

@property (nonatomic, strong) IBOutlet UIButton* mPlayAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mDeleteAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mSendAudioButton;
@property (nonatomic, strong) IBOutlet UIButton* mCancelAudioButton;



-(IBAction) signInPressed:(id)sender;

-(IBAction) startRecordingPressed:(id)sender;
-(IBAction) stopRecordingPressed:(id)sender;
-(IBAction) cancelRecordingPressed:(id)sender;

-(IBAction) playAudioPressed:(id)sender;
-(IBAction) deleteAudioPressed:(id)sender;
-(IBAction) sendAudioPressed:(id)sender;
-(IBAction) cancelAudioPressed:(id)sender;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item;

@end
