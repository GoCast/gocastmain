//
//  MacOpenGLView.h
//  SceneGraph
//
//  Created by grant on 8/8/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface MacWindow : NSWindow <NSWindowDelegate>
{
}
- (void)awakeFromNib;

//--KeyboardEvent hooks
- (void)sendEvent:(NSEvent*)theEvent;
- (void)keyDown:(NSEvent *)theEvent;            //keyDown
- (void)keyUp:(NSEvent *)theEvent;              //keyUp
//- (void)flagsChanged:(NSEvent *)theEvent;

@end
