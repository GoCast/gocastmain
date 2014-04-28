#pragma once

class ErizoStream
: public ErizoEventDispatcher
{
protected:
    RTCMediaStream* mStream;
    ErizoRoom* mRoom;
    std::string mStreamID;
    std::string mAttributesName;
    bool mLocal;
    bool mAudio;
    bool mVideo;
    bool mData;
    bool mScreen;

protected:
    static void GetUserMediaCallback(void* that, RTCMediaStream* stream);
    static void GetUserMediaError(void* that, RTCMediaStream* stream);

public:
    ErizoStream(bool audio, bool video, const std::string& uname);

public:
    std::string getID() const;
    std::string getAttributesName() const;
    bool hasAudio() const;
    bool hasVideo() const;
    bool hasData() const;
    bool hasScreen() const;
    void  sendData(void* msg);

    void init();
    void close();
    void show(void* elementID, void* options);
    void hide();

    void* getFrame() const;
    void* getVideoFrameURL() const;
    void* getVideoFrame() const;

public:
    std::string toString() const { return ""; } //TODO
};

