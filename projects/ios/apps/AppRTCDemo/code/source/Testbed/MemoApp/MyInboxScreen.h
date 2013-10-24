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
    std::string mDeleteFileJSON;
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
	void deleteLocalFileEntry();
	void doesDeletedItemExistLocallyEntry();
	void doesFileExistOnServerEntry();
	void doesSelectedItemExistLocallyEntry();
	void idleEntry();
	void makeListOfLocalFilesEntry();
	void removeFileFromLocalAndServerListsEntry();
	void sendDeleteRequestToServerEntry();
	void sendDownloadRequestToServerEntry();
	void sendGoPlayToVCEntry();
	void sendListInboxToServerEntry();
	void serverErrorIdleEntry();
	void setWaitForDeleteEntry();
	void setWaitForDownloadEntry();
	void setWaitForListInboxEntry();
	void showDeleteFailedEntry();
	void showErrorLoadingInboxEntry();
	void showRetryDeleteEntry();
	void showRetryDownloadEntry();
	void showRetryListInboxEntry();
	void showServerErrorEntry();
	void storeListOfServerFilesEntry();
	void updateMergedTableEntry();
	void wasDeleteSuccessfulEntry();
	void wasListInboxValidEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kItemDeleted,
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
		kDeleteLocalFile,
		kDoesDeletedItemExistLocally,
		kDoesFileExistOnServer,
		kDoesSelectedItemExistLocally,
		kEnd,
		kIdle,
		kMakeListOfLocalFiles,
		kRemoveFileFromLocalAndServerLists,
		kSendDeleteRequestToServer,
		kSendDownloadRequestToServer,
		kSendGoPlayToVC,
		kSendListInboxToServer,
		kServerErrorIdle,
		kSetWaitForDelete,
		kSetWaitForDownload,
		kSetWaitForListInbox,
		kShowDeleteFailed,
		kShowErrorLoadingInbox,
		kShowRetryDelete,
		kShowRetryDownload,
		kShowRetryListInbox,
		kShowServerError,
		kStoreListOfServerFiles,
		kUpdateMergedTable,
		kWasDeleteSuccessful,
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


