//
//  MacOpenGLView.h
//  SceneGraph
//
//  Created by grant on 8/8/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface MacOpenGLView : NSOpenGLView
{
    CVDisplayLinkRef    mDisplayLink;
    bool                mIsPrepared;
}

//--tSGViewEvent hooks
//- (id) initWithFrame:(NSRect)frameRect;// pixelFormat:(NSOpenGLPixelFormat *)format;   //createView
- (void) prepareOpenGL;                                                             //createView, initView
- (void) reshape;                                                                   //resizeView
- (void) drawRect:(NSRect)dirtyRect;                                                //redrawView (refresh)
- (void) update;                                                                    //resizeView or redrawView (move or resize)

@end
