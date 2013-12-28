#pragma once

#include <queue>

class ContactsTabMessage;
class GCTEvent;

class ContactsTab
:   public tMealy,
    public Tab,
    public tObserver<const ContactsTabMessage&>,
    public tObserver<const GCTEvent&>
{
protected:

public:
	ContactsTab();
	~ContactsTab();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void changeRegisteredNameViewEntry();
	void contactDetailsViewEntry();
	void contactsViewEntry();
	void editContactsViewEntry();
	void messageHistoryViewEntry();
	void recordMessageViewEntry();

	void changeRegisteredNameViewExit();
	void contactDetailsViewExit();
	void contactsViewExit();
	void editContactsViewExit();
	void messageHistoryViewExit();
	void recordMessageViewExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kDonePressed,
		kEditPressed,
		kHistoryPressed,
		kItemSelected,
		kReplyPressed,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kChangeRegisteredNameView,
		kContactDetailsView,
		kContactsView,
		kEditContactsView,
		kEnd,
		kMessageHistoryView,
		kRecordMessageView,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const ContactsTabMessage& msg);
    void update(const GCTEvent& msg);
};

class ContactsTabMessage
{
public:
	ContactsTab::EventType				mEvent;
	tSubject<const ContactsTabMessage&>*	mSource;

public:
	ContactsTabMessage(ContactsTab::EventType newEvent, tSubject<const ContactsTabMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


