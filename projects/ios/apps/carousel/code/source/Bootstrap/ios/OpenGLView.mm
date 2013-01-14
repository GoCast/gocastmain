#import "OpenGLView.h"

#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "OpenGL/package.h"

@implementation OpenGLView

#define TEX_COORD_MAX   4

+ (Class)layerClass {
    return [CAEAGLLayer class];
}

- (void)setupLayer {
    _eaglLayer = (CAEAGLLayer*) self.layer;
    _eaglLayer.opaque = YES;
}

- (void)setupContext {   
    EAGLRenderingAPI api = kEAGLRenderingAPIOpenGLES2;
    _context = [[EAGLContext alloc] initWithAPI:api];
    if (!_context) {
        NSLog(@"Failed to initialize OpenGLES 2.0 context");
        exit(1);
    }
    
    if (![EAGLContext setCurrentContext:_context]) {
        NSLog(@"Failed to set current OpenGL context");
        exit(1);
    }
}

- (void)setupRenderBuffer {
    glGenRenderbuffers(1, &_colorRenderBuffer);
    glBindRenderbuffer(GL_RENDERBUFFER, _colorRenderBuffer);        
    [_context renderbufferStorage:GL_RENDERBUFFER fromDrawable:_eaglLayer];    
}

- (void)setupDepthBuffer {
    glGenRenderbuffers(1, &_depthRenderBuffer);
    glBindRenderbuffer(GL_RENDERBUFFER, _depthRenderBuffer);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, (GLsizei)self.frame.size.width, (GLsizei)self.frame.size.height);
}

- (void)setupFrameBuffer {    
    GLuint framebuffer;
    glGenFramebuffers(1, &framebuffer);
    glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);   
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, _colorRenderBuffer);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, _depthRenderBuffer);
}

- (void)render:(CADisplayLink*)displayLink
{
#pragma unused(displayLink)
    tSGView::getInstance()->notify(tSGViewEvent(tSGViewEvent::kRedrawView, 0));
    
    [_context presentRenderbuffer:GL_RENDERBUFFER];
}

- (void)setupDisplayLink {
    CADisplayLink* displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(render:)];
    [displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];    
}

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {        
        [self setupLayer];        
        [self setupContext];    
        [self setupDepthBuffer];
        [self setupRenderBuffer];        
        [self setupFrameBuffer];     

        tSGView::getInstance()->notify(tSGViewEvent(tSGViewEvent::kInitView));

        [self setupDisplayLink];
    }
    return self;
}

- (void)dealloc
{
    [_context release];
    _context = nil;
    [super dealloc];
}

- (void)mouseEvent:(NSSet *)touches withEvent:(tMouseEvent::EventType)evt withID:(tMouseEvent::ButtonID)bID
{
    UITouch *touch = [touches anyObject];
    CGPoint touchPoint = [touch locationInView:self];

    tInputManager::getInstance()->tSubject<const tMouseEvent&>::notify(tMouseEvent(evt, tInputManager::getInstance(),
                                                                                   tPoint2f(touchPoint.x / 300.0f * 500.0f, touchPoint.y / 300.0f * 500.0f), bID));
}

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
#pragma unused(event)
    [self mouseEvent:touches withEvent:tMouseEvent::kMouseDown withID:tMouseEvent::kLeft];
}

- (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event
{
#pragma unused(event)
    [self mouseEvent:touches withEvent:tMouseEvent::kMouseDrag withID:tMouseEvent::kLeft];
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event
{
#pragma unused(event)
    [self mouseEvent:touches withEvent:tMouseEvent::kMouseUp withID:tMouseEvent::kLeft];
}

@end
