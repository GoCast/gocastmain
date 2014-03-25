#pragma once

@class CreateContactVC;

class CreateContactScreenMessage;

class CreateContactScreen
:   public tMealy,
    public tObserver<const CreateContactScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    CreateContactVC* mPeer;
    JSONObject              mSaveObject;
    JSONObject              mSetContactsJSON;

public:
	CreateContactScreen(CreateContactVC* newVC);
	~CreateContactScreen();

    void savePressed(const JSONObject& saveObject);

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void addToContactsEntry();
	void idleEntry();
	void peerPopSelfEntry();
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
		kExpired,
		kFail,
		kNo,
		kSaveSelected,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kAddToContacts,
		kEnd,
		kIdle,
		kPeerPopSelf,
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

	void update(const CreateContactScreenMessage& msg);
    void update(const URLLoaderEvent& msg);
    void update(const GCTEvent& msg);
};

class CreateContactScreenMessage
{
public:
	CreateContactScreen::EventType				mEvent;
	tSubject<const CreateContactScreenMessage&>*	mSource;

public:
	CreateContactScreenMessage(CreateContactScreen::EventType newEvent, tSubject<const CreateContactScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


