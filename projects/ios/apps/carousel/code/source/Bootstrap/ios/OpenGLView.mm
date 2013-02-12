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
    mEaglLayer = (CAEAGLLayer*) self.layer;
    mEaglLayer.opaque = YES;
}

- (void)setupContext {   
    EAGLRenderingAPI api = kEAGLRenderingAPIOpenGLES2;
    mContext = [[EAGLContext alloc] initWithAPI:api];
    if (!mContext) {
        NSLog(@"Failed to initialize OpenGLES 2.0 context");
        exit(1);
    }
    
    if (![EAGLContext setCurrentContext:mContext]) {
        NSLog(@"Failed to set current OpenGL context");
        exit(1);
    }
}

- (void)setupRenderBuffer {
    glGenRenderbuffers(1, &mColorRenderBuffer);
    glBindRenderbuffer(GL_RENDERBUFFER, mColorRenderBuffer);
    [mContext renderbufferStorage:GL_RENDERBUFFER fromDrawable:mEaglLayer];
}

- (void)setupDepthBuffer {
    glGenRenderbuffers(1, &mDepthRenderBuffer);
    glBindRenderbuffer(GL_RENDERBUFFER, mDepthRenderBuffer);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, (GLsizei)self.frame.size.width, (GLsizei)self.frame.size.height);
}

- (void)setupFrameBuffer {    
    GLuint framebuffer;
    glGenFramebuffers(1, &framebuffer);
    glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);   
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, mColorRenderBuffer);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, mDepthRenderBuffer);
}

- (void)render:(CADisplayLink*)displayLink
{
#pragma unused(displayLink)
    tSGView::getInstance()->notify(tSGViewEvent(tSGViewEvent::kRedrawView, 0));
    
    [mContext presentRenderbuffer:GL_RENDERBUFFER];
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
    [mContext release];
    mContext = nil;
    [super dealloc];
}

- (void)touchEvent:(NSSet *)touches withEvent:(tTouchEvent::EventType)evt
{
    UITouch *touch = [touches anyObject];
    CGPoint touchPoint = [touch locationInView:self];

    tInputManager::getInstance()->tSubject<const tTouchEvent&>::notify(tTouchEvent(evt,
                                                                                   tInputManager::getInstance(),
                                                                                   tPoint2f(touchPoint.x / 300.0f * 500.0f,
                                                                                            touchPoint.y / 300.0f * 500.0f)));
}

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
#pragma unused(event)
    [self touchEvent:touches withEvent:tTouchEvent::kTouchBegin];
}

- (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event
{
#pragma unused(event)
    [self touchEvent:touches withEvent:tTouchEvent::kTouchDrag];
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event
{
#pragma unused(event)
    [self touchEvent:touches withEvent:tTouchEvent::kTouchEnd];
}

@end
