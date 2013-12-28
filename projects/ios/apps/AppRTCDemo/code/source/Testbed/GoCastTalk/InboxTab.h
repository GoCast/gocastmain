#pragma once

#include <queue>

class InboxTabMessage;
class GCTEvent;

class InboxTab
:   public tMealy,
    public Tab,
    public tObserver<const InboxTabMessage&>,
    public tObserver<const GCTEvent&>
{
protected:
    bool mCameFromMessageHistory;

public:
	InboxTab();
	~InboxTab();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void didWeComeFromMessageHistoryEntry();
	void inboxIdleEntry();
	void inboxMessageIdleEntry();
	void messageHistoryIdleEntry();
	void popIfWeCameFromMessageHistoryEntry();
	void popInboxMessageEntry();
	void popRecordMessageEntry();
	void pushInboxMessageEntry();
	void pushMessageHistoryEntry();
	void pushRecordMessageEntry();
	void recordMessageIdleEntry();
	void showConfirmDeleteEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kDeletePressed,
		kHistoryPressed,
		kItemSelected,
		kNo,
		kPopHappened,
		kReplyPressed,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kDidWeComeFromMessageHistory,
		kEnd,
		kInboxIdle,
		kInboxMessageIdle,
		kMessageHistoryIdle,
		kPopIfWeCameFromMessageHistory,
		kPopInboxMessage,
		kPopRecordMessage,
		kPushInboxMessage,
		kPushMessageHistory,
		kPushRecordMessage,
		kRecordMessageIdle,
		kShowConfirmDelete,
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


