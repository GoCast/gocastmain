#import <UIKit/UIKit.h>

#include "Base/package.h"

#include <string>

#include "AppDelegate.h"

extern AppDelegate* gAppDelegateInstance;

void tAlert(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.delegate = gAppDelegateInstance;

	alert.title = @""; // "Alert"
	alert.message = [NSString stringWithUTF8String:msg.c_str()];
    [alert addButtonWithTitle:@"オーケー"]; // "Okay"

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];
    
    [alert release];
}

void tConfirm(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.delegate = gAppDelegateInstance;

	alert.title = @""; // "Confirm"
	alert.message = [NSString stringWithUTF8String:msg.c_str()];
    [alert addButtonWithTitle:@"はい"];   // "Yes"
    [alert addButtonWithTitle:@"いいえ"];  // "No"

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];

    [alert release];
}
