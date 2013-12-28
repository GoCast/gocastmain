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
    bool mCameFromMessageHistory;

public:
	InboxScreen();
	~InboxScreen();

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


