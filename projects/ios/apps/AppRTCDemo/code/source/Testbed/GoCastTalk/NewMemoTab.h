#pragma once

#include <queue>

class NewMemoTabMessage;
class GCTEvent;

class NewMemoTab
:   public tMealy,
    public Tab,
    public tObserver<const NewMemoTabMessage&>,
    public tObserver<const GCTEvent&>
{
protected:

public:
	NewMemoTab();
	~NewMemoTab();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void contactsIdleEntry();
	void groupsIdleEntry();
	void newMemoIdleEntry();
	void popWhateverEntry();
	void pushContactsEntry();
	void pushGroupsEntry();
	void pushRecordMessageEntry();
	void recordMessageIdleEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kAddContactsPressed,
		kAddGroupsPressed,
		kItemSelected,
		kPopHappened,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kContactsIdle,
		kEnd,
		kGroupsIdle,
		kNewMemoIdle,
		kPopWhatever,
		kPushContacts,
		kPushGroups,
		kPushRecordMessage,
		kRecordMessageIdle,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const NewMemoTabMessage& msg);
    void update(const GCTEvent& msg);
};

class NewMemoTabMessage
{
public:
	NewMemoTab::EventType				mEvent;
	tSubject<const NewMemoTabMessage&>*	mSource;

public:
	NewMemoTabMessage(NewMemoTab::EventType newEvent, tSubject<const NewMemoTabMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


