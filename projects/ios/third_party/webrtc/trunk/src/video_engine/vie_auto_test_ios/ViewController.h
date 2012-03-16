//
//  ViewController.h
//  vie_auto_test_ios
//
//  Created by Terence Grant on 3/1/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreMedia/CoreMedia.h>
#import <UIKit/UIKit.h>
#import "OGLView.h"

@interface ViewController : UIViewController
{
	IBOutlet OGLView*   windowA;
	IBOutlet OGLView*   windowB;

	EAGLContext*        glContext;
	CADisplayLink*      displayLink;
}
-(IBAction) vie_autotest_GoPressed:(id)sender;

@end
