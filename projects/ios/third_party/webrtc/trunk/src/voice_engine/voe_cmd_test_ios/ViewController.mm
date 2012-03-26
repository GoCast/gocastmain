//
//  ViewController.m
//  voe_cmd_test_ios
//
//  Created by Terence Grant on 2/15/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//
#include <ifaddrs.h>
#include <arpa/inet.h>

#import "ViewController.h"

@implementation ViewController

extern int runVOECMDIOSTest(char* remoteIP, int remotePort, int localPort, int codecChoice, int sendListenPlayoutOption);

-(IBAction) quitCmdPressed:(id)sender
{
    exit(0);
}

static int curCodec = -1;

-(IBAction) selectCodecPressed:(id)sender
{
    curCodec++;
    curCodec %= 14;
    char* state = NULL;
    
    switch (curCodec) {
        case 0: state = "0. ISAC pltype:103 plfreq:16000"; break;
        case 1: state = "1. ISAC-swb pltype:104 plfreqi:32000"; break;
        case 2: state = "2. L16 pltype:105 plfreq:8000"; break;
        case 3: state = "3. L16 pltype:107 plfreq:16000"; break;
        case 4: state = "4. L16 pltype:108 plfreq:32000"; break;
        case 5: state = "5. PCMU pltype:0 plfreq:8000"; break;
        case 6: state = "6. PCMA pltype:8 plfreq:8000"; break;
        case 7: state = "7. ILBC pltype:102 plfreq:8000"; break;
        case 8: state = "8. G722 pltype:9 plfreq:16000"; break;
        case 9: state = "9. CN pltype:13 plfreq:8000"; break;
        case 10: state = "10. CN pltype:98 plfreq:16000"; break;
        case 11: state = "11. CN pltype:99 plfreq:32000"; break;
        case 12: state = "12. telephone-event pltype:106 plfreq:8000"; break;
        case 13: state = "13. red pltype:127 plfreq:8000"; break;
    }
    
    [selectCodecButton setTitle:[NSString stringWithFormat:@" %s", state] forState:UIControlStateNormal];
}

-(void) sendListenPlayoutPressedHelper
{
    runVOECMDIOSTest(strdup([[remoteIPEdit text] UTF8String]), atoi([[remotePortEdit text] UTF8String]), atoi([[localPortEdit text] UTF8String]), (curCodec < 0) ? 0 : curCodec, 1);
}

-(void) sendOnlyPressedHelper
{
    runVOECMDIOSTest(strdup([[remoteIPEdit text] UTF8String]), atoi([[remotePortEdit text] UTF8String]), atoi([[localPortEdit text] UTF8String]), (curCodec < 0) ? 0 : curCodec, 2);
}

-(void) listenPlayoutPressedHelper
{
    runVOECMDIOSTest(strdup([[remoteIPEdit text] UTF8String]), atoi([[remotePortEdit text] UTF8String]), atoi([[localPortEdit text] UTF8String]), (curCodec < 0) ? 0 : curCodec, 3);
}

-(void) disableInput
{
    [remoteIPEdit setEnabled:NO];               remoteIPEdit.backgroundColor = [UIColor lightGrayColor];
    [remotePortEdit setEnabled:NO];             remotePortEdit.backgroundColor = [UIColor lightGrayColor];
    [localPortEdit setEnabled:NO];              localPortEdit.backgroundColor = [UIColor lightGrayColor];
    [selectCodecButton setEnabled:NO];
    [sendListenPlayoutButton setEnabled:NO];
    [sendOnlyButton setEnabled:NO];
    [listenPlayoutButton setEnabled:NO];
}

-(IBAction) sendListenPlayoutPressed:(id)sender
{
    [self disableInput];
    [self performSelectorInBackground:@selector(sendListenPlayoutPressedHelper) withObject:self];
}

-(IBAction) sendOnlyPressed:(id)sender
{
    [self disableInput];
    [self performSelectorInBackground:@selector(sendOnlyPressedHelper) withObject:self];
}

-(IBAction) listenPlayoutPressed:(id)sender
{
    [self disableInput];
    [self performSelectorInBackground:@selector(listenPlayoutPressedHelper) withObject:self];
}

//Advance the text field using the "Next" button on the keyboard
-(IBAction)textFieldNext:(id)sender
{
    UITextField* textField = ((UITextField*)sender);
    int nextTag = textField.tag + 1;
    UIResponder* nextResponder = [textField.superview viewWithTag:nextTag];
    [nextResponder becomeFirstResponder];
}

//Called when the "Done" button on the keyboard is called
-(IBAction)textFieldDoneEditing:(id)sender
{
    [sender resignFirstResponder];
}

//--

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (NSString *)getIPAddress
{
    NSString *address = @"error";
    struct ifaddrs *interfaces = NULL;
    struct ifaddrs *temp_addr = NULL;
    int success = 0;
    
    // retrieve the current interfaces - returns 0 on success
    success = getifaddrs(&interfaces);
    if (success == 0)
    {
        // Loop through linked list of interfaces
        temp_addr = interfaces;
        while(temp_addr != NULL)
        {
            if(temp_addr->ifa_addr->sa_family == AF_INET)
            {
                // Check if interface is en0 which is the wifi connection on the iPhone
                if([[NSString stringWithUTF8String:temp_addr->ifa_name] isEqualToString:@"en0"])
                {
                    // Get NSString from C String
                    address = [NSString stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_addr)->sin_addr)];
                }
            }
            
            temp_addr = temp_addr->ifa_next;
        }
    }
    
    // Free memory
    freeifaddrs(interfaces);
    
    return address;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    localIPLabel.text = [self getIPAddress];
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated
{
	[super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated
{
	[super viewDidDisappear:animated];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation != UIInterfaceOrientationPortraitUpsideDown);
}

@end
