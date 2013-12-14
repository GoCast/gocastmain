#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>

@interface ViewController : UIViewController
<UITextFieldDelegate, UITableViewDelegate,
UITableViewDataSource, UITabBarDelegate,
UIAlertViewDelegate, AVAudioRecorderDelegate>
{
}

@property (nonatomic, strong) IBOutlet UIView* mTabView;
@property (nonatomic, strong) IBOutlet UIView* mBlockingView;

//mNavigationBar
@property (nonatomic, strong) IBOutlet UINavigationBar* mNavigationBar;
@property (nonatomic, strong) IBOutlet UINavigationItem* mNavigationItem;

//mTabView
@property (nonatomic, strong) IBOutlet UITabBar* mTabBar;
@property (nonatomic, strong) IBOutlet UITabBarItem* mInboxTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mNewMemoTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mContactsTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mGroupsTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mSettingsTab;

@property (nonatomic, strong) IBOutlet UIView* mInboxView;
@property (nonatomic, strong) IBOutlet UIView* mNewMemoView;
@property (nonatomic, strong) IBOutlet UIView* mContactsView;
@property (nonatomic, strong) IBOutlet UIView* mGroupsView;
@property (nonatomic, strong) IBOutlet UIView* mSettingsView;


//mInboxView
@property (nonatomic, strong) IBOutlet UITableView*     mInboxTable;
@property (nonatomic, strong) IBOutlet UIScrollView*    mInboxMessageView;
@property (nonatomic, strong) IBOutlet UITableView*     mInboxMessageOptionsTable;
@property (nonatomic, strong) IBOutlet UIView*          mRecordMessageView;
@property (nonatomic, strong) IBOutlet UITableView*     mRecordMessageOptionsTable;
@property (nonatomic, strong) IBOutlet UIScrollView*    mMessageHistoryView;
@property (nonatomic, strong) IBOutlet UITableView*     mHistoryTable;
@property (nonatomic, strong) IBOutlet UITableView*     mMessageHistoryOptionsTable;
@property (nonatomic, strong) IBOutlet UITableView*     mContactsTable;

//mContactsView
@property (nonatomic, strong) IBOutlet UIView*          mContactDetailsView;
@property (nonatomic, strong) IBOutlet UITableView*     mContactDetailsOptionsTable;

//mSettingsView
@property (nonatomic, strong) IBOutlet UITableView*     mSettingsTable;
@property (nonatomic, strong) IBOutlet UIView*          mChangeRegisteredNameView;

@property (nonatomic, strong) AVAudioRecorder* mRecorder;

-(void)ctorRecorder;
-(void)dtorRecorder;
-(void)startRecorder;
-(void)stopRecorder;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

-(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item;

-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex;

@end
