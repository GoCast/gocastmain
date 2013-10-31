#pragma once

class SendToGroupScreenMessage;
class MemoEvent;

class SendToGroupScreen
:   public tMealy,
    public tObserver<const SendToGroupScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public Screen
{
protected:
    JSONArray mEmailListTable;
    JSONArray mUserListTable;
    JSONArray mSelectedGroup;
    JSONObject mUserListJSON;
    JSONObject mPostGroupJSON;
    JSONObject mGetProfileJSON;
    std::string mFilename;
    size_t      mIter;

public:
	SendToGroupScreen(const std::string& newFilename);
	~SendToGroupScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void getSelectedGroupFromUserTableEntry();
	void idleEntry();
	void incrementIEntry();
	void initIToZeroEntry();
	void isGroupEmptyEntry();
	void isILessThanUserListCountEntry();
	void isProfileValidEntry();
	void isUserListValidEntry();
	void reUpdateLocalUserListEntry();
	void sendGetProfileIToServerEntry();
	void sendGoInboxToVCEntry();
	void sendPostGroupToServerEntry();
	void sendUserListToServerEntry();
	void serverErrorIdleEntry();
	void setWaitForGetProfileEntry();
	void setWaitForUserListEntry();
	void showEmptySelectionEntry();
	void showPostGroupFailedEntry();
	void showPostGroupSuccessEntry();
	void showReallySendEntry();
	void showRetryGetProfileEntry();
	void showRetryPostGroupEntry();
	void showRetryUserListEntry();
	void showServerErrorEntry();
	void showUserListEmptyEntry();
	void updateLocalUserListEntry();
	void updateUserListIEntry();
	void wasPostGroupSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kCancel,
		kFail,
		kNo,
		kSend,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kGetSelectedGroupFromUserTable,
		kIdle,
		kIncrementI,
		kInitIToZero,
		kIsGroupEmpty,
		kIsILessThanUserListCount,
		kIsProfileValid,
		kIsUserListValid,
		kReUpdateLocalUserList,
		kSendGetProfileIToServer,
		kSendGoInboxToVC,
		kSendPostGroupToServer,
		kSendUserListToServer,
		kServerErrorIdle,
		kSetWaitForGetProfile,
		kSetWaitForUserList,
		kShowEmptySelection,
		kShowPostGroupFailed,
		kShowPostGroupSuccess,
		kShowReallySend,
		kShowRetryGetProfile,
		kShowRetryPostGroup,
		kShowRetryUserList,
		kShowServerError,
		kShowUserListEmpty,
		kUpdateLocalUserList,
		kUpdateUserListI,
		kWasPostGroupSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const SendToGroupScreenMessage& msg);
	void update(const MemoEvent& msg);
	void update(const URLLoaderEvent& msg);
};

class SendToGroupScreenMessage
{
public:
	SendToGroupScreen::EventType				mEvent;
	tSubject<const SendToGroupScreenMessage&>*	mSource;

public:
	SendToGroupScreenMessage(SendToGroupScreen::EventType newEvent, tSubject<const SendToGroupScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


