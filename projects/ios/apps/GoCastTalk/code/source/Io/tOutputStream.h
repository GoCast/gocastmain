#pragma once

//Based off of Java output streams, except...
//1. Without "exception handling"
//2. Not markable / resetable by default

class tOutputStream
{
public:
    tOutputStream() { }
    virtual ~tOutputStream() { }
    
    virtual void    close() = 0;
    
    virtual tUInt32 write(const void* ptr, tUInt32 size) = 0;
};

