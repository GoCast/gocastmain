/********* Echo.h Cordova Plugin Header *******/

#import <Cordova/CDV.h>

@interface GCICallcast : CDVPlugin

- (void)webViewLoaded:(CDVInvokedUrlCommand*)command;
- (void)loggedIn:(CDVInvokedUrlCommand*)command;

- (void)save:(CDVInvokedUrlCommand*)command;
- (void)restore:(CDVInvokedUrlCommand*)command;
- (void)beginPath:(CDVInvokedUrlCommand*)command;
- (void)closePath:(CDVInvokedUrlCommand*)command;
- (void)moveTo:(CDVInvokedUrlCommand*)command;
- (void)lineTo:(CDVInvokedUrlCommand*)command;
- (void)stroke:(CDVInvokedUrlCommand*)command;

@end

