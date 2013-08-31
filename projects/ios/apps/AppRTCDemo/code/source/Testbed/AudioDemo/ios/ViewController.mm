#import <UIKit/UIKit.h>

#import "AppDelegate.h"
#import "ViewController.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"

#include "HUDEvent.h"
#include "HUDEventManager.h"

#include "AudioDemo.h"

extern AudioDemo gAudioDemo;

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

-(IBAction)quitPressed:(id)sender
{
#pragma unused(sender)
    exit(0);
}

-(IBAction)buttonPressed:(id)sender
{
    [self.mScreenName resignFirstResponder];
    [self.mRoomName resignFirstResponder];

    if (sender == self.mScreenNameGo)
    {
        HUDEventManager::getInstance()->notify(HUDEvent(HUDEvent::kScreenNameGoPressed));
    }
    else if (sender == self.mRoomNameGo)
    {
        HUDEventManager::getInstance()->notify(HUDEvent(HUDEvent::kRoomNameGoPressed));
    }
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
    [textField resignFirstResponder];

    return NO;
}

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
#pragma unused(tableView, section)
    return (NSInteger)5;
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView)
    if (indexPath.row % 2)
    {
        [cell setBackgroundColor:[UIColor colorWithRed:.8f green:.8f blue:1 alpha:1]];
    }
    else
    {
        [cell setBackgroundColor:[UIColor whiteColor]];
    }
}

-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    const char* names[5] =
    {
        "Yoji Izaki",
        "Shinzo Abe",
        "Barack Obama",
        "TJ Grant",
        "Manjesh Mallavali",
    };
#pragma unused(indexPath)

    tableView.backgroundView = nil;

    static NSString *simpleTableIdentifier = @"AudioDemoTableItem";

    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];

    if (cell == nil)
    {
        cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier] autorelease];
    }

    cell.textLabel.text = [NSString stringWithUTF8String:names[indexPath.row]];

    cell.imageView.image = nil;

    return cell;
}

-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
#pragma unused(tableView, indexPath)
    //    JSEventManager::getInstance()->notify(JSEvent(JSEvent::kLibraryRowSelected, indexPath.row + 1));
}

@end
