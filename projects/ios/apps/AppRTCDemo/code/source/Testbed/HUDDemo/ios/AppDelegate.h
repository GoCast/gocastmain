#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>

@class ViewController;

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow*         window;
@property (strong, nonatomic) ViewController*   viewController;

-(void)setLoginScreenVisible:(bool)newVisible;
-(void)setGroupMemberScreenVisible:(bool)newVisible;
-(void)setInCallScreenVisible:(bool)newVisible;
-(void)setActiveModeScreenVisible:(bool)newVisible;
-(void)setAddMemberScreenVisible:(bool)newVisible;
-(void)setMakeNewGroupScreenVisible:(bool)newVisible;
-(void)setEditGroupScreenVisible:(bool)newVisible;
-(void)setLiveRecordScreenVisible:(bool)newVisible;
-(void)setPlaybackEmailScreenVisible:(bool)newVisible;

@end
