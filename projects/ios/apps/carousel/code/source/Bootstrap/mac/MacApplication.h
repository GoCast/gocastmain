//
//  MacOpenGLView.h
//  SceneGraph
//
//  Created by grant on 8/8/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import<AppKit/NSApplication.h>

@interface MacApplication : NSApplication
{
}

- (void)sendEvent:(NSEvent*)theEvent;

@end

@interface MacApplicationDelegate : NSObject <NSApplicationDelegate>
{
}

//- (void)applicationDidResignActive:(NSNotification *)aNotification;
//- (void)applicationDidBecomeActive:(NSNotification *)aNotification;
- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)theApplication;

- (void)dealloc;
- (void)applicationDidFinishLaunching:(NSNotification *)aNotification;

@end

