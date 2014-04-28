#pragma once

class ErizoLicodeEvent
{
public:
    enum ClassType
    {
        kLicodeEvent,
        kRoomEvent,
        kStreamEvent,
        kPublisherEvent,
    };
public:
    std::string mType;
    ClassType   mClass;

    ErizoLicodeEvent(const std::string& newType)
    : mType(newType), mClass(kLicodeEvent) { }
};

class ErizoRoomEvent
: public ErizoLicodeEvent
{
public:
    std::vector<ErizoStream*>   mStreams;

    ErizoRoomEvent(const std::string& newType, const std::vector<ErizoStream*>& newStreams)
    : ErizoLicodeEvent(newType), mStreams(newStreams)
    {
        mClass = kRoomEvent;
    }
};

class ErizoStreamEvent
: public ErizoLicodeEvent
{
public:
    ErizoStream*    mStream;

    ErizoStreamEvent(const std::string& newType, ErizoStream* newStream)
    : ErizoLicodeEvent(newType), mStream(newStream)
    {
        mClass = kStreamEvent;
    }
};

class ErizoPublisherEvent
: public ErizoLicodeEvent
{
public:

    ErizoPublisherEvent(const std::string& newType)
    : ErizoLicodeEvent(newType)
    {
        mClass = kPublisherEvent;
    }
};

class ErizoEventDispatcher
{
protected:
    std::map<std::string, std::list<std::pair<void*, fnEventPtr> > >    mEventListeners;

public:
    ErizoEventDispatcher();
    ~ErizoEventDispatcher();

public:
    void addEventListener(const std::string& eventType, void* that, fnEventPtr listener);
    void removeEventListener(const std::string& eventType, void* that, fnEventPtr listener);
    void dispatchEvent(const ErizoLicodeEvent* event);

    friend class tSingleton<ErizoEventDispatcher>;
};

