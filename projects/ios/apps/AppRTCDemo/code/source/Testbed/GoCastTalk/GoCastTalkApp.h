#pragma once

#include <queue>

class GoCastTalkAppMessage;
class GCTEvent;

class GoCastTalkApp
:   public tMealy,
    public tObserver<const GoCastTalkAppMessage&>,
    public tObserver<const GCTEvent&>
{
protected:
    std::string mCurAudioFilename;
    std::string mGroupToEdit;
    Tab*     mTabs[5];
    bool        mExistsOnServer;
    bool        mIsEditing;

public:
	GoCastTalkApp();
	~GoCastTalkApp();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void createAllTabsEntry();
	void idleEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kReady,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kCreateAllTabs,
		kEnd,
		kIdle,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const GoCastTalkAppMessage& msg);
	void update(const GCTEvent& msg);
};

class GoCastTalkAppMessage
{
public:
	GoCastTalkApp::EventType                mEvent;
	tSubject<const GoCastTalkAppMessage&>*  mSource;
    std::string                             mAudioFilename;
    std::string                             mGroupToEdit;
    bool                                    mExistsOnServer;
    bool                                    mIsEditing;

public:
	GoCastTalkAppMessage(GoCastTalkApp::EventType newEvent, tSubject<const GoCastTalkAppMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
	GoCastTalkAppMessage(GoCastTalkApp::EventType newEvent, const std::string& newAudioFilename, tSubject<const GoCastTalkAppMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource), mAudioFilename(newAudioFilename) { }
	GoCastTalkAppMessage(GoCastTalkApp::EventType newEvent, const std::string& newAudioFilename, bool newExistsOnServer, tSubject<const GoCastTalkAppMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource),
    mAudioFilename(newAudioFilename), mGroupToEdit(newAudioFilename), mExistsOnServer(newExistsOnServer), mIsEditing(newExistsOnServer) { }
};

