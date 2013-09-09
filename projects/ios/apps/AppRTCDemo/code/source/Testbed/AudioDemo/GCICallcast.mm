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

- (void) pcConstruct:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    HUDEventManager::getInstance()->tSubject<const HUDEvent&>::notify(HUDEvent(HUDEvent::kPCConstruct,
                                                                               [[command.arguments objectAtIndex:0] UTF8String]));
}

- (void) pcAddStream:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    HUDEventManager::getInstance()->tSubject<const HUDEvent&>::notify(HUDEvent(HUDEvent::kPCAddStream));
}

- (void) pcClose:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    HUDEventManager::getInstance()->tSubject<const HUDEvent&>::notify(HUDEvent(HUDEvent::kPCClose));
}

- (void) pcCreateAnswer:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    HUDEventManager::getInstance()->tSubject<const HUDEvent&>::notify(HUDEvent(HUDEvent::kPCCreateAnswer));
}

- (void) pcCreateOffer:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    HUDEventManager::getInstance()->tSubject<const HUDEvent&>::notify(HUDEvent(HUDEvent::kPCCreateOffer));
}

- (void) pcSetLocalDescription:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    HUDEventManager::getInstance()->tSubject<const HUDEvent&>::notify(HUDEvent(HUDEvent::kPCSetLocalDescription));
}

- (void) pcSetRemoteDescription:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    HUDEventManager::getInstance()->tSubject<const HUDEvent&>::notify(HUDEvent(HUDEvent::kPCSetRemoteDescription));
}

@end

