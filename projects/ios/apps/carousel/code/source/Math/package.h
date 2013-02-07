#pragma once

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

    tPoint2f& operator +=(const tPoint2f& b) { *this = *this + b; return *this; }
    tPoint2f& operator -=(const tPoint2f& b) { *this = *this - b; return *this; }

    tPoint2f(const float& nx = 0, const float& ny = 0)
    : x(nx), y(ny) { }
};

class tColor4b
{
public:
    uint8_t r, g, b, a;

    bool operator ==(const tColor4b& o) const { return (r == o.r) && (g == o.g) && (b == o.b) && (a == o.a); }
    bool operator !=(const tColor4b& o) const { return !(*this == o); }

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

class tVector4f
{
public:
    union
    {
        float mArray[4];
        struct { float x, y, z, w; };
    };

    //Array subscript operator
	float& operator [](const size_t i) { assert(i < 4); return mArray[i]; }
	const float& operator [](const size_t i) const { assert(i < 4); return mArray[i]; }

public:
    tVector4f(const float& nx = 0, const float& ny = 0, const float& nz = 0, const float& nw = 0)
    : x(nx), y(ny), z(nz), w(nw) { }
};

class tMatrix4x4f
{
public:
    tVector4f mArray[4];

	tVector4f& operator [](const size_t i) { assert(i < 4); return mArray[i]; }
	const tVector4f& operator [](const size_t i) const { assert(i < 4); return mArray[i]; }

public:
    tMatrix4x4f(const float& n)
    {
        mArray[0] = tVector4f(n, 0, 0, 0);
        mArray[1] = tVector4f(0, n, 0, 0);
        mArray[2] = tVector4f(0, 0, n, 0);
        mArray[3] = tVector4f(0, 0, 0, n);
    }
};


#include "tRect.h"

