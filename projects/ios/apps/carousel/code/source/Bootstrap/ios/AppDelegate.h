#import <UIKit/UIKit.h>
#import "OpenGLView.h"

@interface AppDelegate : NSObject <UIApplicationDelegate> {
    OpenGLView* _glView;
}

@property (nonatomic, retain) IBOutlet UIWindow *window;
@property (nonatomic, retain) IBOutlet OpenGLView *glView;

@end
