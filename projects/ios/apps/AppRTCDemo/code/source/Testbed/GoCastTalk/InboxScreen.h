#pragma once

#include <queue>

class InboxScreenMessage;
class GCTEvent;

class InboxScreen
:   public tMealy,
    public Screen,
    public tObserver<const InboxScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:

public:
	InboxScreen();
	~InboxScreen();

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

	void update(const InboxScreenMessage& msg);
    void update(const GCTEvent& msg);
};

class InboxScreenMessage
{
public:
	InboxScreen::EventType				mEvent;
	tSubject<const InboxScreenMessage&>*	mSource;

public:
	InboxScreenMessage(InboxScreen::EventType newEvent, tSubject<const InboxScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


