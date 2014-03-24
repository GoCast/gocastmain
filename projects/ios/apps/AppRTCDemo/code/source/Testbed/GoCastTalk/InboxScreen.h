#pragma once

@class InboxVC;
class tSound;

class InboxScreenMessage;

class InboxScreen
:   public tMealy,
    public tObserver<const InboxScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    InboxVC*    mPeer;

    JSONObject  mGetContactsJSON;
    JSONObject  mGetGroupsJSON;
    JSONObject  mListMessagesJSON;
    JSONObject  mDeleteMessageJSON;
    tSound*     mNewMessageSound;
    size_t      mItemSelected;
    size_t      mDeleteSelected;
    size_t      mPriorUnreadCount;

public:
    static JSONArray    mInbox;
    static JSONArray    mContacts;
    static JSONArray    mGroups;
    static std::string  mEmailAddress;
    static std::string  mToken;

public:
    static std::string getGmtString();
    static std::string gmtToLocal(const std::string& gmtTime);
    static std::string nameFromEmail(const std::string& email);

public:
	InboxScreen(InboxVC* newVC);
	~InboxScreen();

    size_t      getInboxSize();

    std::string getFrom(const size_t& i);
    std::string getDate(const size_t& i);
    std::string getTranscription(const size_t& i);
    bool        getIsReceive(const size_t& i);
    bool        getIsGroup(const size_t& i);
    bool        getIsRead(const size_t& i);

    void        selectItem(const size_t& i);

    void        refreshPressed();
    void        deletePressed(const size_t& i);

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void areThereNewMessagesEntry();
	void clearInboxEntry();
	void didWeDownloadContactsEntry();
	void didWeDownloadGroupsEntry();
	void doWeHaveATokenEntry();
	void idleEntry();
	void peerPushInboxMessageEntry();
	void peerReloadTableEntry();
	void playNewMessageSoundEntry();
	void sendDeleteMessageToServerEntry();
	void sendGetContactsToServerEntry();
	void sendGetGroupsToServerEntry();
	void sendListMessagesToServerEntry();
	void setWaitForDeleteMessageEntry();
	void setWaitForGetContactsEntry();
	void setWaitForGetGroupsEntry();
	void setWaitForListMessagesEntry();
	void showErrorDeletingMessageEntry();
	void showErrorLoadingContactsEntry();
	void showErrorLoadingGroupsEntry();
	void showErrorLoadingInboxEntry();
	void showRetryListMessagesEntry();
	void sortTableByDateEntry();
	void wasDeleteMessageValidEntry();
	void wasGetContactsValidEntry();
	void wasGetGroupsValidEntry();
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
		kAreThereNewMessages,
		kClearInbox,
		kDidWeDownloadContacts,
		kDidWeDownloadGroups,
		kDoWeHaveAToken,
		kEnd,
		kIdle,
		kPeerPushInboxMessage,
		kPeerReloadTable,
		kPlayNewMessageSound,
		kSendDeleteMessageToServer,
		kSendGetContactsToServer,
		kSendGetGroupsToServer,
		kSendListMessagesToServer,
		kSetWaitForDeleteMessage,
		kSetWaitForGetContacts,
		kSetWaitForGetGroups,
		kSetWaitForListMessages,
		kShowErrorDeletingMessage,
		kShowErrorLoadingContacts,
		kShowErrorLoadingGroups,
		kShowErrorLoadingInbox,
		kShowRetryListMessages,
		kSortTableByDate,
		kWasDeleteMessageValid,
		kWasGetContactsValid,
		kWasGetGroupsValid,
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


