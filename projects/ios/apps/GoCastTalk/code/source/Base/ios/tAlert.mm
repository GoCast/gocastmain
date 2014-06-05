#import <UIKit/UIKit.h>

#include "Base/package.h"

#include <string>

#include "AppDelegate.h"

#include "I18N.h"

extern AppDelegate* gAppDelegateInstance;

void tAlert(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.delegate = gAppDelegateInstance;

	alert.title = [NSString stringWithUTF8String:I18N::getInstance()->retrieve("Alert").c_str()];
	alert.message = [NSString stringWithUTF8String:I18N::getInstance()->retrieve(msg).c_str()];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:I18N::getInstance()->retrieve("Okay").c_str()]];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];
    
    [alert release];
}

void tConfirm(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.delegate = gAppDelegateInstance;

	alert.title = [NSString stringWithUTF8String:I18N::getInstance()->retrieve("Confirm").c_str()];
	alert.message = [NSString stringWithUTF8String:I18N::getInstance()->retrieve(msg).c_str()];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:I18N::getInstance()->retrieve("Yes").c_str()]];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:I18N::getInstance()->retrieve("No").c_str()]];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];

    [alert release];
}

void tPrompt(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.alertViewStyle = UIAlertViewStylePlainTextInput;

    alert.delegate = gAppDelegateInstance;
	alert.title = [NSString stringWithUTF8String:I18N::getInstance()->retrieve("Prompt").c_str()];
	alert.message = [NSString stringWithUTF8String:I18N::getInstance()->retrieve(msg).c_str()];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:I18N::getInstance()->retrieve("Okay").c_str()]];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:I18N::getInstance()->retrieve("Cancel").c_str()]];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];

    [alert release];
}

void tPasswordPrompt(const std::string& msg)
{
	UIAlertView* alert = [[UIAlertView alloc] init];

    alert.alertViewStyle = UIAlertViewStyleSecureTextInput;

    alert.delegate = gAppDelegateInstance;
	alert.title = [NSString stringWithUTF8String:I18N::getInstance()->retrieve("Prompt").c_str()];
	alert.message = [NSString stringWithUTF8String:I18N::getInstance()->retrieve(msg).c_str()];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:I18N::getInstance()->retrieve("Okay").c_str()]];
    [alert addButtonWithTitle:[NSString stringWithUTF8String:I18N::getInstance()->retrieve("Cancel").c_str()]];

    [alert performSelectorOnMainThread:@selector(show) withObject:nil waitUntilDone:YES];

    [alert release];
}

