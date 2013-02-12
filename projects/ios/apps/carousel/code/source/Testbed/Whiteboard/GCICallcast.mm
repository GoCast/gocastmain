/********* Echo.m Cordova Plugin Implementation *******/

#import "GCICallcast.h"
#import <Cordova/CDV.h>

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "Io/package.h"
#include "OpenGL/package.h"

#include "CallcastEvent.h"
#include "WhiteboardEvent.h"

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
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kWebViewLoaded));
}

- (void)loggedIn:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kLoggedIn));
}

- (void)save:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    std::string rawColor = [[command.arguments objectAtIndex:1] UTF8String];
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

    // TODO: fix SpotID
    CallcastManager::getInstance()->tSubject<const WhiteboardEvent&>::notify(WhiteboardEvent(WhiteboardEvent::kSave,
                                                         atoi([[command.arguments objectAtIndex:0] UTF8String]),
                                                         useColor, atoi([[command.arguments objectAtIndex:2] UTF8String])));
}

- (void)restore:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const WhiteboardEvent&>::notify(WhiteboardEvent(WhiteboardEvent::kRestore));
}
- (void)beginPath:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const WhiteboardEvent&>::notify(WhiteboardEvent(WhiteboardEvent::kBeginPath));
}
- (void)closePath:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const WhiteboardEvent&>::notify(WhiteboardEvent(WhiteboardEvent::kClosePath));
}
- (void)moveTo:(CDVInvokedUrlCommand*)command
{
    CallcastManager::getInstance()->tSubject<const WhiteboardEvent&>::notify(WhiteboardEvent(WhiteboardEvent::kMoveTo,
                                                            atoi([[command.arguments objectAtIndex:0] UTF8String]),
                                                             tPoint2f(atoi([[command.arguments objectAtIndex:1] UTF8String]),
                                                                      atoi([[command.arguments objectAtIndex:2] UTF8String]))));
}
- (void)lineTo:(CDVInvokedUrlCommand*)command
{
    CallcastManager::getInstance()->tSubject<const WhiteboardEvent&>::notify(WhiteboardEvent(WhiteboardEvent::kLineTo,
                                                         atoi([[command.arguments objectAtIndex:0] UTF8String]),
                                                             tPoint2f(atoi([[command.arguments objectAtIndex:1] UTF8String]),
                                                                      atoi([[command.arguments objectAtIndex:2] UTF8String]))));
}
- (void)stroke:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const WhiteboardEvent&>::notify(WhiteboardEvent(WhiteboardEvent::kStroke,
                                                         atoi([[command.arguments objectAtIndex:0] UTF8String])));
}

#pragma mark -

- (void) loadImageURL:(CDVInvokedUrlCommand*)command
{
    CallcastManager::getInstance()->tSubject<const WhiteboardEvent&>::notify(WhiteboardEvent(WhiteboardEvent::kLoadImageURL,
                                                         atoi([[command.arguments objectAtIndex:0] UTF8String]),
                                                         [[command.arguments objectAtIndex:1] UTF8String]));
}

#pragma mark -

- (void) addSpot:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kAddSpot,
                                                         [[command.arguments objectAtIndex:0] UTF8String],
                                                         atoi([[command.arguments objectAtIndex:1] UTF8String])));
}

- (void) removeSpot:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kRemoveSpot,
                                                         atoi([[command.arguments objectAtIndex:0] UTF8String])));
}

- (void) setSpot:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kSetSpot));
}

- (void) addSpotForParticipant:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kAddSpotForParticipant));
}

- (void) addPluginToParticipant:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kAddPluginToParticipant));
}

- (void) removePluginFromParticipant:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kRemovePluginFromParticipant));
}

- (void) removeSpotForParticipant:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kRemoveSpotForParticipant));
}

- (void) addCarouselContent:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kAddCarouselContent));
}

- (void) removeCarouselContent:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kRemoveCarouselContent));
}

- (void) connectionStatus:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kConnectionStatus));
}

- (void) onEffectApplied:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kOnEffectApplied));
}

- (void) onNicknameInUse:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kOnNicknameInUse));
}

- (void) readyState:(CDVInvokedUrlCommand*)command
{
#pragma unused(command)
    CallcastManager::getInstance()->tSubject<const CallcastEvent&>::notify(CallcastEvent(CallcastEvent::kReadyState));
}

@end
