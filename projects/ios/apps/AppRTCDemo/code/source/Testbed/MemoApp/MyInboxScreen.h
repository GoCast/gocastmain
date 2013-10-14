#pragma once

class MyInboxScreenMessage;

class MyInboxScreen
:   public tMealy,
    public tObserver<const MyInboxScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public Screen
{
protected:
    std::vector<std::string> mInboxList;
    std::string mListInboxJSON;
    std::string mDeleteFileJSON;
    tUInt32 mItemSelected;

public:
	MyInboxScreen();
	~MyInboxScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void copyDownloadToDestinationEntry();
	void idleEntry();
	void isInboxValidEntry();
	void sendDeleteRequestToServerEntry();
	void sendDownloadRequestToServerEntry();
	void sendGoRecordingsToVCEntry();
	void sendListInboxToServerEntry();
	void serverErrorIdleEntry();
	void setDownloadingStatusEntry();
	void setNormalStatusEntry();
	void showDeleteFailedEntry();
	void showDownloadMessageEntry();
	void showErrorLoadingInboxEntry();
	void showFileWillBeDeletedEntry();
	void showRetryDeleteEntry();
	void showRetryDownloadEntry();
	void showRetryListInboxEntry();
	void showServerErrorEntry();
	void updateInboxTableEntry();
	void wasDeleteSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kItemSelected,
		kNo,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kCopyDownloadToDestination,
		kEnd,
		kIdle,
		kIsInboxValid,
		kSendDeleteRequestToServer,
		kSendDownloadRequestToServer,
		kSendGoRecordingsToVC,
		kSendListInboxToServer,
		kServerErrorIdle,
		kSetDownloadingStatus,
		kSetNormalStatus,
		kShowDeleteFailed,
		kShowDownloadMessage,
		kShowErrorLoadingInbox,
		kShowFileWillBeDeleted,
		kShowRetryDelete,
		kShowRetryDownload,
		kShowRetryListInbox,
		kShowServerError,
		kUpdateInboxTable,
		kWasDeleteSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const MyInboxScreenMessage& msg);
	void update(const MemoEvent& msg);
	void update(const URLLoaderEvent& msg);
};

class MyInboxScreenMessage
{
public:
	MyInboxScreen::EventType				mEvent;
	tSubject<const MyInboxScreenMessage&>*	mSource;

public:
	MyInboxScreenMessage(MyInboxScreen::EventType newEvent, tSubject<const MyInboxScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


