//
//  AppDelegate.m
//  GoCast BigRedButton
//
//  Created by Robert Wolff on 7/6/12.
//  Copyright (c) 2012 XVD Technology LTD USA. All rights reserved.
//

#import "AppDelegate.h"

#include <string>
#include <sstream>

using namespace std;

#define NONE_LOADED "No Plug-Ins Loaded"
#define NONE_TAG -2

#define RESET_ALL "Reset All Plug-Ins"
#define ALL_TAG -1

#define CHROME "Chrome"
#define FIREFOX "Firefox"

@implementation AppDelegate
@synthesize pluginList = _pluginList;

//@synthesize window = _window;

void kill(int tokill);

void kill(int tokill)
{
    stringstream ss;
    
    if (tokill <= 0)
        return;
    
    ss << "kill -9 " << tokill;
    
    system(ss.str().c_str());
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    // Insert code here to initialize your application
    [self RefreshList:nil];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender
{
    return YES;
}

- (IBAction)ResetSelection:(id)sender {
    // Time to kill a process (or more than one)
    NSInteger i = [_pluginList selectedTag];
    
    switch(i)
    {
        case NONE_TAG:
            break;
        
        case ALL_TAG:
            int tag;
            for (int j=0; j< [_pluginList numberOfItems] ; j++)
            {
                tag = (int)[[_pluginList itemAtIndex:j] tag];
                
                if (tag > 0)
                    kill(tag);
            }
            break;
        
        // Kill the TAG process.
        default:
            kill((int)i);
            break;
    }
    
    [self RefreshList:nil];
}

- (IBAction)RefreshList:(id)sender {
    string data;
    const int max_buffer = 1024;
    char buffer[max_buffer];
    FILE* outstr;
    bool bFoundOne = false;
    
    [_pluginList removeAllItems];

    
    outstr = popen("ps ax | grep GCP | grep -v grep", "r");
    if (outstr)
    {
        while (!feof(outstr))
            if (fgets(buffer, max_buffer, outstr) != NULL) data.append(buffer);
        pclose(outstr);
    }
    else
    {
//        printf("Failed to run command.");
        return;
    }
    
//    printf("Strings are: %s", data.c_str());
    
    stringstream ss;
    ss.str(data);
    
    // Now sift through them for process IDs
    do {
        int procid;
        NSString *browser;
        
        ss.getline(buffer, max_buffer);
        data = buffer;

        // If we've hit the eof marker at this stage, then we're done.
        if (ss.eof())
             break;

        stringstream getprocid;
        getprocid.str(buffer);
        
        getprocid >> procid;
        
        if (data.find(CHROME) != string::npos)
            browser = @CHROME;
        else if (data.find(FIREFOX) != string::npos)
            browser = @FIREFOX;
        else
        {
            browser = [[NSString alloc] initWithCString:data.c_str() encoding:NSASCIIStringEncoding];
        }
        
        // Found an entry. Make sure the default first item in the list is to remove all plug-ins prior to adding this entry.
        if (!bFoundOne)
        {
            [_pluginList addItemWithTitle:@RESET_ALL];
            [[_pluginList itemWithTitle:@RESET_ALL] setTag:ALL_TAG];
            bFoundOne = true;
        }
        
        // Set item up.
        [_pluginList addItemWithTitle:browser];
        [[_pluginList itemWithTitle:browser] setTag:procid];
        
//        printf("Got one: %d\n", procid);
//        ss.ignore(4096, '\n');
        
    } while(!ss.eof());
    
    if (!bFoundOne)
    {
        [_pluginList addItemWithTitle:@NONE_LOADED];
        [[_pluginList itemWithTitle:@NONE_LOADED] setTag:NONE_TAG];
        
    }
}
@end
