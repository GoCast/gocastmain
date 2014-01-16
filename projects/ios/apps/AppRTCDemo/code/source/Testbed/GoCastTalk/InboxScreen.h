#pragma once

@class InboxVC;

class InboxScreenMessage;

class InboxScreen
:   public tMealy,
    public tObserver<const InboxScreenMessage&>,
    public tObserver<const URLLoaderEvent&>
{
protected:
    InboxVC* mPeer;

    JSONObject  mListMessagesJSON;
    size_t      mItemSelected;

public:
	InboxScreen(InboxVC* newVC);
	~InboxScreen();

    size_t      getInboxSize();

    std::string getFrom(const size_t& i);
    std::string getDate(const size_t& i);
    std::string getTranscription(const size_t& i);
    bool        getIsReceive(const size_t& i);
    bool        getIsGroup(const size_t& i);

    void        selectItem(const size_t& i);

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void peerPushInboxMessageEntry();
	void peerReloadTableEntry();
	void sendListMessagesToServerEntry();
	void setWaitForListMessagesEntry();
	void showErrorLoadingInboxEntry();
	void showRetryListMessagesEntry();
	void wasListMessagesValidEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
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
		kEnd,
		kIdle,
		kPeerPushInboxMessage,
		kPeerReloadTable,
		kSendListMessagesToServer,
		kSetWaitForListMessages,
		kShowErrorLoadingInbox,
		kShowRetryListMessages,
		kWasListMessagesValid,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const InboxScreenMessage& msg);
    void update(const URLLoaderEvent& msg);
};

class InboxScreenMessage
{
public:
	InboxScreen::EventType				mEvent;
	tSubject<const InboxScreenMessage&>*	mSource;

public:
	InboxScreenMessage(InboxScreen::EventType newEvent, tSubject<const InboxScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


