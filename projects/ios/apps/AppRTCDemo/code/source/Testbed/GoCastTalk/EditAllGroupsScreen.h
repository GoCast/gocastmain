#pragma once

@class EditAllGroupsVC;

class EditAllGroupsScreenMessage;

class EditAllGroupsScreen
:   public tMealy,
    public tObserver<const EditAllGroupsScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    EditAllGroupsVC* mPeer;
    JSONObject  mSetGroupsJSON;
    size_t      mItemSelected;
    size_t      mDeleteSelected;

public:
	EditAllGroupsScreen(EditAllGroupsVC* newVC);
	~EditAllGroupsScreen();

    void pressCreate();
    void groupPressed(const size_t& i);
    void deleteGroupPressed(const size_t& i);
    void refreshPressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void deleteLocalGroupEntry();
	void idleEntry();
	void peerReloadTableEntry();
	void sendReloadInboxToVCEntry();
	void sendSetGroupsToServerEntry();
	void setWaitForSetGroupsEntry();
	void showErrorWithSetGroupsEntry();
	void showNotYetImplementedEntry();
	void wasSetGroupsSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kCreatePressed,
		kDeleteGroup,
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
		kDeleteLocalGroup,
		kEnd,
		kIdle,
		kPeerReloadTable,
		kSendReloadInboxToVC,
		kSendSetGroupsToServer,
		kSetWaitForSetGroups,
		kShowErrorWithSetGroups,
		kShowNotYetImplemented,
		kWasSetGroupsSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const EditAllGroupsScreenMessage& msg);
	void update(const URLLoaderEvent& msg);
	void update(const GCTEvent& msg);
};

class EditAllGroupsScreenMessage
{
public:
	EditAllGroupsScreen::EventType				mEvent;
	tSubject<const EditAllGroupsScreenMessage&>*	mSource;

public:
	EditAllGroupsScreenMessage(EditAllGroupsScreen::EventType newEvent, tSubject<const EditAllGroupsScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


