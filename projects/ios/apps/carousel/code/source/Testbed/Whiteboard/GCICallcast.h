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

- (void) addSpot:(CDVInvokedUrlCommand*)command;    //added
- (void) removeSpot:(CDVInvokedUrlCommand*)command; //added
- (void) setSpot:(CDVInvokedUrlCommand*)command;    //added
- (void) addSpotForParticipant:(CDVInvokedUrlCommand*)command;      //added
- (void) addPluginForParticipant:(CDVInvokedUrlCommand*)command;
- (void) removePluginToParticipant:(CDVInvokedUrlCommand*)command;
- (void) removeSpotToParticipant:(CDVInvokedUrlCommand*)command;    //added
- (void) addCarouselContent:(CDVInvokedUrlCommand*)command;
- (void) removeCarouselContent:(CDVInvokedUrlCommand*)command;
- (void) connectionStatus:(CDVInvokedUrlCommand*)command;
- (void) onEffectApplied:(CDVInvokedUrlCommand*)command;
- (void) onNicknameInUse:(CDVInvokedUrlCommand*)command;
- (void) readyState:(CDVInvokedUrlCommand*)command;

@end

