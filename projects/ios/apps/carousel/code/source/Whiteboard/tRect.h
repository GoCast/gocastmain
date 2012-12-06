#pragma once

class tRectf
{
public:
    tPoint2f        location;
    tDimension2f    size;

    //Comparison / relational operators
    bool operator ==(const tRectf& b) const { return (location == b.location) && (size == b.size); }
    bool operator !=(const tRectf& b) const { return !(*this == b); }

public:
    tRectf() { }
    tRectf(float nx, float ny, float nw, float nh) : location(nx, ny), size(nw, nh) { }
    tRectf(float nx, float ny, const tDimension2f& nd) : location(nx, ny), size(nd) { }
    tRectf(const tPoint2f& np, float nw, float nh) : location(np), size(nw, nh) { }
    tRectf(const tPoint2f& np, const tDimension2f& nd) : location(np), size(nd) { }

    bool contains(const tPoint2f& newPt) const
    {
        return  newPt.x >= location.x &&
                newPt.y >= location.y &&
                newPt.x < (location.x + size.width) &&
                newPt.y < (location.y + size.height);
    }
};

