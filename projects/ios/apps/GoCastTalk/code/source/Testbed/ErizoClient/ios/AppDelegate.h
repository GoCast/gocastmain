#pragma once

#import <UIKit/UIKit.h>

#import "ViewController.h"

#include <string>

@interface AppDelegate : NSObject <UIApplicationDelegate>{}

// invoke string is passed to your app on launch, this is only valid if you
// edit HelloWorld-Info.plist to add a protocol
// a simple tutorial can be found here :
// http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html

@property (nonatomic, strong) IBOutlet UIWindow* window;
@property (nonatomic, strong) IBOutlet MainViewController* viewController;

-(void)showWebLoadingView;
-(void)hideWebLoadingView;

-(std::string) getScreenName;
-(std::string) getRoomID;

-(void)setRoomID:(const std::string&)newRoomID;

-(void)setGoButtonEnabled:(bool)newEnabled;

@end
