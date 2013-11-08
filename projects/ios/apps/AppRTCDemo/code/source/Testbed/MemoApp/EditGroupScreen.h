#pragma once

#include <queue>

class EditGroupScreenMessage;

class EditGroupScreen
:   public tMealy,
public tObserver<const EditGroupScreenMessage&>,
public tObserver<const MemoEvent&>,
public tObserver<const URLLoaderEvent&>,
public Screen
{
protected:

public:
	EditGroupScreen();
	~EditGroupScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const EditGroupScreenMessage& msg);
	void update(const MemoEvent& msg);
	void update(const URLLoaderEvent& msg);
};

class EditGroupScreenMessage
{
public:
	EditGroupScreen::EventType				mEvent;
	tSubject<const EditGroupScreenMessage&>*	mSource;

public:
	EditGroupScreenMessage(EditGroupScreen::EventType newEvent, tSubject<const EditGroupScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


