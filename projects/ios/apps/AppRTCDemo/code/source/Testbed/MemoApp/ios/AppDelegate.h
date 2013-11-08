#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>

#include <vector>
#include <string>


@class ViewController;

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow*         window;
@property (strong, nonatomic) ViewController*   viewController;

-(void)hideAllViews;

-(void)setNavigationBarTitle:(const std::string&)newTitle;

-(void)setBlockingViewVisible:(bool)newVisible;

-(void)setStartScreenVisible:(bool)newVisible;

-(void)setMyInboxScreenVisible:(bool)newVisible;
-(void)setRecordAudioScreenVisible:(bool)newVisible;
-(void)setMyGroupsScreenVisible:(bool)newVisible;
-(void)setSettingsScreenVisible:(bool)newVisible;
-(void)setEditProfileScreenVisible:(bool)newVisible;

-(void)setSendToGroupScreenVisible:(bool)newVisible;
-(void)setPlayAudioScreenVisible:(bool)newVisible;

-(void)setStartRecordingButtonEnabled:(bool)newEnabled;
-(void)setStopRecordingButtonEnabled:(bool)newEnabled;
-(void)setCancelRecordingButtonVisible:(bool)newVisible;
-(void)setSaveRecordingButtonVisible:(bool)newVisible;
-(void)setSendRecordingButtonEnabled:(bool)newEnabled;
-(void)setRecordingStatusLabel:(const std::string&)newStatus;

-(void)setPlayAudioButtonImage:(bool)newPlaying;
-(void)setPlayAudioDurationLabel:(const std::string&)newLabel;
-(void)setPlayAudioFromLabel:(const std::string&)newLabel;

-(void)setVersionCheckScreenVisible:(bool)newVisible;
-(void)setOldVersionScreenVisible:(bool)newVisible;
-(void)setRetryVersionCheckButtonEnabled:(bool)newEnabled;

//mStartScreen
-(std::string) getUsername;
-(std::string) getPassword;

//mSettingsview
-(void)setSettingsLoggedInName:(const std::string&)newName;
-(std::string) getOldPassword;
-(std::string) getNewPassword;

//mEditProfileView
-(std::string) getKanjiName;
-(std::string) getKanaName;
-(void) setKanjiName:(const std::string&)newName;
-(void) setKanaName:(const std::string&)newName;


-(void)startRecorder;
-(void)stopRecorder;

-(void)setUserListTable:(const std::vector<std::string>&)newEntries;
-(void)setMyInboxTable:(const std::vector<std::string>&)newEntries;

-(std::vector<size_t>)getSelectedFromUserListTable;

@end
