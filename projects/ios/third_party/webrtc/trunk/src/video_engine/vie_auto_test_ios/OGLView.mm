#include "OGLView.h"
#include "GlErrors.h"
#include <QuartzCore/QuartzCore.h>

#include <OpenGLES/EAGL.h>
#include <OpenGLES/EAGLDrawable.h>
#include <OpenGLES/ES1/glext.h>


@implementation OGLView


+ (Class)layerClass 
{
    return [CAEAGLLayer class];
}

- (id)initWithCoder:(NSCoder*)coder 
{
    if ((self = [super initWithCoder:coder])) 
	{
        CAEAGLLayer* eaglLayer = (CAEAGLLayer *)self.layer;
        eaglLayer.opaque = YES;
        eaglLayer.drawableProperties = [NSDictionary dictionaryWithObjectsAndKeys:
											[NSNumber numberWithBool:NO], 
											kEAGLDrawablePropertyRetainedBacking, 
											kEAGLColorFormatRGBA8, 
											kEAGLDrawablePropertyColorFormat, 
											nil];        
    }
	
    return self;
}


- (void)initialize:(EAGLContext*)oglContext
{
	FrameBufferUtils::Create(m_frameBuffer, oglContext, (CAEAGLLayer*)self.layer);
}


- (void)dealloc 
{

	FrameBufferUtils::Destroy(m_frameBuffer);
    [super dealloc];
}


- (void)bind
{
	FrameBufferUtils::Set(m_frameBuffer);
}


- (bool)popTouch
{
	const bool touched = m_touched;
	m_touched = false;
	return touched;
}


- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
	m_touched = true;
}


- (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event
{
}


@end
