#pragma once

class tFileOutputStream
: public tOutputStream
{
protected:
    tFile mFile;
    FILE* mFOUTptr;

public:
    tFileOutputStream(const tFile& newFile);
    ~tFileOutputStream();
    
    void    close();
    
    tUInt32 write(const void* ptr, tUInt32 size);
};

