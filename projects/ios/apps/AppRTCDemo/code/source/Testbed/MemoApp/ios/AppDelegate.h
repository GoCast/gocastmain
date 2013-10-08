#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>

#include <vector>
#include <string>


@class ViewController;

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow*         window;
@property (strong, nonatomic) ViewController*   viewController;

-(void)hideAllViews;

-(void)setStartScreenVisible:(bool)newVisible;
-(void)setSigningInScreenVisible:(bool)newVisible;
-(void)setMyInboxScreenVisible:(bool)newVisible;
-(void)setRecordAudioScreenVisible:(bool)newVisible;
-(void)setMyRecordingsScreenVisible:(bool)newVisible;
-(void)setSendToGroupScreenVisible:(bool)newVisible;
-(void)setPlayAudioScreenVisible:(bool)newVisible;

-(void)setStartRecordingButtonEnabled:(bool)newEnabled;
-(void)setStopRecordingButtonEnabled:(bool)newEnabled;
-(void)setRecordingStatusLabel:(const std::string&)newStatus;

-(void)setPlayAudioButtonEnabled:(bool)newEnabled;
-(void)setStopAudioButtonEnabled:(bool)newEnabled;
-(void)setDeleteAudioButtonEnabled:(bool)newEnabled;
-(void)setSendAudioButtonEnabled:(bool)newEnabled;

-(void)startRecorder;
-(void)stopRecorder;

-(void)setMyRecordingsTable:(const std::vector<std::string>&)newEntries;

@end
