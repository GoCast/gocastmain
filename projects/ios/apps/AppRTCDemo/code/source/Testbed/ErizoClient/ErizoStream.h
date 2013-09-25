#pragma once

class ErizoStream
{
public:
    ErizoStream(bool audio, bool video, const std::string& uname)
    {
        //TODO
#pragma unused(audio, video, uname)
    }

public:
    std::string getID() const { return ""; } //TODO
    std::string getAttributes() const { return ""; } //TODO
    bool hasAudio() const;
    bool hasVideo() const;
    bool hasData() const;
    bool hasScreen() const;
    void  sendData(void* msg);

    void init() { } //TODO
    void close();
    void show(void* elementID, void* options);
    void hide();

    void* getFrame() const;
    void* getVideoFrameURL() const;
    void* getVideoFrame() const;

public:
    std::string toString() const { return ""; } //TODO
};

