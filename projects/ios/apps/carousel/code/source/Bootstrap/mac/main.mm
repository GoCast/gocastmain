//
//  main.m
//  SceneGraph
//
//  Created by grant on 8/8/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Cocoa/Cocoa.h>

#import "MacApplication.h"

int main(int argc, char *argv[])
{
    MacApplicationDelegate* appDelegate = [[MacApplicationDelegate alloc] init];

    [[MacApplication sharedApplication] setDelegate:appDelegate];

    int result = NSApplicationMain(argc, (const char **)argv);

    [[MacApplication sharedApplication] setDelegate:nil];
    [appDelegate release];

    return result;
}
