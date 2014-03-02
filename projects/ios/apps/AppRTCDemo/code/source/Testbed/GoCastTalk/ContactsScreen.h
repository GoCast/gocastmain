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
    JSONObject  mSetGroupsJSON;
    size_t      mItemSelected;
    size_t      mDeleteSelected;
    void*       mIdentifier;
    bool        mIsChild;

public:
	ContactsScreen(ContactsVC* newVC, bool newIsChild, void* newIdentifier);
	~ContactsScreen();

    void        contactPressed(const size_t& i);
    void        groupPressed(const size_t& i);
    void        editContactsPressed();
    void        editGroupsPressed();
    void        deleteContactPressed(const size_t& i);
    void        deleteGroupPressed(const size_t& i);
    void        refreshPressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void deleteLocalContactEntry();
	void deleteLocalGroupEntry();
	void idleEntry();
	void isThisAChildScreenEntry();
	void peerPopSelfEntry();
	void peerPushChangeRegisteredNameEntry();
	void peerPushEditContactsEntry();
	void peerReloadTableEntry();
	void sendAppendNewContactToVCEntry();
	void sendReloadInboxToVCEntry();
	void sendSetContactsToServerEntry();
	void sendSetGroupsToServerEntry();
	void setWaitForSetContactsEntry();
	void setWaitForSetGroupsEntry();
	void showErrorWithSetContactsEntry();
	void showErrorWithSetGroupsEntry();
	void showNotYetImplementedEntry();
	void wasSetContactsSuccessfulEntry();
	void wasSetGroupsSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kContactSelected,
		kDeleteContact,
		kDeleteGroup,
		kEditContactsPressed,
		kEditGroupsPressed,
		kFail,
		kGroupSelected,
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
		kDeleteLocalGroup,
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
		kSendSetGroupsToServer,
		kSetWaitForSetContacts,
		kSetWaitForSetGroups,
		kShowErrorWithSetContacts,
		kShowErrorWithSetGroups,
		kShowNotYetImplemented,
		kWasSetContactsSuccessful,
		kWasSetGroupsSuccessful,
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


