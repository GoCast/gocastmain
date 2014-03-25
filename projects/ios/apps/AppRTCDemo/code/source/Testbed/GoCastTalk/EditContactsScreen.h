#pragma once

@class EditContactsVC;

class EditContactsScreenMessage;

class EditContactsScreen
:   public tMealy,
    public tObserver<const EditContactsScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    EditContactsVC*     mPeer;
    JSONObject          mSetContactsJSON;
    size_t              mItemSelected;
    size_t              mDeleteSelected;

public:
	EditContactsScreen(EditContactsVC* newVC);
	~EditContactsScreen();

    void createPressed();
    void itemPressed(const size_t& i);
    void deletePressed(const size_t& i);
    void refreshPressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void deleteLocalContactEntry();
	void idleEntry();
	void peerPushChangeRegisteredNameEntry();
	void peerPushCreateContactEntry();
	void peerReloadTableEntry();
	void sendForceLogoutToVCEntry();
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
		kCreateSelected,
		kDeleteSelected,
		kExpired,
		kFail,
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
		kPeerPushChangeRegisteredName,
		kPeerPushCreateContact,
		kPeerReloadTable,
		kSendForceLogoutToVC,
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

	void update(const EditContactsScreenMessage& msg);
	void update(const URLLoaderEvent& msg);
	void update(const GCTEvent& msg);
};

class EditContactsScreenMessage
{
public:
	EditContactsScreen::EventType				mEvent;
	tSubject<const EditContactsScreenMessage&>*	mSource;

public:
	EditContactsScreenMessage(EditContactsScreen::EventType newEvent, tSubject<const EditContactsScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


