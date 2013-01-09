/********* Echo.m Cordova Plugin Implementation *******/

#import "GCIWhiteboard.h"
#import <Cordova/CDV.h>

@implementation GCIWhiteboard

- (void)save:(CDVInvokedUrlCommand*)command
{
    printf("*** GCIWhiteboard::save\n");
}
- (void)restore:(CDVInvokedUrlCommand*)command
{
    printf("*** GCIWhiteboard::restore\n");
}
- (void)beginPath:(CDVInvokedUrlCommand*)command
{
    printf("*** GCIWhiteboard::beginPath\n");
}
- (void)closePath:(CDVInvokedUrlCommand*)command
{
    printf("*** GCIWhiteboard::closePath\n");
}
- (void)moveTo:(CDVInvokedUrlCommand*)command
{
    printf("*** GCIWhiteboard::moveTo(%d, %d)\n", atoi([[command.arguments objectAtIndex:0] UTF8String]), atoi([[command.arguments objectAtIndex:1] UTF8String]));
}
- (void)lineTo:(CDVInvokedUrlCommand*)command
{
    printf("*** GCIWhiteboard::lineTo(%d, %d)\n", atoi([[command.arguments objectAtIndex:0] UTF8String]), atoi([[command.arguments objectAtIndex:1] UTF8String]));
}
- (void)stroke:(CDVInvokedUrlCommand*)command
{
    printf("*** GCIWhiteboard::stroke\n");
}

@end
