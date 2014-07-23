#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

tFileOutputStream::tFileOutputStream(const tFile& newFile)
: mFile(newFile)
{
    mFOUTptr = NULL;

    if (mFile.getPathType() != tFile::kBundleDirectory)
    {
        mFOUTptr = fopen(mFile.GetFullPath().c_str(), "wb");
    }
}

tFileOutputStream::~tFileOutputStream()
{
    close();
}

void    tFileOutputStream::close()
{
    if (mFOUTptr)
    {
        fflush(mFOUTptr);
        fclose(mFOUTptr);
        mFOUTptr = NULL;
    }
}

tUInt32 tFileOutputStream::write(const void* ptr, tUInt32 size)
{
    if (mFOUTptr && size)
    {
        return (tUInt32)fwrite(ptr, 1, size, mFOUTptr);
    }

    return 0;
}
