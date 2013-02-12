#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>
#include <OpenGLES/ES2/gl.h>
#include <OpenGLES/ES2/glext.h>

@interface OpenGLView : UIView
{
    CAEAGLLayer* mEaglLayer;
    EAGLContext* mContext;
    GLuint mColorRenderBuffer;
    GLuint mDepthRenderBuffer;
}

@end
