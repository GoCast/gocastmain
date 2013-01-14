#include "Base/package.h"
#include "Math/package.h"

#include "CallcastEvent.h"
#include "CallcastManager.h"

#import "LoginView.h"

@implementation LoginView

-(id)initWithFrame:(CGRect)paramFrame
{
#pragma unused(paramFrame)

    self = [super initWithFrame:paramFrame];

    NSArray* arrayOfViews = [[NSBundle mainBundle] loadNibNamed:@"LoginView"
                                                          owner:self
                                                        options:nil];

    if ([arrayOfViews count] < 1){
        [self release];
        return nil;
    }

    LoginView *newView = [[arrayOfViews objectAtIndex:0] retain];
    [newView setFrame:paramFrame];

    [self release];
    self = newView;

    return self;
}

-(IBAction)onLoginPressed:(id)sender
{
#pragma unused(sender)

//    CallcastManager::getInstance()->notify(CallcastEvent(CallcastEvent::kSubmitLogin));
}

@end
