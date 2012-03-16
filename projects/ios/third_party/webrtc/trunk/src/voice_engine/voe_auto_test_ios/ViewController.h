//
//  ViewController.h
//  voe_auto_test_ios
//
//  Created by terence on 2/8/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ViewController : UIViewController
{
    UIButton* extendedButton;
}
-(IBAction) quitPressed:(id)sender;
-(IBAction) standardPressed:(id)sender;
-(IBAction) extendedPressed:(id)sender;
-(IBAction) extendedGoPressed:(id)sender;
-(IBAction) stressPressed:(id)sender;
-(IBAction) unitPressed:(id)sender;
-(IBAction) cpuPressed:(id)sender;

@property (retain) IBOutlet UIButton* extendedButton;

@end
