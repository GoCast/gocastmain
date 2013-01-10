/********* Echo.m Cordova Plugin Implementation *******/

#import "GCIWhiteboard.h"
#import <Cordova/CDV.h>

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "Io/package.h"
#include "OpenGL/package.h"
#include "Whiteboard.h"

@implementation GCIWhiteboard

- (void)save:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    WhiteboardManager::getInstance()->notify(WhiteboardEvent(WhiteboardEvent::kSave));
}
- (void)restore:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    WhiteboardManager::getInstance()->notify(WhiteboardEvent(WhiteboardEvent::kRestore));
}
- (void)beginPath:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    WhiteboardManager::getInstance()->notify(WhiteboardEvent(WhiteboardEvent::kBeginPath));
}
- (void)closePath:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    WhiteboardManager::getInstance()->notify(WhiteboardEvent(WhiteboardEvent::kClosePath));
}
- (void)moveTo:(CDVInvokedUrlCommand*)command
{
    WhiteboardManager::getInstance()->notify(WhiteboardEvent(WhiteboardEvent::kMoveTo,
                                                             tPoint2f(atoi([[command.arguments objectAtIndex:0] UTF8String]), atoi([[command.arguments objectAtIndex:1] UTF8String]))));
}
- (void)lineTo:(CDVInvokedUrlCommand*)command
{
    WhiteboardManager::getInstance()->notify(WhiteboardEvent(WhiteboardEvent::kLineTo,
                                                             tPoint2f(atoi([[command.arguments objectAtIndex:0] UTF8String]), atoi([[command.arguments objectAtIndex:1] UTF8String]))));
}
- (void)stroke:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    WhiteboardManager::getInstance()->notify(WhiteboardEvent(WhiteboardEvent::kStroke));
}

@end
