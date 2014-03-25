#pragma once

@class InboxVC;
class tSound;

class InboxScreenMessage;

class InboxScreen
:   public tMealy,
    public tObserver<const InboxScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>,
    public tObserver<const tTimerEvent&>
{
protected:
    InboxVC*    mPeer;

    JSONObject  mGetContactsJSON;
    JSONObject  mGetGroupsJSON;
    JSONObject  mListMessagesJSON;
    JSONObject  mDeleteMessageJSON;
    tSound*     mNewMessageSound;
    tTimer*     mRefreshTimer;
    size_t      mItemSelected;
    size_t      mDeleteSelected;
    size_t      mPriorUnreadCount;
    bool        mForceLogout;

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

	void addFakeContactsEntry();
	void areThereNewMessagesEntry();
	void clearAllDataAndReloadTableEntry();
	void didWeDownloadContactsEntry();
	void didWeDownloadGroupsEntry();
	void doWeHaveATokenEntry();
	void idleEntry();
	void loadLoginNameAndTokenEntry();
	void peerPushInboxMessageEntry();
	void peerPushLoginScreenEntry();
	void peerReloadTableEntry();
	void peerResetAllTabsEntry();
	void peerSwitchToInboxTabEntry();
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
	void showYourTokenExpiredEntry();
	void sortContactsByKanaEntry();
	void sortGroupsByGroupNameEntry();
	void sortTableByDateEntry();
	void waitForLoginSuccessIdleEntry();
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
		kExpired,
		kFail,
		kForceLogout,
		kItemSelected,
		kLoginSucceeded,
		kNo,
		kRefreshSelected,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kAddFakeContacts,
		kAreThereNewMessages,
		kClearAllDataAndReloadTable,
		kDidWeDownloadContacts,
		kDidWeDownloadGroups,
		kDoWeHaveAToken,
		kEnd,
		kIdle,
		kLoadLoginNameAndToken,
		kPeerPushInboxMessage,
		kPeerPushLoginScreen,
		kPeerReloadTable,
		kPeerResetAllTabs,
		kPeerSwitchToInboxTab,
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
		kShowYourTokenExpired,
		kSortContactsByKana,
		kSortGroupsByGroupName,
		kSortTableByDate,
		kWaitForLoginSuccessIdle,
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
    void update(const tTimerEvent& msg);
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


