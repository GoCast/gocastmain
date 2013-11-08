#pragma once

#include <queue>

class MyGroupsScreenMessage;

class MyGroupsScreen
:   public tMealy,
    public tObserver<const MyGroupsScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public Screen
{
protected:

public:
	MyGroupsScreen();
	~MyGroupsScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void sendGoEditGroupToVCEntry();
	void showReallyDeleteEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kAdd,
		kDelete,
		kEdit,
		kNo,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kSendGoEditGroupToVC,
		kShowReallyDelete,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const MyGroupsScreenMessage& msg);
    void update(const MemoEvent& msg);
    void update(const URLLoaderEvent& msg);
};

class MyGroupsScreenMessage
{
public:
	MyGroupsScreen::EventType				mEvent;
	tSubject<const MyGroupsScreenMessage&>*	mSource;

public:
	MyGroupsScreenMessage(MyGroupsScreen::EventType newEvent, tSubject<const MyGroupsScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


