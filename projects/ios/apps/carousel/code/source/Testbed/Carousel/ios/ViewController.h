
#import <UIKit/UIKit.h>

#import <Cordova/CDVViewController.h>

@interface MainViewController : CDVViewController
{
}
@property (nonatomic, strong) IBOutlet UIView* mWebLoadingView;
@property (nonatomic, strong) IBOutlet UIView* mLoginView;
@property (nonatomic, strong) IBOutlet UIView* mLoggingInView;
@property (nonatomic, strong) IBOutlet UIView* mNicknameInUseView;
@property (nonatomic, strong) IBOutlet UIView* mBlankSpotView;
@property (nonatomic, strong) IBOutlet UIView* mWhiteboardSpotView;

@property (nonatomic, strong) IBOutlet UITextField* mNickname;
@property (nonatomic, strong) IBOutlet UITextField* mRoomname;

@property (nonatomic, strong) IBOutlet UILabel* mWhiteboardSpotLabel;

@property (nonatomic, retain) NSArray *mColors;
@property (nonatomic, assign) NSInteger mSelectedColorIndex;

-(IBAction)loginPressed:(id)sender;
-(IBAction)okayPressed:(id)sender;

-(IBAction)pressed1px:(id)sender;
-(IBAction)pressed3px:(id)sender;
-(IBAction)pressed5px:(id)sender;
-(IBAction)pressed10px:(id)sender;
-(IBAction)pressedColor:(id)sender;

-(IBAction)pressedNew:(id)sender;
-(IBAction)pressedDelete:(id)sender;

- (void)colorWasSelected:(NSNumber *)selectedIndex element:(id)element;
- (void)actionPickerCancelled:(id)sender;

-(IBAction)pressedPrev:(id)sender;
-(IBAction)pressedNext:(id)sender;

@end
