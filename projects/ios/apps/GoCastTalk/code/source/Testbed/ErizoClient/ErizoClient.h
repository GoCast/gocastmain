#pragma once

class URLLoaderEvent;

class ErizoClient
: public tObserver<const URLLoaderEvent&>
{
protected:
    std::string     mUname;
    std::string     mRoomID;
    ErizoRoom*      mRoom;
    ErizoStream*    mLocalStream;
    void*           mRTthat;
    fnJSONPtr       mRTonResponse;

protected:
    static void RequestTokenCallback(void* that, const std::string& jsonString);
    static void AccessAcceptedListener(void* that, const ErizoLicodeEvent* event);
    static void RoomConnectedListener(void* that, const ErizoLicodeEvent* event);
    static void StreamSubscribedListener(void* that, const ErizoLicodeEvent* event);
    static void StreamAddedListener(void* that, const ErizoLicodeEvent* event);
    static void StreamRemovedListener(void* that, const ErizoLicodeEvent* event);

public:
    ErizoClient();
    ~ErizoClient();

public:
    void startClient(const std::string& uname, const std::string& roomid);

    void requestToken(const std::string& uname, const std::string& role, const std::string& roomid, void* that, fnJSONPtr onresponse);
    void showStream(ErizoStream* stream, const std::string& type, const std::string& id);
    void stopShowingStream(ErizoStream* stream, const std::string& type, const std::string& id);

public:
    void update(const URLLoaderEvent& msg);
};

