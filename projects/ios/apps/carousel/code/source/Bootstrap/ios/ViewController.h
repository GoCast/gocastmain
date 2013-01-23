
#import <UIKit/UIKit.h>

#import <Cordova/CDVViewController.h>

@interface MainViewController : CDVViewController
{
}
@property (nonatomic, strong) IBOutlet UIView* mLoginView;
@property (nonatomic, strong) IBOutlet UITextField* mNickname;
@property (nonatomic, strong) IBOutlet UITextField* mRoomname;

-(IBAction)loginPressed:(id)sender;

@end
