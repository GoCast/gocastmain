#pragma once

class ErizoStack
{
public:
    ErizoStack(void* spec);

public:
    void onicecandidate(void* event);
    void processSignalingMessage(void* msgstring);

    void addStream(void* stream);
    void removeStream(void* stream);
    void close();

    void markActionNeeded();
    void doLater(void* what);

    void onstablestate();

    void sendOK();
    void sendMessage(void* operation, void* sdp);
    void error(void* text);

    void onopen();
    void onaddstream(void* stream);
    void onremovestream(void* stream);
};
