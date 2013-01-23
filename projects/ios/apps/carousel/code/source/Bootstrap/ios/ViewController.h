
#import <UIKit/UIKit.h>

#import <Cordova/CDVViewController.h>

@interface MainViewController : CDVViewController
{
}
@property (nonatomic, strong) IBOutlet UIView* mLoginView;
@property (nonatomic, strong) IBOutlet UIView* mWBView;
@property (nonatomic, strong) IBOutlet UITextField* mNickname;
@property (nonatomic, strong) IBOutlet UITextField* mRoomname;

-(IBAction)loginPressed:(id)sender;

-(IBAction)pressed1px:(id)sender;
-(IBAction)pressed3px:(id)sender;
-(IBAction)pressed5px:(id)sender;
-(IBAction)pressed10px:(id)sender;
-(IBAction)pressedColor:(id)sender;
-(IBAction)pressedErase:(id)sender;

@end
