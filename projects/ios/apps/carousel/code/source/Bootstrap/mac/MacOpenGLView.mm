#import <QuartzCore/CVDisplayLink.h>

#import "MacOpenGLView.h"

#include "package.h"

@implementation MacOpenGLView

static CVReturn MyDisplayLinkCallback(CVDisplayLinkRef displayLink, const CVTimeStamp* now, const CVTimeStamp* outputTime, CVOptionFlags flagsIn, CVOptionFlags* flagsOut, void* displayLinkContext)
{
#pragma unused(displayLink, now, outputTime, flagsIn, flagsOut)
@autoreleasepool
    {
        [(MacOpenGLView*)displayLinkContext setNeedsDisplay:TRUE];
    }
    return kCVReturnSuccess;
}

- (BOOL)acceptsFirstResponder   { return YES; }
- (BOOL)becomeFirstResponder    { return YES; }
- (BOOL)resignFirstResponder    { return YES; }

- (void) awakeFromNib
{
    [[self window] setAcceptsMouseMovedEvents:YES];
}

- (void) prepareOpenGL                         //initView
{
    mIsPrepared = false;

    NSOpenGLPixelFormatAttribute attributes [] = {
        //        NSOpenGLPFAWindow,
        NSOpenGLPFADoubleBuffer,	// double buffered
        NSOpenGLPFADepthSize, (NSOpenGLPixelFormatAttribute)16,     // 16 bit depth buffer
        NSOpenGLPFAStencilSize, (NSOpenGLPixelFormatAttribute)8,    //  8 bit stencil buffer
        (NSOpenGLPixelFormatAttribute)nil
    };

    NSOpenGLPixelFormat* format = [[[NSOpenGLPixelFormat alloc] initWithAttributes:attributes] autorelease];
    assert(format != nil);

    [self setPixelFormat:format];
    
//--

    // Synchronize buffer swaps with vertical refresh rate
    GLint swapInt = 1;
    [[self openGLContext] setValues:&swapInt forParameter:NSOpenGLCPSwapInterval]; 

    // Create a display link capable of being used with all active displays
    CVDisplayLinkCreateWithActiveCGDisplays(&mDisplayLink);
    
    // Set the renderer output callback function
    CVDisplayLinkSetOutputCallback(mDisplayLink, &MyDisplayLinkCallback, self);

    // Activate the display link
    CVDisplayLinkStart(mDisplayLink);

    srand((unsigned int)time(NULL));

    tSGView::getInstance()->notify(tSGViewEvent(tSGViewEvent::kInitView));
    mIsPrepared = true;
}

- (void) reshape                              //resizeStage
{
    NSSize size = [ [ [self window] contentView ] frame ].size;
    tSGView::getInstance()->notify(tSGViewEvent(tSGViewEvent::kResizeView, tDimension2f((float)size.width, (float)size.height)));

    [super reshape];
}

- (void) drawRect:(NSRect)dirtyRect            //drawStage (refresh)
{
    if (mIsPrepared)
    {
        tSGView::getInstance()->notify(tSGViewEvent(tSGViewEvent::kRedrawView, 0));
        [super drawRect:dirtyRect];
    }
}

- (void) update                                //resizeStage / drawStage (move or resize)
{
    NSSize size = [ [ [self window] contentView ] frame ].size;
    tSGView::getInstance()->notify(tSGViewEvent(tSGViewEvent::kResizeView, tDimension2f((float)size.width, (float)size.height)));

    [super update];
}

@end

