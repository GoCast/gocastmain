#pragma once

@class ContactsVC;

class ContactsScreenMessage;

class ContactsScreen
:   public tMealy,
    public tObserver<const ContactsScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:
    ContactsVC* mPeer;
    size_t      mItemSelected;

public:
	ContactsScreen(ContactsVC* newVC);
	~ContactsScreen();

    void        itemPressed(const size_t& i);
    void        editPressed();
    void        refreshPressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void peerPushContactDetailsEntry();
	void peerPushEditContactsEntry();
	void peerReloadTableEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kHelpPressed,
		kItemSelected,
		kRefreshSelected,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kPeerPushContactDetails,
		kPeerPushEditContacts,
		kPeerReloadTable,
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


