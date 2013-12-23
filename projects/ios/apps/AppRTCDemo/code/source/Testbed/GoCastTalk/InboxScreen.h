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

	void inboxIdleEntry();
	void inboxMessageIdleEntry();
	void messageHistoryIdleEntry();
	void popInboxMessageEntry();
	void popMessageHistoryEntry();
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
		kPopInboxMessage,
		kPopMessageHistory,
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


