//
//  MacWindow.m
//  SceneGraph
//
//  Created by grant on 8/8/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <QuartzCore/CVDisplayLink.h>

#import "MacWindow.h"

@implementation MacWindow

- (void)awakeFromNib
{
    [self setDelegate:self];
}

//--KeyboardEvent hooks
- (void)sendEvent:(NSEvent*)theEvent
{
    switch ([theEvent type])
    {
        case NSKeyUp:           [self keyUp:theEvent]; break;
        case NSKeyDown:         [self keyDown:theEvent]; break;
        case NSFlagsChanged:    [self flagsChanged:theEvent]; break;
        default:                [super sendEvent:theEvent]; break;
    }
}

#pragma mark --KeyboardEvent hooks
-(void)keyDown:(NSEvent *)theEvent
{
    if (![theEvent isARepeat])
    {
        NSString* characters = [theEvent charactersIgnoringModifiers];
        if ([characters length])
        {
//            unichar firstChar = (unichar)tolower([characters characterAtIndex:0]);
//            tInputManager::getInstance()->tSubject<const tKeyboardEvent&>::notify(tKeyboardEvent(tKeyboardEvent::keyDown, (tUInt8)firstChar));
        }
    }
}

-(void)keyUp:(NSEvent *)theEvent
{
    NSString* characters = [theEvent charactersIgnoringModifiers];
    if ([characters length])
    {
//        unichar firstChar = (unichar)tolower([characters characterAtIndex:0]);
//        tInputManager::getInstance()->tSubject<const tKeyboardEvent&>::notify(tKeyboardEvent(tKeyboardEvent::keyUp, (tUInt8)firstChar));
    }
}

////TODO: fix keyup/keydown logic for modifiers
//-(void)flagsChanged:(NSEvent *)theEvent
//{
//    unsigned flags = [theEvent modifierFlags] & NSDeviceIndependentModifierFlagsMask;
//}

@end
