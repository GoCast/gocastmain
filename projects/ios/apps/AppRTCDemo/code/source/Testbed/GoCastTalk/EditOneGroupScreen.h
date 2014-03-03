#pragma once

@class EditOneGroupVC;

class EditOneGroupScreenMessage;

class EditOneGroupScreen
:   public tMealy,
    public tObserver<const EditOneGroupScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    EditOneGroupVC*     mPeer;
    JSONObject          mInitObject;
    JSONObject          mSetGroupsJSON;
    std::vector<bool>   mIsChecked;
    std::string         mNewName;

public:
	EditOneGroupScreen(EditOneGroupVC* newVC, const JSONObject& initObject);
	~EditOneGroupScreen();

    void pressDone(const std::string& newName);
    bool isChecked(const size_t& i);
    void contactPressed(const size_t& i);

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void areAnyMembersSelectedEntry();
	void calculateChecksEntry();
	void deleteOldLocalGroupEntry();
	void idleEntry();
	void isNewNameEmptyEntry();
	void peerPopSelfEntry();
	void sendReloadInboxToVCEntry();
	void sendSetGroupsToServerEntry();
	void setWaitForSetGroupsEntry();
	void showErrorWithSetGroupsEntry();
	void showMustSelectMembersEntry();
	void showNameCantBeEmptyEntry();
	void wasSetGroupsSuccessfulEntry();
	void writeNewLocalGroupEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kDonePressed,
		kFail,
		kNo,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kAreAnyMembersSelected,
		kCalculateChecks,
		kDeleteOldLocalGroup,
		kEnd,
		kIdle,
		kIsNewNameEmpty,
		kPeerPopSelf,
		kSendReloadInboxToVC,
		kSendSetGroupsToServer,
		kSetWaitForSetGroups,
		kShowErrorWithSetGroups,
		kShowMustSelectMembers,
		kShowNameCantBeEmpty,
		kWasSetGroupsSuccessful,
		kWriteNewLocalGroup,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const EditOneGroupScreenMessage& msg);
	void update(const URLLoaderEvent& msg);
	void update(const GCTEvent& msg);
};

class EditOneGroupScreenMessage
{
public:
	EditOneGroupScreen::EventType				mEvent;
	tSubject<const EditOneGroupScreenMessage&>*	mSource;

public:
	EditOneGroupScreenMessage(EditOneGroupScreen::EventType newEvent, tSubject<const EditOneGroupScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


