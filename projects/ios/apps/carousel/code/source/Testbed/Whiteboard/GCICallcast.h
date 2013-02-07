/********* Echo.h Cordova Plugin Header *******/

#import <Cordova/CDV.h>

@interface GCICallcast : CDVPlugin

- (void) webViewLoaded:(CDVInvokedUrlCommand*)command;
- (void) loggedIn:(CDVInvokedUrlCommand*)command;

- (void) save:(CDVInvokedUrlCommand*)command;
- (void) restore:(CDVInvokedUrlCommand*)command;
- (void) beginPath:(CDVInvokedUrlCommand*)command;
- (void) closePath:(CDVInvokedUrlCommand*)command;
- (void) moveTo:(CDVInvokedUrlCommand*)command;
- (void) lineTo:(CDVInvokedUrlCommand*)command;
- (void) stroke:(CDVInvokedUrlCommand*)command;

- (void) loadImageURL:(CDVInvokedUrlCommand*)command;

- (void) addSpot:(CDVInvokedUrlCommand*)command;
- (void) removeSpot:(CDVInvokedUrlCommand*)command;
- (void) setSpot:(CDVInvokedUrlCommand*)command;
- (void) addSpotForParticipant:(CDVInvokedUrlCommand*)command;
- (void) addPluginToParticipant:(CDVInvokedUrlCommand*)command;
- (void) removePluginFromParticipant:(CDVInvokedUrlCommand*)command;
- (void) removeSpotForParticipant:(CDVInvokedUrlCommand*)command;
- (void) addCarouselContent:(CDVInvokedUrlCommand*)command;
- (void) removeCarouselContent:(CDVInvokedUrlCommand*)command;
- (void) connectionStatus:(CDVInvokedUrlCommand*)command;
- (void) onEffectApplied:(CDVInvokedUrlCommand*)command;
- (void) onNicknameInUse:(CDVInvokedUrlCommand*)command;
- (void) readyState:(CDVInvokedUrlCommand*)command;

@end

