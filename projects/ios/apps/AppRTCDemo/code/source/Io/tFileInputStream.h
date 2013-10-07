#pragma once

class tFileInputStream
: public tInputStream
{
protected:
    tFile mFile;
    FILE* mFINptr;

public:
    tFileInputStream(const tFile& newFile);
    ~tFileInputStream();
    
    tUInt32 available();
    bool    isEOF();
    void    close();
    
    tUInt32 read(void* ptr, tUInt32 size);
    tUInt32 skip(tUInt32 size);
};

