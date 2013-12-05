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

-(void)startRecorder;
-(void)stopRecorder;

@end
