#import <UIKit/UIKit.h>

#include "Base/package.h"

#include <string>

#include "AppDelegate.h"

extern AppDelegate* gAppDelegateInstance;

void tAlert(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.delegate = gAppDelegateInstance;

	alert.title = [NSString stringWithUTF8String:std::string("Alert").c_str()];
	alert.message = [NSString stringWithUTF8String:std::string(msg).c_str()];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:std::string("Okay").c_str()]];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];
    
    [alert release];
}

void tConfirm(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.delegate = gAppDelegateInstance;

	alert.title = [NSString stringWithUTF8String:std::string("Confirm").c_str()];
	alert.message = [NSString stringWithUTF8String:std::string(msg).c_str()];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:std::string("Yes").c_str()]];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:std::string("No").c_str()]];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];

    [alert release];
}

void tPrompt(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.alertViewStyle = UIAlertViewStylePlainTextInput;

    alert.delegate = gAppDelegateInstance;
	alert.title = [NSString stringWithUTF8String:std::string("Prompt").c_str()];
	alert.message = [NSString stringWithUTF8String:std::string(msg).c_str()];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:std::string("Okay").c_str()]];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:std::string("Cancel").c_str()]];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];

    [alert release];
}

void tPasswordPrompt(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.alertViewStyle = UIAlertViewStyleSecureTextInput;

    alert.delegate = gAppDelegateInstance;
	alert.title = [NSString stringWithUTF8String:std::string("Prompt").c_str()];
	alert.message = [NSString stringWithUTF8String:std::string(msg).c_str()];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:std::string("Okay").c_str()]];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:std::string("Cancel").c_str()]];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];

    [alert release];
}

