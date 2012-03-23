//
//  ViewController.h
//  cmdline_audio_peer_ios
//
//  Created by Terence Grant on 2/14/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreMedia/CoreMedia.h>
#import <UIKit/UIKit.h>
#import "OGLView.h"
#include <string>

void openGLGenFakeTexture();

@interface CLAPViewController : UIViewController <UITableViewDelegate, UITableViewDataSource>
{
@public
	EAGLContext* glContext;
    OGLView*     renderViewLocal;
    OGLView*     renderViewRemote;
	CADisplayLink*      displayLink;
//--
    UILabel* nameLabel;
    UILabel* serverLabel;
    UILabel* portLabel;

    UITextField* nameEdit;
    UITextField* serverEdit;
    UITextField* portEdit;

    UITableView* peerList;
    
    UIButton* signInSignOutButton;
    UIButton* addButton;
    UIButton* removeButton;
    UIButton* quitButton;
}

-(void) updatePeerList;
-(void) clearPeerList;
-(void) appendPeerListWithString:(const std::string&)newPeer;
-(void) appendPeerListWithCString:(const char*)newPeer;

-(void) openGLInit;
-(void) openGLTerminate;
-(void) openGLRefresh;
//-(void) openGLDraw:(void*)buffer withWidth:(int)nw withHeight:(int)nh;

-(IBAction)signInSignOutPressed:(id)sender;
-(IBAction)addPressed:(id)sender;
-(IBAction)removePressed:(id)sender;
-(IBAction)quitPressed:(id)sender;

-(IBAction)textFieldNext:(id)sender;
-(IBAction)textFieldDoneEditing:(id)sender;

@property (retain) IBOutlet UILabel* nameLabel;
@property (retain) IBOutlet UILabel* serverLabel;
@property (retain) IBOutlet UILabel* portLabel;

@property (retain) IBOutlet UITextField* nameEdit;
@property (retain) IBOutlet UITextField* serverEdit;
@property (retain) IBOutlet UITextField* portEdit;

@property (retain) IBOutlet UITableView* peerList;

@property (retain) IBOutlet OGLView* renderViewLocal;
@property (retain) IBOutlet OGLView* renderViewRemote;

@property (retain) IBOutlet UIButton* signInSignOutButton;
@property (retain) IBOutlet UIButton* addButton;
@property (retain) IBOutlet UIButton* removeButton;
@property (retain) IBOutlet UIButton* quitButton;

@end
