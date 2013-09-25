#pragma once

class ErizoRoom
{
protected:
    void RemoveStream(ErizoStream* stream);
    void SendDataSocket(ErizoStream* stream, void* msg);
    void ConnectSocket(void* token, void* callback, void* error);
    void SendMessageSocket(void* type, void* msg, void* callback, void* error);
    void SendSDPSocket(void* type, void* options, void* sdp, void* callback);

public:
    ErizoRoom(const std::string& newToken)
    {
#pragma unused(newToken)
        //TODO
    }

public:
    void connect() { } //TODO
    void disconnect();
    void publish(ErizoStream* stream)
    {
#pragma unused(stream)
        //TODO
    }
    void unpublish(ErizoStream* stream);
    void subscribe(ErizoStream* stream)
    {
#pragma unused(stream)
        //TODO
    }
    void unsubscribe(ErizoStream* stream);
    void getStreamsByAttribute(void* name, void* value);
};
