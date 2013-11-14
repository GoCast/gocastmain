#pragma once

#include <queue>

class MyGroupsScreenMessage;

class MyGroupsScreen
:   public tMealy,
    public tObserver<const MyGroupsScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public Screen
{
protected:
    JSONObject                  mGetGroupsJSON;
    JSONObject                  mUpdateGroupsJSON;
    std::vector<std::string>    mGroupList;
    tUInt32                     mItemSelected;
    bool                        mHasSelection;

public:
	MyGroupsScreen();
	~MyGroupsScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void calculateGroupListEntry();
	void idleEntry();
	void isAnItemSelectedEntry();
	void removeSelectedItemFromJSONEntry();
	void sendGetGroupsToServerEntry();
	void sendGoEditGroupForAddToVCEntry();
	void sendGoEditGroupForEditToVCEntry();
	void sendUpdateGroupsToServerEntry();
	void setWaitForGetGroupsEntry();
	void setWaitForUpdateGroupsEntry();
	void showErrorLoadingGroupsEntry();
	void showErrorUpdatingGroupsEntry();
	void showPleaseSelectAnItemEntry();
	void showRetryGetGroupsEntry();
	void showRetryUpdateGroupsEntry();
	void updateGroupsTableEntry();
	void wasGetGroupsSuccessfulEntry();
	void wasUpdateGroupsSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kAdd,
		kEdit,
		kFail,
		kItemDeleted,
		kNo,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kCalculateGroupList,
		kEnd,
		kIdle,
		kIsAnItemSelected,
		kRemoveSelectedItemFromJSON,
		kSendGetGroupsToServer,
		kSendGoEditGroupForAddToVC,
		kSendGoEditGroupForEditToVC,
		kSendUpdateGroupsToServer,
		kSetWaitForGetGroups,
		kSetWaitForUpdateGroups,
		kShowErrorLoadingGroups,
		kShowErrorUpdatingGroups,
		kShowPleaseSelectAnItem,
		kShowRetryGetGroups,
		kShowRetryUpdateGroups,
		kUpdateGroupsTable,
		kWasGetGroupsSuccessful,
		kWasUpdateGroupsSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const MyGroupsScreenMessage& msg);
    void update(const MemoEvent& msg);
    void update(const URLLoaderEvent& msg);
};

class MyGroupsScreenMessage
{
public:
	MyGroupsScreen::EventType				mEvent;
	tSubject<const MyGroupsScreenMessage&>*	mSource;

public:
	MyGroupsScreenMessage(MyGroupsScreen::EventType newEvent, tSubject<const MyGroupsScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


