#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
EditGroupScreen::EditGroupScreen(const std::string& newGroupName, bool newIsEditing)
:   mGroupToEdit(newGroupName),
    mIsEditing(newIsEditing)
{
	ConstructMachine();
}

EditGroupScreen::~EditGroupScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void EditGroupScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    [gAppDelegateInstance setEditGroupScreenVisible:true];
    [gAppDelegateInstance setNavigationBarTitle:"Edit Group"];
}

void EditGroupScreen::endEntry()
{
    [gAppDelegateInstance setEditGroupScreenVisible:false];
}

void EditGroupScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

void EditGroupScreen::idleEntry()
{
}

void EditGroupScreen::serverErrorIdleEntry()
{
}

#pragma mark Queries
void EditGroupScreen::wasGetGroupsSuccessfulEntry()
{
    bool result = mGetGroupsJSON["status"].mString == std::string("success");

    SetImmediateEvent(result ? kYes : kNo);
}

void EditGroupScreen::wasUpdateGroupsSuccessfulEntry()
{
    bool result = mUpdateGroupsJSON["status"].mString == std::string("success");

    SetImmediateEvent(result ? kYes : kNo);
}

void EditGroupScreen::wasUserListSuccessfulEntry()
{
    bool result = mUserListJSON["status"].mString == std::string("success");

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void EditGroupScreen::sendGetGroupsToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=getGroups&name=%s",
            kMemoAppServerURL,
            std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt")).c_str());

    URLLoader::getInstance()->loadString(buf);
}

void EditGroupScreen::sendUpdateGroupsToServerEntry()
{
    tFile tempProfile(tFile::kTemporaryDirectory, "groups.json");

    if (mGetGroupsJSON.find("status") != mGetGroupsJSON.end())
    {
        mGetGroupsJSON.erase(mGetGroupsJSON.find("status"));
    }

    tempProfile.write(JSONValue(mGetGroupsJSON).toString());

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "updateGroups"));
    params.push_back(std::pair<std::string, std::string>("name", std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt"))));

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "1048576"));

    URLLoader::getInstance()->postFile(kMemoAppServerURL, params, tempProfile);
}

void EditGroupScreen::sendUserListToServerEntry()
{
    URLLoader::getInstance()->loadString(kMemoAppServerURL"?action=userList");
}

void EditGroupScreen::getSelectedGroupFromMemberTableEntry()
{
    mSelectedMembers = [gAppDelegateInstance getSelectedFromMemberListTable];
}

void EditGroupScreen::calculateSelectionEntry()
{
    JSONArray *list1, *list2;

    list1 = &mUserListJSON["list"].mArray;
    list2 = NULL;

    for(size_t i = 0; i < mGetGroupsJSON["groups"].mArray.size(); i++)
    {
        if (mGroupToEdit == mGetGroupsJSON["groups"].mArray[i].mObject["name"].mString)
        {
            list2 = &mGetGroupsJSON["groups"].mArray[i].mObject["list"].mArray;
            break;
        }
    }

    mSelectedMembers.clear();
    if (list2)
    {
        for(size_t i = 0; i < list1->size(); i++)
        {
            for(size_t j = 0; j < list2->size(); j++)
            {
                if ((*list1)[i] == (*list2)[j])
                {
                    mSelectedMembers.push_back(i);
                }
            }
        }
    }
}

void EditGroupScreen::updateMemberTableEntry()
{
    [gAppDelegateInstance setGroupName:mGroupToEdit];
    [gAppDelegateInstance setMemberListTable:mUserListJSON["list"].mArray];
}

void EditGroupScreen::updateMemberSelectionEntry()
{
    [gAppDelegateInstance setSelectedInMemberListTable:mSelectedMembers];
}

void EditGroupScreen::updateJSONWithSelectionEntry()
{
    if (mIsEditing)
    {
        for(size_t i = 0; i < mGetGroupsJSON["groups"].mArray.size(); i++)
        {
            if (mGroupToEdit == mGetGroupsJSON["groups"].mArray[i].mObject["name"].mString)
            {
                mGetGroupsJSON["groups"].mArray.erase(mGetGroupsJSON["groups"].mArray.begin() + (int)i);
                break;
            }
        }
    }

    if (!mSelectedMembers.empty())
    {
        JSONObject obj;
        obj["name"] = ([gAppDelegateInstance getGroupName] == "") ? mGroupToEdit : [gAppDelegateInstance getGroupName];
        obj["list"] = JSONArray();

        for(size_t i = 0; i < mSelectedMembers.size(); i++)
        {
            obj["list"].mArray.push_back(mUserListJSON["list"].mArray[mSelectedMembers[i]].mString);
        }

        mGetGroupsJSON["groups"].mArray.push_back(obj);
    }
}

#pragma mark User Interface
void EditGroupScreen::setWaitForGetGroupsEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void EditGroupScreen::setWaitForUpdateGroupsEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void EditGroupScreen::setWaitForUserListEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void EditGroupScreen::showErrorGettingUserListEntry()
{
    tAlert("Error getting user list");
}

void EditGroupScreen::showErrorLoadingGroupsEntry()
{
    tAlert("Error loading group");
}

void EditGroupScreen::showErrorUpdatingGroupsEntry()
{
    tAlert("Error updating group");
}

void EditGroupScreen::showRetryGetGroupsEntry()
{
    tConfirm("Couldn't contact server, retry getting get groups?");
}

void EditGroupScreen::showRetryUpdateGroupsEntry()
{
    tConfirm("Couldn't contact server, retry getting update groups?");
}

void EditGroupScreen::showRetryUserListEntry()
{
    tConfirm("Couldn't contact server, retry getting user list?");
}

void EditGroupScreen::showWontSaveEntry()
{
    tAlert("There was an error, no changes will be saved.");
}

#pragma mark Sending messages to other machines
void EditGroupScreen::sendGoGroupsToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoGroups));
}

#pragma mark State wiring
void EditGroupScreen::CallEntry()
{
	switch(mState)
	{
		case kCalculateSelection: calculateSelectionEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kGetSelectedGroupFromMemberTable: getSelectedGroupFromMemberTableEntry(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kSendGetGroupsToServer: sendGetGroupsToServerEntry(); break;
		case kSendGoGroupsToVC: sendGoGroupsToVCEntry(); break;
		case kSendUpdateGroupsToServer: sendUpdateGroupsToServerEntry(); break;
		case kSendUserListToServer: sendUserListToServerEntry(); break;
		case kServerErrorIdle: serverErrorIdleEntry(); break;
		case kSetWaitForGetGroups: setWaitForGetGroupsEntry(); break;
		case kSetWaitForUpdateGroups: setWaitForUpdateGroupsEntry(); break;
		case kSetWaitForUserList: setWaitForUserListEntry(); break;
		case kShowErrorGettingUserList: showErrorGettingUserListEntry(); break;
		case kShowErrorLoadingGroups: showErrorLoadingGroupsEntry(); break;
		case kShowErrorUpdatingGroups: showErrorUpdatingGroupsEntry(); break;
		case kShowRetryGetGroups: showRetryGetGroupsEntry(); break;
		case kShowRetryUpdateGroups: showRetryUpdateGroupsEntry(); break;
		case kShowRetryUserList: showRetryUserListEntry(); break;
		case kShowWontSave: showWontSaveEntry(); break;
		case kStart: startEntry(); break;
		case kUpdateJSONWithSelection: updateJSONWithSelectionEntry(); break;
		case kUpdateMemberSelection: updateMemberSelectionEntry(); break;
		case kUpdateMemberTable: updateMemberTableEntry(); break;
		case kWasGetGroupsSuccessful: wasGetGroupsSuccessfulEntry(); break;
		case kWasUpdateGroupsSuccessful: wasUpdateGroupsSuccessfulEntry(); break;
		case kWasUserListSuccessful: wasUserListSuccessfulEntry(); break;
		default: break;
	}
}

void EditGroupScreen::CallExit()
{
}

int  EditGroupScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kCalculateSelection) && (evt == kNext)) return kUpdateMemberTable; else
	if ((mState == kGetSelectedGroupFromMemberTable) && (evt == kNext)) return kUpdateJSONWithSelection; else
	if ((mState == kIdle) && (evt == kSave)) return kGetSelectedGroupFromMemberTable; else
	if ((mState == kSendGetGroupsToServer) && (evt == kFail)) return kShowRetryGetGroups; else
	if ((mState == kSendGetGroupsToServer) && (evt == kSuccess)) return kWasGetGroupsSuccessful; else
	if ((mState == kSendUpdateGroupsToServer) && (evt == kFail)) return kShowRetryUpdateGroups; else
	if ((mState == kSendUpdateGroupsToServer) && (evt == kSuccess)) return kWasUpdateGroupsSuccessful; else
	if ((mState == kSendUserListToServer) && (evt == kFail)) return kShowRetryUserList; else
	if ((mState == kSendUserListToServer) && (evt == kSuccess)) return kWasUserListSuccessful; else
	if ((mState == kServerErrorIdle) && (evt == kSave)) return kShowWontSave; else
	if ((mState == kSetWaitForGetGroups) && (evt == kNext)) return kSendGetGroupsToServer; else
	if ((mState == kSetWaitForUpdateGroups) && (evt == kNext)) return kSendUpdateGroupsToServer; else
	if ((mState == kSetWaitForUserList) && (evt == kNext)) return kSendUserListToServer; else
	if ((mState == kShowErrorGettingUserList) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kShowErrorLoadingGroups) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kShowErrorUpdatingGroups) && (evt == kYes)) return kShowWontSave; else
	if ((mState == kShowRetryGetGroups) && (evt == kNo)) return kServerErrorIdle; else
	if ((mState == kShowRetryUpdateGroups) && (evt == kNo)) return kShowWontSave; else
	if ((mState == kShowRetryUpdateGroups) && (evt == kYes)) return kSetWaitForUpdateGroups; else
	if ((mState == kShowRetryUserList) && (evt == kNo)) return kServerErrorIdle; else
	if ((mState == kShowRetryUserList) && (evt == kYes)) return kSetWaitForUserList; else
	if ((mState == kShowWontSave) && (evt == kNext)) return kSendGoGroupsToVC; else
	if ((mState == kStart) && (evt == kNext)) return kSetWaitForUserList; else
	if ((mState == kUpdateJSONWithSelection) && (evt == kNext)) return kSetWaitForUpdateGroups; else
	if ((mState == kUpdateMemberSelection) && (evt == kNext)) return kIdle; else
	if ((mState == kUpdateMemberTable) && (evt == kNext)) return kUpdateMemberSelection; else
	if ((mState == kWasGetGroupsSuccessful) && (evt == kNo)) return kShowErrorLoadingGroups; else
	if ((mState == kWasGetGroupsSuccessful) && (evt == kYes)) return kCalculateSelection; else
	if ((mState == kWasUpdateGroupsSuccessful) && (evt == kNo)) return kShowErrorUpdatingGroups; else
	if ((mState == kWasUpdateGroupsSuccessful) && (evt == kYes)) return kSendGoGroupsToVC; else
	if ((mState == kWasUserListSuccessful) && (evt == kNo)) return kShowErrorGettingUserList; else
	if ((mState == kWasUserListSuccessful) && (evt == kYes)) return kSetWaitForGetGroups;

	return kInvalidState;
}

bool EditGroupScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kCalculateSelection:
		case kGetSelectedGroupFromMemberTable:
		case kSetWaitForGetGroups:
		case kSetWaitForUpdateGroups:
		case kSetWaitForUserList:
		case kShowWontSave:
		case kStart:
		case kUpdateJSONWithSelection:
		case kUpdateMemberSelection:
		case kUpdateMemberTable:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void EditGroupScreen::update(const EditGroupScreenMessage& msg)
{
	process(msg.mEvent);
}

void EditGroupScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kOKYesAlertPressed: process(kYes); break;
        case MemoEvent::kNoAlertPressed: process(kNo); break;

        case MemoEvent::kSaveGroupPressed: process(kSave); break;

        default:
            break;
    }
}

void EditGroupScreen::update(const URLLoaderEvent& msg)
{
#pragma unused(msg)
    [gAppDelegateInstance setBlockingViewVisible:false];

    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendGetGroupsToServer:    mGetGroupsJSON      = JSONUtil::extract(msg.mString); break;
                case kSendUpdateGroupsToServer: mUpdateGroupsJSON   = JSONUtil::extract(msg.mString); break;
                case kSendUserListToServer:     mUserListJSON       = JSONUtil::extract(msg.mString); break;
                default:
                    break;
            }
            process(kSuccess);
        }
            break;

        case URLLoaderEvent::kLoadedFile: process(kSuccess); break;
            
        default:
            break;
    }
}

