#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>

#include <vector>
#include <string>


@class GoCastTalkVC;

@interface AppDelegate : UIResponder
<
UIApplicationDelegate,
UITabBarControllerDelegate
>

@property (nonatomic, retain) IBOutlet UIWindow *window;
@property (nonatomic, retain) IBOutlet UITabBarController *tabBarController;
@property (strong, nonatomic) GoCastTalkVC*   viewController;

@property (nonatomic, strong) IBOutlet UINavigationController* mInboxVC;
@property (nonatomic, strong) IBOutlet UINavigationController* mNewMemoVC;
@property (nonatomic, strong) IBOutlet UINavigationController* mContactsVC;
@property (nonatomic, strong) IBOutlet UINavigationController* mGroupsVC;
@property (nonatomic, strong) IBOutlet UINavigationController* mSettingsVC;

@property (nonatomic, strong) IBOutlet UITabBar* mTabBar;
@property (nonatomic, strong) IBOutlet UITabBarItem* mInboxTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mNewMemoTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mContactsTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mGroupsTab;
@property (nonatomic, strong) IBOutlet UITabBarItem* mSettingsTab;

-(void)hideAllViews;

-(void)setInboxViewVisible:(bool)newVisible;
-(void)setNewMemoViewVisible:(bool)newVisible;
-(void)setContactsViewVisible:(bool)newVisible;
-(void)setGroupsViewVisible:(bool)newVisible;
-(void)setSettingsViewVisible:(bool)newVisible;

//mInboxView
-(void)setInboxMessageViewVisible:(bool)newVisible;
-(void)setRecordMessageViewVisible:(bool)newVisible;
-(void)setMessageHistoryViewVisible:(bool)newVisible;

//mContactsView
-(void)setContactDetailsViewVisible:(bool)newVisible;
-(void)setEditContactsViewVisible:(bool)newVisible;

//mSettingsView
-(void)setChangeRegisteredNameViewVisible:(bool)newVisible;

-(void)setNavigationBarTitle:(const std::string&)newTitle;
-(void)setNavigationButtonTitle:(const std::string&)newTitle;
-(void)setNavigationButtonVisible:(bool)newVisible;

-(void)setBlockingViewVisible:(bool)newVisible;

-(void)startRecorder;
-(void)stopRecorder;

//--

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UIViewController *)viewController;


-(void)pushChangeRegisterdName;
-(void)pushContactDetails;
-(void)pushEditContacts;
-(void)pushInboxMessage;
-(void)pushMessageHistory;
-(void)pushRecordMessage;

-(void)pop:(bool)animated;

@end
