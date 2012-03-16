#ifndef st_oglview_h_
#define st_oglview_h_


#include "FrameBuffer.h"
#import <UIKit/UIKit.h>

@class EAGLContext;

@interface OGLView : UIView 
{
	FrameBuffer m_frameBuffer;

	bool m_touched;
}

- (void)initialize:(EAGLContext*)oglContext;
- (void)bind;
- (bool)popTouch;

@end


#endif
