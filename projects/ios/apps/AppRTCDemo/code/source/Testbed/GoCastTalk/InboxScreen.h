#pragma once

@class InboxVC;

class InboxScreenMessage;

class InboxScreen
:   public tMealy,
    public tObserver<const InboxScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    InboxVC* mPeer;

    JSONObject  mListMessagesJSON;
    JSONObject  mDeleteMessageJSON;
    size_t      mItemSelected;
    size_t      mDeleteSelected;

public:
    static JSONArray mInbox;

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

    void        refreshPressed();
    void        deletePressed(const size_t& i);

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void peerPushInboxMessageEntry();
	void peerReloadTableEntry();
	void sendDeleteMessageToServerEntry();
	void sendListMessagesToServerEntry();
	void setWaitForDeleteMessageEntry();
	void setWaitForListMessagesEntry();
	void showErrorDeletingMessageEntry();
	void showErrorLoadingInboxEntry();
	void showRetryListMessagesEntry();
	void wasDeleteMessageValidEntry();
	void wasListMessagesValidEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kDeleteSelected,
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
		kSendDeleteMessageToServer,
		kSendListMessagesToServer,
		kSetWaitForDeleteMessage,
		kSetWaitForListMessages,
		kShowErrorDeletingMessage,
		kShowErrorLoadingInbox,
		kShowRetryListMessages,
		kWasDeleteMessageValid,
		kWasListMessagesValid,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const InboxScreenMessage& msg);
    void update(const URLLoaderEvent& msg);
    void update(const GCTEvent& msg);
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


