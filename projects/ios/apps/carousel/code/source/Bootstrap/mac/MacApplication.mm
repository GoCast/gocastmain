#import <QuartzCore/CVDisplayLink.h>

#import "MacApplication.h"

@implementation MacApplication

- (void)sendEvent:(NSEvent*)theEvent
{
    //This works around an AppKit bug, where key up events while holding
    //down the command key don't get sent to the key window.
    if([theEvent type] == NSKeyUp && ([theEvent modifierFlags] & NSCommandKeyMask))
    {
        [[self keyWindow] sendEvent:theEvent];
    }
    else
    {
        [super sendEvent:theEvent];
    }
}
@end

@implementation MacApplicationDelegate

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)theApplication
{
#pragma unused(theApplication)

    return YES;
}

- (void)dealloc
{
    [super dealloc];
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
#pragma unused(aNotification)

    // Insert code here to initialize your application
}

@end
