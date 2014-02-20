#pragma once

@class ContactsVC;

class ContactsScreenMessage;

class ContactsScreen
:   public tMealy,
    public tObserver<const ContactsScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    ContactsVC* mPeer;
    JSONObject  mSetContactsJSON;
    size_t      mItemSelected;
    size_t      mDeleteSelected;
    void*       mIdentifier;
    bool        mIsChild;

public:
	ContactsScreen(ContactsVC* newVC, bool newIsChild, void* newIdentifier);
	~ContactsScreen();

    void        contactPressed(const size_t& i);
    void        editPressed();
    void        deletePressed(const size_t& i);
    void        refreshPressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void deleteLocalContactEntry();
	void idleEntry();
	void isThisAChildScreenEntry();
	void peerPopSelfEntry();
	void peerPushChangeRegisteredNameEntry();
	void peerPushEditContactsEntry();
	void peerReloadTableEntry();
	void sendAppendNewContactToVCEntry();
	void sendReloadInboxToVCEntry();
	void sendSetContactsToServerEntry();
	void setWaitForSetContactsEntry();
	void showErrorWithSetContactsEntry();
	void wasSetContactsSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kDeleteSelected,
		kFail,
		kHelpPressed,
		kItemSelected,
		kNo,
		kRefreshSelected,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kDeleteLocalContact,
		kEnd,
		kIdle,
		kIsThisAChildScreen,
		kPeerPopSelf,
		kPeerPushChangeRegisteredName,
		kPeerPushEditContacts,
		kPeerReloadTable,
		kSendAppendNewContactToVC,
		kSendReloadInboxToVC,
		kSendSetContactsToServer,
		kSetWaitForSetContacts,
		kShowErrorWithSetContacts,
		kWasSetContactsSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const ContactsScreenMessage& msg);
	void update(const URLLoaderEvent& msg);
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


