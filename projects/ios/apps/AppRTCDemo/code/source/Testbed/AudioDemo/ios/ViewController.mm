#import <UIKit/UIKit.h>

#import "AppDelegate.h"
#import "ViewController.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"

#include "HUDEvent.h"
#include "HUDEventManager.h"

#include "AudioDemo.h"

const tColor4b      kBlack  (0,0,0,255);
const tColor4b      kRed    (255,0,0,255);
const tColor4b      kBlue   (0,0,255,255);
const tColor4b      kOrange (255,165,0,255);
const tColor4b      kWhite  (255,255,255,255);

extern AudioDemo gAudioDemo;

UIWebView* gWebViewInstance = NULL;

@implementation MainViewController

@synthesize mColors             = _colors;
@synthesize mSelectedColorIndex = _selectedColorIndex;

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

    self.mColors = [NSArray arrayWithObjects:@"Blue", @"Orange", @"Black", @"Red", @"Eraser", nil];

    self.mSwipeLeftGesture = [[UISwipeGestureRecognizer alloc]
                              initWithTarget:self
                              action:@selector(handleSwipeLeft:)];
    self.mSwipeLeftGesture.direction = UISwipeGestureRecognizerDirectionLeft;

    self.mSwipeRightGesture = [[UISwipeGestureRecognizer alloc]
                               initWithTarget:self
                               action:@selector(handleSwipeRight:)];
    self.mSwipeRightGesture.direction = UISwipeGestureRecognizerDirectionRight;

    [self.mSwipeLeftGesture setDelegate:self];
    [self.mSwipeRightGesture setDelegate:self];
    [self.mWhiteboardSpotView addGestureRecognizer:self.mSwipeLeftGesture];
    [self.mWhiteboardSpotView addGestureRecognizer:self.mSwipeRightGesture];

    [self.mAnimateInSpot setHidden:YES];
    [self.mAnimateOutSpot setHidden:YES];
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

-(IBAction)quitPressed:(id)sender
{
#pragma unused(sender)
    exit(0);
}

@end
