/********* Echo.h Cordova Plugin Header *******/

#import <Cordova/CDV.h>

@interface GCICallcast : CDVPlugin

- (void) webViewLoaded:(CDVInvokedUrlCommand*)command;
- (void) setRoomID:(CDVInvokedUrlCommand*)command;

- (void) pcConstruct:(CDVInvokedUrlCommand*)command;

- (void) pcAddStream:(CDVInvokedUrlCommand*)command;
- (void) pcClose:(CDVInvokedUrlCommand*)command;

- (void) pcCreateAnswer:(CDVInvokedUrlCommand*)command;
- (void) pcCreateOffer:(CDVInvokedUrlCommand*)command;

- (void) pcSetLocalDescription:(CDVInvokedUrlCommand*)command;
- (void) pcSetRemoteDescription:(CDVInvokedUrlCommand*)command;

@end

