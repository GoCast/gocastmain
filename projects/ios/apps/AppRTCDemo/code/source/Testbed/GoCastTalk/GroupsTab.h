#pragma once

#include <queue>

class GroupsTabMessage;
class GCTEvent;

class GroupsTab
:   public tMealy,
    public Tab,
    public tObserver<const GroupsTabMessage&>,
    public tObserver<const GCTEvent&>
{
protected:

public:
	GroupsTab();
	~GroupsTab();

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

	void update(const GroupsTabMessage& msg);
    void update(const GCTEvent& msg);
};

class GroupsTabMessage
{
public:
	GroupsTab::EventType				mEvent;
	tSubject<const GroupsTabMessage&>*	mSource;

public:
	GroupsTabMessage(GroupsTab::EventType newEvent, tSubject<const GroupsTabMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


