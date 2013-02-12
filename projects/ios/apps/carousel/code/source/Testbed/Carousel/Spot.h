#pragma once

class Spot
{
protected:
    int32_t mID;

public:
    Spot(const int32_t& newID);
    virtual ~Spot();

    int32_t getID();
};

