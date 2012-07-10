//
//  AppDelegate.h
//  GoCast BigRedButton
//
//  Created by Robert Wolff on 7/6/12.
//  Copyright (c) 2012 XVD Technology LTD USA. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface AppDelegate : NSObject <NSApplicationDelegate> {
    NSPopUpButton *_pluginList;
}


//@property (assign) IBOutlet NSWindow *window;
- (IBAction)ResetSelection:(id)sender;
- (IBAction)RefreshList:(id)sender;
@property (strong) IBOutlet NSPopUpButton *pluginList;

@end
