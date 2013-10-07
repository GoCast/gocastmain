#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

tFileInputStream::tFileInputStream(const tFile& newFile)
: mFile(newFile)
{
    mFINptr = fopen(mFile.GetFullPath().c_str(), "rb");
}

tFileInputStream::~tFileInputStream()
{
    close();
}

tUInt32 tFileInputStream::available()
{
    if (mFINptr)
    {
        return mFile.getFileSize() - (tUInt32)ftell(mFINptr);
    }
    
    return 0;
}

bool    tFileInputStream::isEOF()
{
    return available() == 0;
}

void    tFileInputStream::close()
{
    if (mFINptr)
    {
        fclose(mFINptr);
        mFINptr = NULL;
    }
}

tUInt32 tFileInputStream::read(void* ptr, tUInt32 size)
{
    assert(ptr);

    if (mFINptr && size)
    {
        return (tUInt32)fread(ptr, 1, size, mFINptr);
    }

    return 0;
}

tUInt32 tFileInputStream::skip(tUInt32 size)
{
    if (mFINptr && size)
    {
        tUInt32 startPos, finishPos;

        startPos = (tUInt32)ftell(mFINptr);
        
        fseek(mFINptr, (long)size, SEEK_CUR);
        
        finishPos = (tUInt32)ftell(mFINptr);
        
        return finishPos - startPos;
    }

    return 0;
}
