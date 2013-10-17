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
    std::vector<std::string> mLocalFileList;
    std::vector<std::string> mServerFileList;
    std::vector<std::string> mMergedFileList;

    std::string mListInboxJSON;
    tUInt32 mItemSelected;

public:
	MyInboxScreen();
	~MyInboxScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void calculateMergedFilesEntry();
	void copyDownloadToLocalFilesEntry();
	void doesSelectedItemExistLocallyEntry();
	void idleEntry();
	void makeListOfLocalFilesEntry();
	void sendDownloadRequestToServerEntry();
	void sendGoPlayToVCEntry();
	void sendListInboxToServerEntry();
	void serverErrorIdleEntry();
	void setWaitForDownloadEntry();
	void setWaitForListInboxEntry();
	void showErrorLoadingInboxEntry();
	void showRetryDownloadEntry();
	void showRetryListInboxEntry();
	void showServerErrorEntry();
	void storeListOfServerFilesEntry();
	void updateMergedTableEntry();
	void wasListInboxValidEntry();

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
		kCalculateMergedFiles,
		kCopyDownloadToLocalFiles,
		kDoesSelectedItemExistLocally,
		kEnd,
		kIdle,
		kMakeListOfLocalFiles,
		kSendDownloadRequestToServer,
		kSendGoPlayToVC,
		kSendListInboxToServer,
		kServerErrorIdle,
		kSetWaitForDownload,
		kSetWaitForListInbox,
		kShowErrorLoadingInbox,
		kShowRetryDownload,
		kShowRetryListInbox,
		kShowServerError,
		kStoreListOfServerFiles,
		kUpdateMergedTable,
		kWasListInboxValid,
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


