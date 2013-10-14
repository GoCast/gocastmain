#pragma once

class tFile
: public tFileImp
{
protected:
    virtual std::string GetPathNameFromTypeImp() const;
    virtual std::vector<tUInt8> FileToVectorImp() const;
    virtual bool WriteVectorToFileImp(const std::vector<tUInt8>& data) const;

public:
    tFile(const PathType& newPath, const std::string& newFilename);
    explicit tFile(const std::string& newFilename);
    virtual ~tFile();

    friend class tFileInputStream;
    friend class tFileOutputStream;
    friend class tSound;
    friend class URLConnection;
};

