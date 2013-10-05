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
@property (nonatomic, strong) IBOutlet UIView* mPlayRecordingView;

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


-(IBAction) signInPressed:(id)sender;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item;

@end
