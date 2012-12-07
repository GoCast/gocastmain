#import <QuartzCore/CVDisplayLink.h>

#import "MacOpenGLView.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "OpenGL/package.h"

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

#pragma mark --MouseEvent hooks
- (void)mouseEvent:(NSEvent *)theEvent withEvent:(tMouseEvent::EventType)evt withID:(tMouseEvent::ButtonID)bID
{
    NSPoint  loc    = [self convertPoint:[theEvent locationInWindow] fromView:self];
    
    tPoint2f calculatedLoc((float)loc.x, float([self bounds].size.height - loc.y));
    tRectf viewPort = tRectf(0,0,320,480);
    tDimension2f original = tDimension2f(320,480);
    
    calculatedLoc -= viewPort.location;
    calculatedLoc.x = calculatedLoc.x / viewPort.size.width * original.width; calculatedLoc.y = calculatedLoc.y / viewPort.size.height * original.height;
    
    tInputManager::getInstance()->tSubject<const tMouseEvent&>::notify(tMouseEvent(evt, tInputManager::getInstance(), calculatedLoc, bID));
}

- (void)mouseDown:(NSEvent *)theEvent { [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseDown withID:tMouseEvent::kLeft]; }
- (void)otherMouseDown:(NSEvent *)theEvent { [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseDown withID:tMouseEvent::kMiddle]; }
- (void)rightMouseDown:(NSEvent *)theEvent { [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseDown withID:tMouseEvent::kRight]; }

- (void)mouseDragged:(NSEvent *)theEvent { [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseDrag withID:tMouseEvent::kLeft]; }
- (void)otherMouseDragged:(NSEvent *)theEvent { [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseDrag withID:tMouseEvent::kMiddle]; }
- (void)rightMouseDragged:(NSEvent *)theEvent { [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseDrag withID:tMouseEvent::kRight]; }

- (void)mouseMoved:(NSEvent *)theEvent
{
    NSPoint pt = [self convertPoint:[theEvent locationInWindow] fromView:nil];
    NSRect windowSize = [self bounds];
    if ((pt.x >= 0.0f && pt.y >= 0) &&
        (pt.x <= windowSize.size.width && pt.y <= windowSize.size.height))
    {
        [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseMove withID:tMouseEvent::kLeft];
    }
}

- (void)mouseUp:(NSEvent *)theEvent { [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseUp withID:tMouseEvent::kLeft]; }
- (void)otherMouseUp:(NSEvent *)theEvent { [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseUp withID:tMouseEvent::kMiddle]; }
- (void)rightMouseUp:(NSEvent *)theEvent { [self mouseEvent:theEvent withEvent:tMouseEvent::kMouseUp withID:tMouseEvent::kRight]; }

//TODO: figure out what range we want to use for mouse wheel, and test it, it's untested
- (void)scrollWheel:(NSEvent *)theEvent
{
#pragma unused(theEvent)
    //    NSPoint  loc    = [self convertPoint:[theEvent locationInWindow] fromView:nil];
    //    unsigned flags  = [theEvent modifierFlags];
    //    
    //    Stage::getInstance()->tSubject<const MouseEvent&>::notify(
    //          MouseEvent(
    //                     MouseEvent::mouseWheel,
    //                     tPoint2f(loc.x, loc.y),
    //                     MouseEvent::left,
    //                     [theEvent deltaX],
    //                     [theEvent deltaY],
    //                     [theEvent deltaZ],
    //                     (flags & NSAlternateKeyMask),
    //                     (flags & NSCommandKeyMask),
    //                     (flags & NSControlKeyMask),
    //                     (flags & NSShiftKeyMask)));
}


@end

