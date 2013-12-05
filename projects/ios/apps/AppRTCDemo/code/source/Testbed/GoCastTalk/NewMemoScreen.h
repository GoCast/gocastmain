#pragma once

#include <queue>

class NewMemoScreenMessage;
class GCTEvent;

class NewMemoScreen
:   public tMealy,
    public Screen,
    public tObserver<const NewMemoScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:

public:
	NewMemoScreen();
	~NewMemoScreen();

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

	void update(const NewMemoScreenMessage& msg);
    void update(const GCTEvent& msg);
};

class NewMemoScreenMessage
{
public:
	NewMemoScreen::EventType				mEvent;
	tSubject<const NewMemoScreenMessage&>*	mSource;

public:
	NewMemoScreenMessage(NewMemoScreen::EventType newEvent, tSubject<const NewMemoScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


