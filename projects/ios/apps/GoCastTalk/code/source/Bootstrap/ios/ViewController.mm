#include "ViewController.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"

@interface ViewController()
{
}
@end

@implementation ViewController

#pragma mark Construction / Destruction
- (void)viewDidLoad
{
    [super viewDidLoad];

    self.view.autoresizesSubviews = YES;
}

- (void)viewDidUnload
{    
    [super viewDidUnload];
}

- (void)dealloc
{
    [super dealloc];
}

#pragma mark tOrientationEvent generation
- (void)viewWillLayoutSubviews
{
    [self willRotateToInterfaceOrientation:self.interfaceOrientation duration:0];
    [self didRotateFromInterfaceOrientation:self.interfaceOrientation];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
#pragma unused(interfaceOrientation)
    [UIView setAnimationsEnabled:NO];

    tOrientationEvent::OrientationType type = tOrientationEvent::kPortrait;

    switch(interfaceOrientation)
    {
        default:
        case UIInterfaceOrientationPortrait:            type = tOrientationEvent::kPortrait; break;
        case UIInterfaceOrientationPortraitUpsideDown:  type = tOrientationEvent::kPortraitUpsidedown; break;
        case UIInterfaceOrientationLandscapeLeft:       type = tOrientationEvent::kLandscapeLeft; break;
        case UIInterfaceOrientationLandscapeRight:      type = tOrientationEvent::kLandscapeRight; break;
    }

    tOrientationEvent msg(tOrientationEvent::kAllowOrientation, type);
    tInputManager::getInstance()->tSubject<tOrientationEvent &>::notify(msg);

    return msg.mAllowed ? YES : NO;
}

- (void)sendOrientationChangedMessage:(UIInterfaceOrientation)toInterfaceOrientation
{
    tOrientationEvent::OrientationType type = tOrientationEvent::kPortrait;

    switch(toInterfaceOrientation)
    {
        default:
        case UIInterfaceOrientationPortrait:            type = tOrientationEvent::kPortrait; break;
        case UIInterfaceOrientationPortraitUpsideDown:  type = tOrientationEvent::kPortraitUpsidedown; break;
        case UIInterfaceOrientationLandscapeLeft:       type = tOrientationEvent::kLandscapeLeft; break;
        case UIInterfaceOrientationLandscapeRight:      type = tOrientationEvent::kLandscapeRight; break;
    }

    tOrientationEvent msg(tOrientationEvent::kOrientationChanged, type);
    tInputManager::getInstance()->tSubject<tOrientationEvent &>::notify(msg);
}

- (void)willRotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration
{
#pragma unused(duration)
    [UIView setAnimationsEnabled:NO];

    [self sendOrientationChangedMessage:toInterfaceOrientation];
}

- (void)didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation
{
#pragma unused(fromInterfaceOrientation)
    [super didRotateFromInterfaceOrientation:fromInterfaceOrientation];
    [UIView setAnimationsEnabled:YES];
}

@end
