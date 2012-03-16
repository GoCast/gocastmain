//
//  ViewController.h
//  voe_cmd_test_ios
//
//  Created by Terence Grant on 2/15/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ViewController : UIViewController
{
    UILabel* localIPLabel;

    UITextField* remoteIPEdit;
    UITextField* remotePortEdit;
    UITextField* localPortEdit;
        
    UIButton* quitCmdButton;
    UIButton* selectCodecButton;
    UIButton* sendListenPlayoutButton;
    UIButton* sendOnlyButton;
    UIButton* listenPlayoutButton;
}

-(IBAction) quitCmdPressed:(id)sender;
-(IBAction) selectCodecPressed:(id)sender;
-(IBAction) sendListenPlayoutPressed:(id)sender;
-(IBAction) sendOnlyPressed:(id)sender;
-(IBAction) listenPlayoutPressed:(id)sender;

-(IBAction)textFieldNext:(id)sender;
-(IBAction)textFieldDoneEditing:(id)sender;

@property (retain) IBOutlet UILabel* localIPLabel;

@property (retain) IBOutlet UITextField* remoteIPEdit;
@property (retain) IBOutlet UITextField* remotePortEdit;
@property (retain) IBOutlet UITextField* localPortEdit;

@property (retain) IBOutlet UIButton* quitCmdButton;
@property (retain) IBOutlet UIButton* selectCodecButton;
@property (retain) IBOutlet UIButton* sendListenPlayoutButton;
@property (retain) IBOutlet UIButton* sendOnlyButton;
@property (retain) IBOutlet UIButton* listenPlayoutButton;

@end
