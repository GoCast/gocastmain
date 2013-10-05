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
    Screen* mScreen;

public:
	MemoApp();
	~MemoApp();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void hideAllViewsEntry();
	void myInboxScreenEntry();
	void myRecordingsScreenEntry();
	void playRecordingScreenEntry();
	void recordAudioScreenEntry();
	void sendToGroupScreenEntry();
	void signingInScreenEntry();
	void startScreenEntry();

	void myInboxScreenExit();
	void myRecordingsScreenExit();
	void playRecordingScreenExit();
	void recordAudioScreenExit();
	void sendToGroupScreenExit();
	void signingInScreenExit();
	void startScreenExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kGoInbox,
		kGoNewRecording,
		kGoPlay,
		kGoRecordings,
		kGoSendGroup,
		kReady,
		kSignin,
		kSuccess,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kHideAllViews,
		kMyInboxScreen,
		kMyRecordingsScreen,
		kPlayRecordingScreen,
		kRecordAudioScreen,
		kSendToGroupScreen,
		kSigningInScreen,
		kStartScreen,
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

public:
	MemoAppMessage(MemoApp::EventType newEvent, tSubject<const MemoAppMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


