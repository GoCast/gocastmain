//
//  ViewController.m
//  vie_auto_test_ios
//
//  Created by Terence Grant on 3/1/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <QuartzCore/QuartzCore.h>
#import <UIKit/UIKit.h>
#import <OpenGLES/EAGLDrawable.h>
#include <OpenGLES/ES1/glext.h>

#import "ViewController.h"

#include <assert.h>

@implementation ViewController

extern int vie_autotest_ios_main(int argc, const char * argv[]);

uint textureIDForVieAutoTest = 0;
bool hadTextureVieAutoTest = false;

void setUpTransforms()
{
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    glOrthof(0.0f, 1.0f, 1.0f, 0.0f, 0.0f, 1.0f);   //Set up projection from [0,0]-[1,1]
    
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

static float vertices[] = {
    0.0f, 0.0f, //top-left
    0.0f, 1.0f, //bot-left
    1.0f, 0.0f, //top-right
    1.0f, 1.0f, //bot-right
};

static float textureCoords[] = {
    0.0f, 0.0f, //top-left
    1.0f, 0.0f, //top-right
    0.0f, 1.0f, //bot-left
    1.0f, 1.0f, //bot-right
};

void drawFrame(uint th)
{
    glVertexPointer(2, GL_FLOAT, 0, &vertices[0]);
    glTexCoordPointer(2, GL_FLOAT, 0, &textureCoords[0]);    //textcoords are coincidentally same as vertex coords
    
    glEnableClientState(GL_VERTEX_ARRAY);
    glEnableClientState(GL_TEXTURE_COORD_ARRAY);
    
    if (th)
    {
        glBindTexture(GL_TEXTURE_2D, th);
        glEnable(GL_TEXTURE_2D);
	}
    
    glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
}

- (void)doFrame
{
    [EAGLContext setCurrentContext:glContext];
    //--
    [windowA bind];
    
    glClearColor(0.2f, 0.2f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT| GL_DEPTH_BUFFER_BIT);
    
    setUpTransforms();
    
    drawFrame(textureIDForVieAutoTest);
    [glContext presentRenderbuffer:GL_RENDERBUFFER_OES];
    //--
    [windowB bind];
    
    glClearColor(0.2f, 0.2f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT| GL_DEPTH_BUFFER_BIT);
    
    setUpTransforms();
    
    drawFrame(textureIDForVieAutoTest);
    [glContext presentRenderbuffer:GL_RENDERBUFFER_OES];
    
    //--
}

#pragma mark -

-(void) vie_autotest_GoPressedHelper
{
    vie_autotest_ios_main(0, NULL);
}

-(IBAction) vie_autotest_GoPressed:(id)sender
{
    [self performSelectorInBackground:@selector(vie_autotest_GoPressedHelper) withObject:self];
}


- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil 
{
    if (self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil]) 
	{
		glContext = [[EAGLContext alloc] initWithAPI:kEAGLRenderingAPIOpenGLES1];

        if (!glContext || ![EAGLContext setCurrentContext:glContext]) 
		{
            [self release];
            return nil;
        }

		glDisable(GL_CULL_FACE);
		glDisable(GL_DEPTH_TEST);
    }
    return self;
}

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
	displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(doFrame)];
	displayLink.frameInterval = 1;

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
