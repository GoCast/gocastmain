#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>

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
-(void)setPlayRecordingScreenVisible:(bool)newVisible;

@end
