#pragma once

#include <queue>

class ContactsScreenMessage;
class GCTEvent;

class ContactsScreen
:   public tMealy,
    public Screen,
    public tObserver<const ContactsScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:

public:
	ContactsScreen();
	~ContactsScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void contactDetailsViewEntry();
	void contactsViewEntry();
	void messageHistoryViewEntry();
	void recordMessageViewEntry();

	void contactDetailsViewExit();
	void contactsViewExit();
	void messageHistoryViewExit();
	void recordMessageViewExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kHistoryPressed,
		kItemSelected,
		kReplyPressed,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kContactDetailsView,
		kContactsView,
		kEnd,
		kMessageHistoryView,
		kRecordMessageView,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const ContactsScreenMessage& msg);
    void update(const GCTEvent& msg);
};

class ContactsScreenMessage
{
public:
	ContactsScreen::EventType				mEvent;
	tSubject<const ContactsScreenMessage&>*	mSource;

public:
	ContactsScreenMessage(ContactsScreen::EventType newEvent, tSubject<const ContactsScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


