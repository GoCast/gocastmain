#include "Base/package.h"
#include "Math/package.h"

#include "Spot.h"

Spot::Spot(const int32_t& newID)
: mID(newID)
{

}

Spot::~Spot()
{

}

int32_t Spot::getID()
{
    return mID;
}
