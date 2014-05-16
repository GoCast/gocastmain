#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import <AVFoundation/AVFoundation.h>
#import <SpeechKit/SpeechKit.h>

#include <vector>
#include <string>

@interface AppDelegate : UIResponder
<
    UIApplicationDelegate,
    UITabBarControllerDelegate,
    UIAlertViewDelegate,
    AVAudioRecorderDelegate,
    SpeechKitDelegate,
    SKRecognizerDelegate
>
{
@public
    SKRecognizer*   voiceSearch;
    size_t          mTabBarHeight;
    size_t          mScreenHeight;
    size_t          mNavBarHeight;
    size_t          mStatusBarHeight;
}

@property (nonatomic, retain) IBOutlet UIWindow *window;
@property (nonatomic, retain) IBOutlet UITabBarController *tabBarController;

@property (nonatomic, strong) IBOutlet UINavigationController* mInboxVC;
@property (nonatomic, strong) IBOutlet UINavigationController* mNewMemoVC;
@property (nonatomic, strong) IBOutlet UINavigationController* mContactsVC;
@property (nonatomic, strong) IBOutlet UINavigationController* mSettingsVC;

@property (nonatomic, strong) IBOutlet UINavigationBar* mInboxNavBar;
@property (nonatomic, strong) IBOutlet UINavigationBar* mNewMemoNavBar;
@property (nonatomic, strong) IBOutlet UINavigationBar* mContactsNavBar;
@property (nonatomic, strong) IBOutlet UINavigationBar* mSettingsNavBar;

@property (nonatomic, strong) IBOutlet UITabBar* mTabBar;

@property (nonatomic, strong) IBOutlet UITabBarItem* mInboxItem;
@property (nonatomic, strong) IBOutlet UITabBarItem* mNewMemoItem;
@property (nonatomic, strong) IBOutlet UITabBarItem* mContactsItem;
@property (nonatomic, strong) IBOutlet UITabBarItem* mSettingsItem;

@property (nonatomic, strong) AVAudioRecorder* mServerRecorder;
@property (nonatomic, strong) AVAudioRecorder* mEmailRecorder;

-(void)ctorRecorder;
-(void)dtorRecorder;
-(void)startRecorder;
-(void)stopRecorder;

-(void)stopNuanceRecorder;

//--

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UIViewController *)viewController;

-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex;

-(void)audioRecorderDidFinishRecording:(AVAudioRecorder *)recorder successfully:(BOOL)flag;

-(void)pushMessageSent;

@end

