#pragma once

//Based off of Java input streams, except...
//1. Without "exception handling"
//2. Not markable / resetable by default

class tInputStream
{
public:
    tInputStream() { }
    virtual ~tInputStream() { }
    
    virtual tUInt32 available() = 0;
    virtual bool    isEOF() = 0;
    virtual void    close() = 0;

    virtual tUInt32 read(void* ptr, tUInt32 size) = 0;
    virtual tUInt32 skip(tUInt32 size) = 0;
};

