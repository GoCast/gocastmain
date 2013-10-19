#pragma once

#include <queue>

class MemoAppMessage;
class MemoEvent;

class MemoApp
:   public tMealy,
    public tObserver<const MemoAppMessage&>,
    public tObserver<const MemoEvent&>
{
protected:
    std::string mCurAudioFilename;
    Screen*     mScreen;
    bool        mExistsOnServer;

public:
	MemoApp();
	~MemoApp();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void hideAllViewsEntry();
	void myInboxScreenEntry();
	void oldVersionScreenEntry();
	void playAudioScreenEntry();
	void recordAudioScreenEntry();
	void sendToGroupScreenEntry();
	void settingsScreenEntry();
	void startScreenEntry();
	void versionCheckScreenEntry();

	void myInboxScreenExit();
	void playAudioScreenExit();
	void recordAudioScreenExit();
	void sendToGroupScreenExit();
	void settingsScreenExit();
	void startScreenExit();
	void versionCheckScreenExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kGoInbox,
		kGoNewRecording,
		kGoPlay,
		kGoSendGroup,
		kGoSettings,
		kReady,
		kRestart,
		kSuccess,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kHideAllViews,
		kMyInboxScreen,
		kOldVersionScreen,
		kPlayAudioScreen,
		kRecordAudioScreen,
		kSendToGroupScreen,
		kSettingsScreen,
		kStartScreen,
		kVersionCheckScreen,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const MemoAppMessage& msg);
	void update(const MemoEvent& msg);
};

class MemoAppMessage
{
public:
	MemoApp::EventType                  mEvent;
	tSubject<const MemoAppMessage&>*    mSource;
    std::string                         mAudioFilename;
    bool                                mExistsOnServer;

public:
	MemoAppMessage(MemoApp::EventType newEvent, tSubject<const MemoAppMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
	MemoAppMessage(MemoApp::EventType newEvent, const std::string& newAudioFilename, tSubject<const MemoAppMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource), mAudioFilename(newAudioFilename) { }
	MemoAppMessage(MemoApp::EventType newEvent, const std::string& newAudioFilename, bool newExistsOnServer, tSubject<const MemoAppMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource), mAudioFilename(newAudioFilename), mExistsOnServer(newExistsOnServer) { }
};

