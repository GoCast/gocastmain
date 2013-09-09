/********* Echo.m Cordova Plugin Implementation *******/

#import "GCICallcast.h"
#import <Cordova/CDV.h>

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"

#include "HUDEvent.h"
#include "HUDEventManager.h"

@implementation GCICallcast

- (void)webViewLoaded:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    HUDEventManager::getInstance()->tSubject<const HUDEvent&>::notify(HUDEvent(HUDEvent::kWebViewLoaded));
    NSLog(@"Sending HUDEvent::kWebViewLoaded");
}

- (void) setRoomID:(CDVInvokedUrlCommand*)command
{
    HUDEventManager::getInstance()->tSubject<const HUDEvent&>::notify(HUDEvent(HUDEvent::kSetRoomID,
                                                                               [[command.arguments objectAtIndex:0] UTF8String]));
}

@end
