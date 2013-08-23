#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#include "Base/package.h"

#include <string>

void tLaunchBrowser(const std::string& msg)
{
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[NSString stringWithUTF8String:msg.c_str()]]];
}

