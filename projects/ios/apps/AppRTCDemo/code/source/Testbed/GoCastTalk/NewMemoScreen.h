#pragma once

@class NewMemoVC;

class NewMemoScreenMessage;

class NewMemoScreen
:   public tMealy,
    public tObserver<const NewMemoScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:
    NewMemoVC*  mPeer;
    JSONArray   mToList;
    std::string mIncomingAppendAddr;

public:
	NewMemoScreen(NewMemoVC* newVC);
	~NewMemoScreen();

    void addContactsPressed();
    void addGroupsPressed();
    void clearPressed();

    void replyPressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void appendToListEntry();
	void clearToListEntry();
	void idleEntry();
	void peerPushContactsEntry();
	void peerPushRecordMessageEntry();
	void peerUpdateToListEntry();
	void showNotYetImplementedEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kAddContactsSelected,
		kAddGroupsSelected,
		kAppendContact,
		kClearSelected,
		kReplySelected,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kAppendToList,
		kClearToList,
		kEnd,
		kIdle,
		kPeerPushContacts,
		kPeerPushRecordMessage,
		kPeerUpdateToList,
		kShowNotYetImplemented,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const NewMemoScreenMessage& msg);
	void update(const GCTEvent& msg);
};

class NewMemoScreenMessage
{
public:
	NewMemoScreen::EventType				mEvent;
	tSubject<const NewMemoScreenMessage&>*	mSource;

public:
	NewMemoScreenMessage(NewMemoScreen::EventType newEvent, tSubject<const NewMemoScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


