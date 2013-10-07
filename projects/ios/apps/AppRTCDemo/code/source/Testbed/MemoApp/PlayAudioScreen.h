#pragma once

#include <queue>

class PlayAudioScreenMessage;
class MemoEvent;

class PlayAudioScreen
:   public tMealy,
    public tObserver<const PlayAudioScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public Screen
{
protected:

public:
	PlayAudioScreen();
	~PlayAudioScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void playingIdleEntry();
	void sendGoInboxToVCEntry();
	void sendGoSendGroupToVCEntry();
	void showConfirmDeleteEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kCancel,
		kDelete,
		kNo,
		kPlay,
		kSend,
		kStop,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kPlayingIdle,
		kSendGoInboxToVC,
		kSendGoSendGroupToVC,
		kShowConfirmDelete,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const PlayAudioScreenMessage& msg);
	void update(const MemoEvent& msg);
};

class PlayAudioScreenMessage
{
public:
	PlayAudioScreen::EventType				mEvent;
	tSubject<const PlayAudioScreenMessage&>*	mSource;

public:
	PlayAudioScreenMessage(PlayAudioScreen::EventType newEvent, tSubject<const PlayAudioScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


