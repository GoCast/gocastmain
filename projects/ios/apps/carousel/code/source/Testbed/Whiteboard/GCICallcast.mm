/********* Echo.m Cordova Plugin Implementation *******/

#import "GCICallcast.h"
#import <Cordova/CDV.h>

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "Io/package.h"
#include "OpenGL/package.h"
#include "Whiteboard.h"

#include "CallcastEvent.h"
#include "CallcastManager.h"


@implementation GCICallcast

- (void)save:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kSave));
}
- (void)restore:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kRestore));
}
- (void)beginPath:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kBeginPath));
}
- (void)closePath:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kClosePath));
}
- (void)moveTo:(CDVInvokedUrlCommand*)command
{
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kMoveTo,
                                                             tPoint2f(atoi([[command.arguments objectAtIndex:0] UTF8String]), atoi([[command.arguments objectAtIndex:1] UTF8String]))));
}
- (void)lineTo:(CDVInvokedUrlCommand*)command
{
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kLineTo,
                                                             tPoint2f(atoi([[command.arguments objectAtIndex:0] UTF8String]), atoi([[command.arguments objectAtIndex:1] UTF8String]))));
}
- (void)stroke:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kStroke));
}

@end
