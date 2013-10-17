#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>

#include <vector>
#include <string>


@class ViewController;

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow*         window;
@property (strong, nonatomic) ViewController*   viewController;

-(void)hideAllViews;

-(void)setBlockingViewVisible:(bool)newVisible;

-(void)setStartScreenVisible:(bool)newVisible;

-(void)setMyInboxScreenVisible:(bool)newVisible;
-(void)setRecordAudioScreenVisible:(bool)newVisible;
-(void)setSettingsScreenVisible:(bool)newVisible;

-(void)setSendToGroupScreenVisible:(bool)newVisible;
-(void)setPlayAudioScreenVisible:(bool)newVisible;

-(void)setStartRecordingButtonEnabled:(bool)newEnabled;
-(void)setStopRecordingButtonEnabled:(bool)newEnabled;
-(void)setCancelRecordingButtonVisible:(bool)newVisible;
-(void)setSaveRecordingButtonVisible:(bool)newVisible;
-(void)setSendRecordingButtonEnabled:(bool)newEnabled;
-(void)setRecordingStatusLabel:(const std::string&)newStatus;

-(void)setPlayAudioButtonEnabled:(bool)newEnabled;
-(void)setStopAudioButtonEnabled:(bool)newEnabled;
-(void)setDeleteAudioButtonEnabled:(bool)newEnabled;
-(void)setSendAudioButtonEnabled:(bool)newEnabled;

//mStartScreen
-(std::string) getUsername;
-(std::string) getPassword;

//mSettingsview
-(void)setSettingsLoggedInName:(const std::string&)newName;
-(std::string) getOldPassword;
-(std::string) getNewPassword;

-(void)startRecorder;
-(void)stopRecorder;

-(void)setMyRecordingsTable:(const std::vector<std::string>&)newEntries;
-(void)setUserListTable:(const std::vector<std::string>&)newEntries;
-(void)setMyInboxTable:(const std::vector<std::string>&)newEntries;

-(std::vector<std::string>)getSelectedFromUserListTable;

@end
