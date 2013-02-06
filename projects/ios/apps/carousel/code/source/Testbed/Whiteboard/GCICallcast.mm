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

const tColor4b      kBlack  (0,0,0,255);
const tColor4b      kRed    (255,0,0,255);
const tColor4b      kBlue   (0,0,255,255);
const tColor4b      kOrange (255,165,0,255);
const tColor4b      kWhite  (255,255,255,255);

@implementation GCICallcast

- (void)webViewLoaded:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kWebViewLoaded\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kWebViewLoaded));
}

- (void)loggedIn:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kLoggedIn\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kLoggedIn));
}

- (void)save:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kSave\n");
    std::string rawColor = [[command.arguments objectAtIndex:0] UTF8String];
    tColor4b useColor = kBlue;

    if (rawColor == "#000")
    {
        useColor = kBlack;
    }
    else if (rawColor == "#F00")
    {
        useColor = kRed;
    }
    else if (rawColor == "#00F")
    {
        useColor = kBlue;
    }
    else if (rawColor == "rgb(253, 103, 3)")
    {
        useColor = kOrange;
    }
    else if (rawColor == "#FFF")
    {
        useColor = kWhite;
    }
    else
    {
        printf("*** Unknown color: %s\n", rawColor.c_str());
    }

    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kSave, useColor, atoi([[command.arguments objectAtIndex:1] UTF8String])));
}

- (void)restore:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kRestore\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kRestore));
}
- (void)beginPath:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kBeginPath\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kBeginPath));
}
- (void)closePath:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kClosePath\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kClosePath));
}
- (void)moveTo:(CDVInvokedUrlCommand*)command
{
    printf("%s", "*** kMoveTo\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kMoveTo,
                                                             tPoint2f(atoi([[command.arguments objectAtIndex:0] UTF8String]), atoi([[command.arguments objectAtIndex:1] UTF8String]))));
}
- (void)lineTo:(CDVInvokedUrlCommand*)command
{
    printf("%s", "*** kLineTo\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kLineTo,
                                                             tPoint2f(atoi([[command.arguments objectAtIndex:0] UTF8String]), atoi([[command.arguments objectAtIndex:1] UTF8String]))));
}
- (void)stroke:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kStroke\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kStroke));
}

#pragma mark -

- (void) addSpot:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kAddSpot\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kAddSpot,
                                                         [[command.arguments objectAtIndex:0] UTF8String],
                                                         atoi([[command.arguments objectAtIndex:1] UTF8String])));
}

- (void) removeSpot:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kRemoveSpot\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kRemoveSpot,
                                                         atoi([[command.arguments objectAtIndex:0] UTF8String])));
}

- (void) setSpot:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kSetSpot\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kSetSpot));
}

- (void) addSpotForParticipant:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kAddSpotForParticipant\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kAddSpotForParticipant));
}

- (void) addPluginToParticipant:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kAddPluginToParticipant\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kAddPluginToParticipant));
}

- (void) removePluginFromParticipant:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kRemovePluginFromParticipant\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kRemovePluginFromParticipant));
}

- (void) removeSpotForParticipant:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kRemoveSpotForParticipant\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kRemoveSpotForParticipant));
}

- (void) addCarouselContent:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kAddCarouselContent\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kAddCarouselContent));
}

- (void) removeCarouselContent:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kRemoveCarouselContent\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kRemoveCarouselContent));
}

- (void) connectionStatus:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kConnectionStatus\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kConnectionStatus));
}

- (void) onEffectApplied:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kOnEffectApplied\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kOnEffectApplied));
}

- (void) onNicknameInUse:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kOnNicknameInUse\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kOnNicknameInUse));
}

- (void) readyState:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    printf("%s", "*** kReadyState\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kReadyState));
}

@end
