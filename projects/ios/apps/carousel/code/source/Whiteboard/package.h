#pragma once

#include <OpenGL/gl.h>
#include <OpenGL/glext.h>
#include <OpenGL/glu.h>

#include <vector>
#include <string>
#include <math.h>
#include <assert.h>

#include "tObserver.h"
#include "tSingleton.h"

class tDimension2f
{
public:
    float width, height;

    bool operator ==(const tDimension2f& b) const { return (width == b.width) && (height == b.height); }
    bool operator !=(const tDimension2f& b) const { return !(*this == b); }

    tDimension2f(const float& newWidth = 0, const float& newHeight = 0)
    : width(newWidth), height(newHeight) { }
};

class tPoint2f
{
public:
    float x, y;

    bool operator ==(const tPoint2f& b) const { return (x == b.x) && (y == b.y); }
    bool operator !=(const tPoint2f& b) const { return !(*this == b); }
    tPoint2f operator +(const tPoint2f& b) const { return tPoint2f(x + b.x, y + b.y); }
    tPoint2f operator -(const tPoint2f& b) const { return tPoint2f(x - b.x, y - b.y); }

    tPoint2f(const float& nx = 0, const float& ny = 0)
    : x(nx), y(ny) { }
};

class tColor4b
{
public:
    uint8_t r, g, b, a;

    tColor4b(const uint8_t& nr = 0, const uint8_t& ng = 0, const uint8_t& nb = 0, const uint8_t& na = 0)
    : r(nr), g(ng), b(nb), a(na) { }
};

class tColor4i
{
public:
    uint32_t r, g, b, a;

    tColor4i(const uint32_t& nr = 0, const uint32_t& ng = 0, const uint32_t& nb = 0, const uint32_t& na = 0)
    : r(nr), g(ng), b(nb), a(na) { }
};

#include "tRect.h"

#include "tFile.h"

#include "tMouseEvent.h"
#include "tTouchEvent.h"
#include "tInputManager.h"

#include "tPixelFormat.h"
#include "tSurface.h"
#include "tTexture.h"
#include "tShader.h"
#include "tProgram.h"

#include "tSGView.h"

#define tSG_CREATE( NAME, NODE )    (void)0
#define tSG_LINK( PARENT, CHILD )   (void)0
#define tSG_RETRIEVE( NAME, TYPE )  (void*)0

