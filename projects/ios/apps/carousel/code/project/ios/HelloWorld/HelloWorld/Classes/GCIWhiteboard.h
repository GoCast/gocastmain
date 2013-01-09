/********* Echo.h Cordova Plugin Header *******/

#import <Cordova/CDV.h>

@interface GCIWhiteboard : CDVPlugin

- (void)save:(CDVInvokedUrlCommand*)command;
- (void)restore:(CDVInvokedUrlCommand*)command;
- (void)beginPath:(CDVInvokedUrlCommand*)command;
- (void)closePath:(CDVInvokedUrlCommand*)command;
- (void)moveTo:(CDVInvokedUrlCommand*)command;
- (void)lineTo:(CDVInvokedUrlCommand*)command;
- (void)stroke:(CDVInvokedUrlCommand*)command;

@end

