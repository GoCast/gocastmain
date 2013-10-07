#include "Base/package.h"
#include "Math/package.h"
#include "Io/package.h"

#include <sys/types.h>
#include <sys/stat.h>
#include <stdio.h>

//Cheating this method declaration here, because it's common code.
std::vector<tUInt8> tFile::FileToVectorImp() const
{
    std::vector<tUInt8> result;

    if (exists())
    {
        tFileInputStream fis(*this);

        tUInt32 len = fis.available();

        result.resize(len);

        if (fis.read(&result[0], len) != len)
        {
            result.resize(0);
        }
    }
    
    return result;
}

bool tFile::WriteVectorToFileImp(const std::vector<tUInt8>& data) const
{
    return tFileOutputStream(*this).write(&data[0], (tUInt32)data.size()) == (tUInt32)data.size();
}

std::string tFileImp::GetFullPath() const
{
    return GetPathNameFromTypeImp() + mFilename;
}

tFileImp::tFileImp(const PathType& newPath, const std::string& newFilename)
: mFilename(newFilename), mPathType(newPath)
{
}

tFileImp::tFileImp(const std::string& newFilename)
: mFilename(newFilename), mPathType(kBundleDirectory)
{
}

tFileImp::~tFileImp()
{
}

tFileImp::PathType    tFileImp::getPathType() const
{
    return mPathType;
}

std::string tFileImp::getFilename() const
{
    return mFilename;
}

tUInt32     tFileImp::getLastModified() const
{
    if (exists())
    {
        struct stat statbuf;
        if (stat(GetFullPath().c_str(), &statbuf) == -1)
        {
            return 0;
        }
        
        return (tUInt32)statbuf.st_mtime;
    }
    
    return 0;
}

tUInt32     tFileImp::getFileSize() const
{
    if (exists())
    {
        struct stat statbuf;

        stat(GetFullPath().c_str(), &statbuf);
        
        return (tUInt32)statbuf.st_size;
    }

    return 0;
}

bool        tFileImp::remove() const
{
    if ((mPathType != tFileImp::kBundleDirectory) && exists())
    {
        return ::remove(GetFullPath().c_str()) == 0;
    }
    
    return false;
}

bool        tFileImp::exists() const
{
    return ::access(GetFullPath().c_str(), F_OK) == 0;
}

bool        tFileImp::write(const std::string& data)
{
    return write(std::vector<tUInt8>(data.begin(), data.end()));
}

bool        tFileImp::write(const std::vector<tUInt8>& data)
{
    return WriteVectorToFileImp(data);
}

tFileImp::operator std::string() const
{
    std::vector<tUInt8> vec(*this);
    vec.push_back(0x00);

    return std::string((char*)&vec[0]);
}

tFileImp::operator std::vector<tUInt8>() const
{
    return FileToVectorImp();
}
