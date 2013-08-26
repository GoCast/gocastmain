#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>

@interface ViewController : UIViewController <MFMailComposeViewControllerDelegate, UITextFieldDelegate>
{
}

@property (nonatomic, strong) IBOutlet UIView* mLoginView;
@property (nonatomic, strong) IBOutlet UIView* mGroupMemberView;
@property (nonatomic, strong) IBOutlet UIView* mInCallView;
@property (nonatomic, strong) IBOutlet UIView* mActiveModeView;
@property (nonatomic, strong) IBOutlet UIView* mAddMemberView;
@property (nonatomic, strong) IBOutlet UIView* mMakeNewGroupView;
@property (nonatomic, strong) IBOutlet UIView* mEditGroupView;
@property (nonatomic, strong) IBOutlet UIView* mLiveRecordView;
@property (nonatomic, strong) IBOutlet UIView* mPlaybackEmailView;

@property (nonatomic, strong) IBOutlet UITextField* mLoginEmail;
@property (nonatomic, strong) IBOutlet UITextField* mLoginPassword;

-(IBAction) signInPressed:(id)sender;
-(IBAction) registerPressed:(id)sender;

-(IBAction) callPressed:(id)sender;
-(IBAction) activeModePressed:(id)sender;
-(IBAction) settingsPressed:(id)sender;
-(IBAction) addMemberPressed:(id)sender;
-(IBAction) editGroupPressed:(id)sender;

-(IBAction) liveRecordPressed:(id)sender;
-(IBAction) livePressed:(id)sender;
-(IBAction) recordPressed:(id)sender;

-(IBAction) activePressed:(id)sender;
-(IBAction) silentPressed:(id)sender;
-(IBAction) declinePressed:(id)sender;
-(IBAction) savePressed:(id)sender;
-(IBAction) cancelPressed:(id)sender;

-(IBAction) mutePressed:(id)sender;
-(IBAction) hangupPressed:(id)sender;
-(IBAction) speakerPressed:(id)sender;

- (void)mailComposeController:(MFMailComposeViewController *)controller didFinishWithResult:(MFMailComposeResult)result error:(NSError *)error;

- (BOOL)textFieldShouldReturn:(UITextField *)textField;

@end
