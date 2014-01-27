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
    bool        mIsChild;

public:
	ContactsScreen(ContactsVC* newVC, bool newIsChild);
	~ContactsScreen();

    void        itemPressed(const size_t& i);
    void        editPressed();
    void        refreshPressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void isThisAChildScreenEntry();
	void peerPopSelfEntry();
	void peerPushEditContactsEntry();
	void peerReloadTableEntry();
	void sendAppendNewContactToVCEntry();
	void showNotImplementedYetEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kHelpPressed,
		kItemSelected,
		kNo,
		kRefreshSelected,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kIsThisAChildScreen,
		kPeerPopSelf,
		kPeerPushEditContacts,
		kPeerReloadTable,
		kSendAppendNewContactToVC,
		kShowNotImplementedYet,
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


