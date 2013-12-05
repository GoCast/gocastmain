#pragma once

#include <queue>

class GroupsScreenMessage;
class GCTEvent;

class GroupsScreen
:   public tMealy,
    public Screen,
    public tObserver<const GroupsScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:

public:
	GroupsScreen();
	~GroupsScreen();

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

	void update(const GroupsScreenMessage& msg);
    void update(const GCTEvent& msg);
};

class GroupsScreenMessage
{
public:
	GroupsScreen::EventType				mEvent;
	tSubject<const GroupsScreenMessage&>*	mSource;

public:
	GroupsScreenMessage(GroupsScreen::EventType newEvent, tSubject<const GroupsScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


