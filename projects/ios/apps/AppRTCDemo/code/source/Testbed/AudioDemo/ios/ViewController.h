
#import <UIKit/UIKit.h>

#import <Cordova/CDVViewController.h>

@interface MainViewController : CDVViewController <UIGestureRecognizerDelegate>
{
}
@property (nonatomic, strong) IBOutlet UIView* mWebLoadingView;
@property (nonatomic, strong) IBOutlet UIView* mLoginView;
@property (nonatomic, strong) IBOutlet UIView* mLoggingInView;
@property (nonatomic, strong) IBOutlet UIView* mNicknameInUseView;
@property (nonatomic, strong) IBOutlet UIView* mBlankSpotView;
@property (nonatomic, strong) IBOutlet UIView* mWhiteboardSpotView;
@property (nonatomic, strong) IBOutlet UIView* mNetworkErrorView;

@property (nonatomic, strong) IBOutlet UITextField* mNickname;
@property (nonatomic, strong) IBOutlet UITextField* mRoomname;

@property (nonatomic, strong) IBOutlet UILabel* mWhiteboardSpotLabel;
@property (nonatomic, strong) IBOutlet UIImageView* mLeftSpot;
@property (nonatomic, strong) IBOutlet UIImageView* mRightSpot;
@property (nonatomic, strong) IBOutlet UIImageView* mAnimateInSpot;
@property (nonatomic, strong) IBOutlet UIImageView* mAnimateOutSpot;
@property (nonatomic, strong) IBOutlet UIButton* mColorButton;

@property (nonatomic, retain) NSArray *mColors;
@property (nonatomic, assign) NSInteger mSelectedColorIndex;

@property (nonatomic, retain) UISwipeGestureRecognizer* mSwipeLeftGesture;
@property (nonatomic, retain) UISwipeGestureRecognizer* mSwipeRightGesture;

-(IBAction)quitPressed:(id)sender;

@end
