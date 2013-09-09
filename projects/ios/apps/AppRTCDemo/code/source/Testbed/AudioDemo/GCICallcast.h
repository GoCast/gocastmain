/********* Echo.h Cordova Plugin Header *******/

#import <Cordova/CDV.h>

@interface GCICallcast : CDVPlugin

- (void) webViewLoaded:(CDVInvokedUrlCommand*)command;
- (void) setRoomID:(CDVInvokedUrlCommand*)command;
@end

