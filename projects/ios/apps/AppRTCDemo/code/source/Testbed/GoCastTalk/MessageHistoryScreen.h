#pragma once

@class MessageHistoryVC;

class MessageHistoryScreenMessage;

class MessageHistoryScreen
:   public tMealy,
    public tObserver<const MessageHistoryScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:
    MessageHistoryVC*   mPeer;
    JSONObject          mInitObject;
    JSONArray           mHistory;
    size_t              mItemSelected;

public:
	MessageHistoryScreen(MessageHistoryVC* newVC, const JSONObject& initObject);
	~MessageHistoryScreen();

    void replyPressed();
    void selectItem(const size_t& i);

    size_t      getInboxSize();

    std::string getFrom(const size_t& i);
    std::string getDate(const size_t& i);
    std::string getTranscription(const size_t& i);
    bool        getIsReceive(const size_t& i);
    bool        getIsGroup(const size_t& i);

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void buildMessageHistoryEntry();
	void idleEntry();
	void peerPushInboxMessageEntry();
	void peerPushRecordMessageEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kItemSelected,
		kReplySelected,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kBuildMessageHistory,
		kEnd,
		kIdle,
		kPeerPushInboxMessage,
		kPeerPushRecordMessage,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const MessageHistoryScreenMessage& msg);
	void update(const GCTEvent& msg);
};

class MessageHistoryScreenMessage
{
public:
	MessageHistoryScreen::EventType				mEvent;
	tSubject<const MessageHistoryScreenMessage&>*	mSource;

public:
	MessageHistoryScreenMessage(MessageHistoryScreen::EventType newEvent, tSubject<const MessageHistoryScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


