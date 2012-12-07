#pragma once

#ifdef PLATFORM_IOS
#include <OpenGLES/ES2/gl.h>
#include <OpenGLES/ES2/glext.h>
#else
#include <OpenGL/gl.h>
#include <OpenGL/glext.h>
#include <OpenGL/glu.h>
#endif

#include "tPixelFormat.h"
#include "tSurface.h"
#include "tTexture.h"
#include "tShader.h"
#include "tProgram.h"

#include "tSGView.h"

#define tSG_CREATE( NAME, NODE )    (void)0
#define tSG_LINK( PARENT, CHILD )   (void)0
#define tSG_RETRIEVE( NAME, TYPE )  (void*)0

