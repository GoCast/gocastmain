#pragma once

#include <queue>
#include <stack>

class InboxTabMessage;
class GCTEvent;

class InboxTab
:   public tMealy,
    public Tab,
    public tObserver<const InboxTabMessage&>,
    public tObserver<const GCTEvent&>
{
protected:
    std::stack<int> mViewStack;

public:
	InboxTab();
	~InboxTab();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void inboxIdleEntry();
	void inboxMessageIdleEntry();
	void messageHistoryIdleEntry();
	void popTabEntry();
	void pushInboxMessageEntry();
	void pushMessageHistoryEntry();
	void pushRecordMessageEntry();
	void recordMessageIdleEntry();
	void showConfirmDeleteEntry();
	void whereAreWeOnTheStackEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kDeletePressed,
		kHistoryPressed,
		kInbox,
		kInboxMessage,
		kItemSelected,
		kMessageHistory,
		kNo,
		kPopHappened,
		kRecordMessage,
		kReplyPressed,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kInboxIdle,
		kInboxMessageIdle,
		kMessageHistoryIdle,
		kPopTab,
		kPushInboxMessage,
		kPushMessageHistory,
		kPushRecordMessage,
		kRecordMessageIdle,
		kShowConfirmDelete,
		kWhereAreWeOnTheStack,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const InboxTabMessage& msg);
    void update(const GCTEvent& msg);
};

class InboxTabMessage
{
public:
	InboxTab::EventType				mEvent;
	tSubject<const InboxTabMessage&>*	mSource;

public:
	InboxTabMessage(InboxTab::EventType newEvent, tSubject<const InboxTabMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


