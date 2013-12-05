#import <UIKit/UIKit.h>

#include "Base/package.h"

#include <string>

#include "../../Testbed/GoCastTalk/ios/AppDelegate.h"

extern AppDelegate* gAppDelegateInstance;

void tAlert(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.delegate = gAppDelegateInstance.viewController;

	alert.title = @"Alert";
	alert.message = [NSString stringWithUTF8String:msg.c_str()];
    [alert addButtonWithTitle:@"Okay"];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];
    
    [alert release];
}

void tConfirm(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.delegate = gAppDelegateInstance.viewController;

	alert.title = @"Confirm";
	alert.message = [NSString stringWithUTF8String:msg.c_str()];
    [alert addButtonWithTitle:@"Yes"];
    [alert addButtonWithTitle:@"No"];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];

    [alert release];
}
