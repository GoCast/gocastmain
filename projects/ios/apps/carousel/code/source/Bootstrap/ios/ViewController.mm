/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  MainViewController.h
//  HelloWorld
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//

#import "LoginView.h"
#import "ViewController.h"

#include "Base/package.h"
#include "Math/package.h"
#include "CallcastEvent.h"
#include "CallcastManager.h"


UIWebView* gWebViewInstance = NULL;

@implementation MainViewController

- (id)initWithNibName:(NSString*)nibNameOrNil bundle:(NSBundle*)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];

    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (void)viewWillAppear:(BOOL)animated
{
    // Set the main view to utilize the entire application frame space of the device.
    // Change this to suit your view's UI footprint needs in your application.

    UIView* rootView = [[[[UIApplication sharedApplication] keyWindow] rootViewController] view];
    CGRect webViewFrame = [[[rootView subviews] objectAtIndex:0] frame];  // first subview is the UIWebView

    if (CGRectEqualToRect(webViewFrame, CGRectZero)) { // UIWebView is sized according to its parent, here it hasn't been sized yet
        self.view.frame = [[UIScreen mainScreen] applicationFrame]; // size UIWebView's parent according to application frame, which will in turn resize the UIWebView
    }

    [super viewWillAppear:animated];
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return [super shouldAutorotateToInterfaceOrientation:interfaceOrientation];
}

/* Comment out the block below to over-ride */

/*
 - (CDVCordovaView*) newCordovaViewWithFrame:(CGRect)bounds
 {
 return[super newCordovaViewWithFrame:bounds];
 }
 */

/* Comment out the block below to over-ride */

/*
 #pragma CDVCommandDelegate implementation

 - (id) getCommandInstance:(NSString*)className
 {
 return [super getCommandInstance:className];
 }

 - (BOOL) execute:(CDVInvokedUrlCommand*)command
 {
 return [super execute:command];
 }

 - (NSString*) pathForResource:(NSString*)resourcepath;
 {
 return [super pathForResource:resourcepath];
 }

 - (void) registerPlugin:(CDVPlugin*)plugin withClassName:(NSString*)className
 {
 return [super registerPlugin:plugin withClassName:className];
 }
 */

#pragma mark UIWebDelegate implementation

- (void)webViewDidStartLoad:(UIWebView *)webView
{
    CGRect newFrame = CGRectMake(-10, -10, 5, 5);
    [webView setFrame:newFrame];
}

- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    gWebViewInstance = theWebView;
    // only valid if ___PROJECTNAME__-Info.plist specifies a protocol to handle
//    if (self.invokeString) {
//        // this is passed before the deviceready event is fired, so you can access it in js when you receive deviceready
//        NSLog(@"DEPRECATED: window.invokeString - use the window.handleOpenURL(url) function instead, which is always called when the app is launched through a custom scheme url.");
//        NSString* jsString = [NSString stringWithFormat:@"var invokeString = \"%@\";", self.invokeString];
//        [theWebView stringByEvaluatingJavaScriptFromString:jsString];
//    }

    // Black base color for background matches the native apps
    theWebView.backgroundColor = [UIColor blackColor];

    //    [theWebView stringByEvaluatingJavaScriptFromString:@"alert('hello');"];

    return [super webViewDidFinishLoad:theWebView];
}

/* Comment out the block below to over-ride */

/*

 - (void) webViewDidStartLoad:(UIWebView*)theWebView
 {
 return [super webViewDidStartLoad:theWebView];
 }

 - (void) webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error
 {
 return [super webView:theWebView didFailLoadWithError:error];
 }

 - (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
 {
 return [super webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
 }
 */

-(IBAction)loginPressed:(id)sender
{
#pragma unused(sender)
    printf("*** ViewController::loginPressed\n");
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kSubmitLogin, [self.mNickname.text UTF8String], [self.mRoomname.text UTF8String]));
    [self.view endEditing:YES];
}

-(IBAction)pressed1px:(id)sender
{
#pragma unused(sender)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kChangePenSize, tColor4b(0,0,0,0), 1));
}
-(IBAction)pressed3px:(id)sender
{
#pragma unused(sender)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kChangePenSize, tColor4b(0,0,0,0), 3));
}

-(IBAction)pressed5px:(id)sender
{
#pragma unused(sender)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kChangePenSize, tColor4b(0,0,0,0), 5));
}

-(IBAction)pressed10px:(id)sender
{
#pragma unused(sender)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kChangePenSize, tColor4b(0,0,0,0), 10));
}

-(IBAction)pressedColor:(id)sender
{
#pragma unused(sender)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kChangePenColor));
}

-(IBAction)pressedErase:(id)sender
{
#pragma unused(sender)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kChangePenErase));
}

-(IBAction)pressedPrev:(id)sender
{
#pragma unused(sender)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kPrevSpot));
}

-(IBAction)pressedNext:(id)sender
{
#pragma unused(sender)
    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kNextSpot));
}


@end
