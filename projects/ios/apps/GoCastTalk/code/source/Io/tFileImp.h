#pragma once

#include <vector>

class tFileImp
{
public:
    enum PathType
    {
        kBundleDirectory = 0,       //read-only
        kDocumentsDirectory,
        kPreferencesDirectory,
        kTemporaryDirectory,
        kCacheDirectory,
        kRawDirectory,
    };

protected:
    std::string mFilename;
    PathType    mPathType;

protected:
    virtual std::string GetPathNameFromTypeImp() const = 0;
    virtual std::vector<tUInt8> FileToVectorImp() const = 0;
    virtual bool WriteVectorToFileImp(const std::vector<tUInt8>& data) const = 0;
public:
    std::string GetFullPath() const;

public:
    tFileImp(const PathType& newPath, const std::string& newFilename);
    explicit tFileImp(const std::string& newFilename);
    virtual ~tFileImp();

    PathType    getPathType() const;
    std::string getFilename() const;

    tUInt32     getLastModified() const;
    tUInt32     getFileSize() const;

    bool        remove() const;
    bool        exists() const;

    //TODO: These are two hack methods
    bool        rename(const PathType& newPath, const std::string& newFilename);
    std::vector<std::string> directoryListing();

    bool        write(const std::string& data);
    bool        write(const std::vector<tUInt8>& data);

    operator std::string() const;
    operator std::vector<tUInt8>() const;
};

