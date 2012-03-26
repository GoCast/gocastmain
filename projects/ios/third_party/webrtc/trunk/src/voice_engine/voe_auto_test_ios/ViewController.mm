//
//  ViewController.m
//  voe_auto_test_ios
//
//  Created by terence on 2/8/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//
#include <stdlib.h>
#import "ViewController.h"

extern int RunInManualMode(int selection, int optionNumberTwo);

@implementation ViewController

- (void) showAlert:(NSString*)msg
{
    UIAlertView *baseAlert = [[UIAlertView alloc] initWithTitle:@"Alert" message:msg delegate:self cancelButtonTitle:nil otherButtonTitles:@"OK", nil];
    [baseAlert show];
    [baseAlert release];
}

-(IBAction) quitPressed:(id)sender
{
    exit(0);
}

-(IBAction) standardPressed:(id)sender
{
    RunInManualMode(1, 0);
    exit(0);
}

static int curExtended = -1;
-(IBAction) extendedPressed:(id)sender
{
    curExtended++;
    curExtended %= 16;
    char* state = NULL;

    switch (curExtended) {
        case 0: state = "(0)  None"; break;
        case 1: state = "(1)  Base"; break;
        case 2: state = "(2)  CallReport"; break;
        case 3: state = "(3)  Codec"; break;
        case 4: state = "(4)  Dtmf"; break;
        case 5: state = "(5)  Encryption"; break;
        case 6: state = "(6)  VoEExternalMedia"; break;
        case 7: state = "(7)  File"; break;
        case 8: state = "(8)  Mixing"; break;
        case 9: state = "(9)  Hardware"; break;
        case 10: state = "(10) NetEqStats"; break;
        case 11: state = "(11) Network"; break;
        case 12: state = "(12) RTP_RTCP"; break;
        case 13: state = "(13) VideoSync"; break;
        case 14: state = "(14) VolumeControl"; break;
        case 15: state = "(15) AudioProcessing"; break;
    }

    [extendedButton setTitle:[NSString stringWithFormat:@" %s:%s", "Ex", state] forState:UIControlStateNormal];
}

-(IBAction) extendedGoPressed:(id)sender
{
    RunInManualMode(2, (curExtended < 0) ? 0 : curExtended);
    exit(0);
}

-(IBAction) stressPressed:(id)sender
{
    RunInManualMode(3, 0);
    exit(0);
}

-(IBAction) unitPressed:(id)sender
{
    RunInManualMode(4, 0);
    exit(0);
}

-(IBAction) cpuPressed:(id)sender
{
    RunInManualMode(5, 0);
    exit(0);
}

//--

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
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
