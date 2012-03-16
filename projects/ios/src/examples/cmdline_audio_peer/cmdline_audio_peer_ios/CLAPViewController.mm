//
//  ViewController.m
//  cmdline_audio_peer_ios
//
//  Created by Terence Grant on 2/14/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CLAPViewController.h"

#include <iostream>
#include <sstream>
#include "talk/base/thread.h"
#include "WPLPeerConnectionClient.h"
#include "WPLSocketServer.h"
#include "TestDefaults.h"

#include <vector>
#include <string>

using namespace std;

extern int cmd_main (int argc, const char * argv[]);
extern GoCast::ThreadSafeMessageQueue mq;

@implementation CLAPViewController

@synthesize nameLabel, serverLabel, portLabel;
@synthesize nameEdit, serverEdit, portEdit;
@synthesize peerList;
@synthesize renderView;
@synthesize signInSignOutButton, addButton, removeButton, quitButton;

static vector<string> peers;
int peerSelected = -1;
string peerToCallHangup;
CLAPViewController* gInstance = nil;

-(void) openGLInit
{
    
}

-(void) openGLTerminate
{
    
}

-(void) openGLDraw:(void*)buffer withWidth:(int)nw withHeight:(int)nh
{
    
}


-(void) updatePeerList
{
    dispatch_async(dispatch_get_main_queue(), ^(void) {
        [peerList reloadData];
    });
}

-(void) clearPeerList
{
    peers.clear();
    peerSelected = -1;
}

-(void) appendPeerListWithString:(const string&)newPeer
{
    peers.push_back(newPeer);
}

-(void) appendPeerListWithCString:(const char*)newPeer
{
    [self appendPeerListWithString:string(newPeer)];
}

enum
{
    STATE_INVALID   = -1,
    STATE_NOT_CONN  = 0,
    STATE_PEER_LIST = 1,
};

enum
{
    EVENT_START     = 0,
    EVENT_SIGN      = 1,
};

int state = STATE_NOT_CONN;


int getNextState(int prevState, int event);
int getNextState(int prevState, int event)
{
    switch (prevState)
    {
        case STATE_NOT_CONN:
            switch (event)
            {
                case EVENT_START: return STATE_NOT_CONN; break;
                case EVENT_SIGN: return STATE_PEER_LIST; break;
            }
            break;
        case STATE_PEER_LIST:
            switch (event)
            {
                case EVENT_SIGN: return STATE_NOT_CONN; break;
            }
            break;
            break;
    }

    return STATE_INVALID;
}

-(void) runStateUILogic:(int)event
{
    int prevState = state;
    int nextState = getNextState(prevState, event);
    
    switch(nextState)
    {
        case STATE_NOT_CONN:
            self.nameLabel.hidden               = NO;  self.nameEdit.hidden               = NO;
            self.serverLabel.hidden             = NO;  self.serverEdit.hidden             = NO;
            self.portLabel.hidden               = NO;  self.portEdit.hidden               = NO;
            self.renderView.hidden              = YES;
            self.peerList.scrollEnabled = NO; self.peerList.allowsSelection = NO; self.peerList.backgroundColor = [UIColor lightGrayColor];
            self.signInSignOutButton.enabled    = YES;
            self.addButton.enabled              = NO;
            self.removeButton.enabled           = NO;
            [self.signInSignOutButton setTitle:@"Sign in" forState:UIControlStateNormal];
            [self clearPeerList];
            [self updatePeerList];
            break;

        case STATE_PEER_LIST:
            self.nameLabel.hidden               = YES;  self.nameEdit.hidden               = YES;
            self.serverLabel.hidden             = YES;  self.serverEdit.hidden             = YES;
            self.portLabel.hidden               = YES;  self.portEdit.hidden               = YES;
            self.renderView.hidden              = NO;
            self.peerList.scrollEnabled = YES; self.peerList.allowsSelection = YES; self.peerList.backgroundColor = [UIColor whiteColor];
            self.signInSignOutButton.enabled    = YES;
            self.addButton.enabled              = YES;
            self.removeButton.enabled           = YES;
            [self.signInSignOutButton setTitle:@"Sign out" forState:UIControlStateNormal];
            break;
    }
}

-(IBAction)signInSignOutPressed:(id)sender
{
    ParsedMessage cmd;

    [self runStateUILogic:EVENT_SIGN];

    switch(state)
    {
        case STATE_NOT_CONN:
            cmd["command"]      = "signin";
            cmd["server"]       = strdup([[serverEdit text] UTF8String]);
            cmd["peername"]     = strdup([[nameEdit text] UTF8String]);
            cmd["serverport"]   = strdup([[portEdit text] UTF8String]);
            mq.PostMessage(cmd);
            break;
        default:
            cmd["command"] = "signout";
            mq.PostMessage(cmd);
            break;
    }

    state = getNextState(state, EVENT_SIGN);
}

-(IBAction)addPressed:(id)sender
{
    ParsedMessage cmd;
    
    switch(state)
    {
        case STATE_PEER_LIST:
            if (peerSelected != -1)
            {                
                peerToCallHangup = peers[peerSelected]; //Save the peer we're calling
                
                cmd["command"]      = "call";
                cmd["peername"]     = peerToCallHangup.c_str();
                mq.PostMessage(cmd);
            }
            break;
    }
}

-(IBAction)removePressed:(id)sender
{
    ParsedMessage cmd;
    
    switch(state)
    {
        case STATE_PEER_LIST:
            cmd["command"]      = "hangup";
            cmd["peername"]     = peerToCallHangup.c_str();
            mq.PostMessage(cmd);
            break;
    }
}

-(IBAction)quitPressed:(id)sender
{
    exit(0);
}

//-- st:All to do with Peer List
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier] autorelease];
        cell.accessoryType = UITableViewCellAccessoryNone;
    }
    
    // Configure the cell.
    cell.textLabel.text = [NSString stringWithFormat:@"%s", peers[[indexPath row]].c_str()];
//    [cell.backgroundView setNeedsDisplay];

    return cell;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
//    [tableView setNeedsDisplay];
    return peers.size();
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    peerSelected = [indexPath row];
}

//-- en:All to do with Peer List

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

-(void)cmd_mainHelper
{
    const char* argv[] = { "cmdline_audio_peer_ios" };
    cmd_main (0, argv);
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    gInstance = self;

    [self runStateUILogic:EVENT_START];

    [self performSelectorInBackground:@selector(cmd_mainHelper) withObject:self];
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
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

@end
