#pragma once

#include <queue>

class EditGroupScreenMessage;

class EditGroupScreen
:   public tMealy,
public tObserver<const EditGroupScreenMessage&>,
public tObserver<const MemoEvent&>,
public tObserver<const URLLoaderEvent&>,
public Screen
{
protected:
    JSONObject          mUserListJSON;
    JSONObject          mGetGroupsJSON;
    JSONObject          mUpdateGroupsJSON;
    std::vector<size_t> mSelectedMembers;
    std::string         mGroupToEdit;
    std::string         mFinalGroupName;
    bool                mIsEditing;

public:
	EditGroupScreen(const std::string& newGroupName, bool newIsEditing);
	~EditGroupScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void calculateSelectionEntry();
	void getSelectedGroupFromMemberTableEntry();
	void idleEntry();
	void sendGetGroupsToServerEntry();
	void sendGoGroupsToVCEntry();
	void sendUpdateGroupsToServerEntry();
	void sendUserListToServerEntry();
	void serverErrorIdleEntry();
	void setWaitForGetGroupsEntry();
	void setWaitForUpdateGroupsEntry();
	void setWaitForUserListEntry();
	void showErrorGettingUserListEntry();
	void showErrorLoadingGroupsEntry();
	void showErrorUpdatingGroupsEntry();
	void showRetryGetGroupsEntry();
	void showRetryUpdateGroupsEntry();
	void showRetryUserListEntry();
	void showWontSaveEntry();
	void updateJSONWithSelectionEntry();
	void updateMemberSelectionEntry();
	void updateMemberTableEntry();
	void wasGetGroupsSuccessfulEntry();
	void wasUpdateGroupsSuccessfulEntry();
	void wasUserListSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kNo,
		kSave,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kCalculateSelection,
		kEnd,
		kGetSelectedGroupFromMemberTable,
		kIdle,
		kSendGetGroupsToServer,
		kSendGoGroupsToVC,
		kSendUpdateGroupsToServer,
		kSendUserListToServer,
		kServerErrorIdle,
		kSetWaitForGetGroups,
		kSetWaitForUpdateGroups,
		kSetWaitForUserList,
		kShowErrorGettingUserList,
		kShowErrorLoadingGroups,
		kShowErrorUpdatingGroups,
		kShowRetryGetGroups,
		kShowRetryUpdateGroups,
		kShowRetryUserList,
		kShowWontSave,
		kUpdateJSONWithSelection,
		kUpdateMemberSelection,
		kUpdateMemberTable,
		kWasGetGroupsSuccessful,
		kWasUpdateGroupsSuccessful,
		kWasUserListSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const EditGroupScreenMessage& msg);
	void update(const MemoEvent& msg);
	void update(const URLLoaderEvent& msg);
};

class EditGroupScreenMessage
{
public:
	EditGroupScreen::EventType				mEvent;
	tSubject<const EditGroupScreenMessage&>*	mSource;

public:
	EditGroupScreenMessage(EditGroupScreen::EventType newEvent, tSubject<const EditGroupScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


