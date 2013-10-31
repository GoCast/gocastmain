#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
SendToGroupScreen::SendToGroupScreen(const std::string& newFilename)
: mFilename(newFilename)
{
	ConstructMachine();
}

SendToGroupScreen::~SendToGroupScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void SendToGroupScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    [gAppDelegateInstance setSendToGroupScreenVisible:true];
    [gAppDelegateInstance setNavigationBarTitle:"Send to Group"];
}

void SendToGroupScreen::endEntry()
{
    [gAppDelegateInstance setSendToGroupScreenVisible:false];
}

void SendToGroupScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void SendToGroupScreen::idleEntry()
{
}

void SendToGroupScreen::serverErrorIdleEntry()
{
}

#pragma mark Queries

void SendToGroupScreen::isGroupEmptyEntry()
{
    SetImmediateEvent(mSelectedGroup.empty() ? kYes : kNo);
}

void SendToGroupScreen::isUserListValidEntry()
{
    bool result = mUserListJSON["status"].mString == std::string("success");

    SetImmediateEvent(result ? kYes : kNo);
}

void SendToGroupScreen::wasPostGroupSuccessfulEntry()
{
    bool result = mPostGroupJSON["status"].mString == std::string("success");

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Iterating over users to get profile names
void SendToGroupScreen::initIToZeroEntry()
{
    mIter = 0;
}

void SendToGroupScreen::setWaitForGetProfileEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void SendToGroupScreen::incrementIEntry()
{
    mIter++;
}

void SendToGroupScreen::isILessThanUserListCountEntry()
{
    SetImmediateEvent(mIter < mEmailListTable.size() ? kYes : kNo);
}

void SendToGroupScreen::sendGetProfileIToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=getProfile&name=%s",
            kMemoAppServerURL,
            mEmailListTable[mIter].mString.c_str());

    URLLoader::getInstance()->loadString(buf);
}

void SendToGroupScreen::showRetryGetProfileEntry()
{
    tConfirm("Couldn't contact server, retry getting user profile?");
}

void SendToGroupScreen::isProfileValidEntry()
{
    bool result = false;

    if (mGetProfileJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void SendToGroupScreen::updateUserListIEntry()
{
    if (!mGetProfileJSON["profile"].mObject["kanji"].mString.empty())
    {
        mUserListTable[mIter] = mGetProfileJSON["profile"].mObject["kanji"].mString;
    }
    else if (!mGetProfileJSON["profile"].mObject["kana"].mString.empty())
    {
        mUserListTable[mIter] = mGetProfileJSON["profile"].mObject["kana"].mString;
    }
}

#pragma mark Actions
void SendToGroupScreen::getSelectedGroupFromUserTableEntry()
{
    std::vector<size_t> group = [gAppDelegateInstance getSelectedFromUserListTable];

    mSelectedGroup.clear();
    for(size_t i = 0; i < group.size(); i++)
    {
        mSelectedGroup.push_back(mEmailListTable[group[i]]);
    }
}

void SendToGroupScreen::sendUserListToServerEntry()
{
    URLLoader::getInstance()->loadString(kMemoAppServerURL"?action=userList");
}

void SendToGroupScreen::sendPostGroupToServerEntry()
{
    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "postGroup"));
    params.push_back(std::pair<std::string, std::string>("from", std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt"))));

    for (size_t i = 0; i < mSelectedGroup.size(); i++)
    {
        params.push_back(std::pair<std::string, std::string>("group[]", mSelectedGroup[i].mString));
    }

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "1048576"));

    URLLoader::getInstance()->postFile(kMemoAppServerURL, params, tFile(tFile::kDocumentsDirectory, mFilename));
}

#pragma mark User Interface
void SendToGroupScreen::setWaitForUserListEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void SendToGroupScreen::showEmptySelectionEntry()
{
    tAlert("Must select at least one user");
}

void SendToGroupScreen::showPostGroupFailedEntry()
{
    tAlert("Memo failed posting to group");
}

void SendToGroupScreen::showPostGroupSuccessEntry()
{
    tAlert("Memo successfully posted to group");
}

void SendToGroupScreen::showReallySendEntry()
{
    tConfirm("Really send the memo to this group?");
}
void SendToGroupScreen::showRetryPostGroupEntry()
{
    tConfirm("Couldn't contact server, retry posting to group?");
}

void SendToGroupScreen::showRetryUserListEntry()
{
    tConfirm("Couldn't contact server, retry getting user list?");
}

void SendToGroupScreen::showServerErrorEntry()
{
    tAlert("There was an unrecoverable server error");
}

void SendToGroupScreen::showUserListEmptyEntry()
{
    tAlert("Error: User list is empty");
}

void SendToGroupScreen::reUpdateLocalUserListEntry()
{
    [gAppDelegateInstance setUserListTable:mUserListTable];
}

void SendToGroupScreen::updateLocalUserListEntry()
{
    mUserListTable = mUserListJSON["list"].mArray;
    mEmailListTable = mUserListTable;
    [gAppDelegateInstance setUserListTable:mEmailListTable];
}

#pragma mark Messages to other machines
void SendToGroupScreen::sendGoInboxToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoInbox));
}

#pragma mark State wiring
void SendToGroupScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kGetSelectedGroupFromUserTable: getSelectedGroupFromUserTableEntry(); break;
		case kIdle: idleEntry(); break;
		case kIncrementI: incrementIEntry(); break;
		case kInitIToZero: initIToZeroEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsGroupEmpty: isGroupEmptyEntry(); break;
		case kIsILessThanUserListCount: isILessThanUserListCountEntry(); break;
		case kIsProfileValid: isProfileValidEntry(); break;
		case kIsUserListValid: isUserListValidEntry(); break;
		case kReUpdateLocalUserList: reUpdateLocalUserListEntry(); break;
		case kSendGetProfileIToServer: sendGetProfileIToServerEntry(); break;
		case kSendGoInboxToVC: sendGoInboxToVCEntry(); break;
		case kSendPostGroupToServer: sendPostGroupToServerEntry(); break;
		case kSendUserListToServer: sendUserListToServerEntry(); break;
		case kServerErrorIdle: serverErrorIdleEntry(); break;
		case kSetWaitForGetProfile: setWaitForGetProfileEntry(); break;
		case kSetWaitForUserList: setWaitForUserListEntry(); break;
		case kShowEmptySelection: showEmptySelectionEntry(); break;
		case kShowPostGroupFailed: showPostGroupFailedEntry(); break;
		case kShowPostGroupSuccess: showPostGroupSuccessEntry(); break;
		case kShowReallySend: showReallySendEntry(); break;
		case kShowRetryGetProfile: showRetryGetProfileEntry(); break;
		case kShowRetryPostGroup: showRetryPostGroupEntry(); break;
		case kShowRetryUserList: showRetryUserListEntry(); break;
		case kShowServerError: showServerErrorEntry(); break;
		case kShowUserListEmpty: showUserListEmptyEntry(); break;
		case kStart: startEntry(); break;
		case kUpdateLocalUserList: updateLocalUserListEntry(); break;
		case kUpdateUserListI: updateUserListIEntry(); break;
		case kWasPostGroupSuccessful: wasPostGroupSuccessfulEntry(); break;
		default: break;
	}
}

void SendToGroupScreen::CallExit()
{
}

int  SendToGroupScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kGetSelectedGroupFromUserTable) && (evt == kNext)) return kIsGroupEmpty; else
	if ((mState == kIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kIdle) && (evt == kSend)) return kGetSelectedGroupFromUserTable; else
	if ((mState == kIncrementI) && (evt == kNext)) return kIsILessThanUserListCount; else
	if ((mState == kInitIToZero) && (evt == kNext)) return kSetWaitForGetProfile; else
	if ((mState == kIsGroupEmpty) && (evt == kNo)) return kShowReallySend; else
	if ((mState == kIsGroupEmpty) && (evt == kYes)) return kShowEmptySelection; else
	if ((mState == kIsILessThanUserListCount) && (evt == kNo)) return kIdle; else
	if ((mState == kIsILessThanUserListCount) && (evt == kYes)) return kSetWaitForGetProfile; else
	if ((mState == kIsProfileValid) && (evt == kNo)) return kShowRetryGetProfile; else
	if ((mState == kIsProfileValid) && (evt == kYes)) return kUpdateUserListI; else
	if ((mState == kIsUserListValid) && (evt == kNo)) return kShowUserListEmpty; else
	if ((mState == kIsUserListValid) && (evt == kYes)) return kUpdateLocalUserList; else
	if ((mState == kReUpdateLocalUserList) && (evt == kNext)) return kIncrementI; else
	if ((mState == kSendGetProfileIToServer) && (evt == kFail)) return kShowRetryGetProfile; else
	if ((mState == kSendGetProfileIToServer) && (evt == kSuccess)) return kIsProfileValid; else
	if ((mState == kSendPostGroupToServer) && (evt == kFail)) return kShowRetryPostGroup; else
	if ((mState == kSendPostGroupToServer) && (evt == kSuccess)) return kWasPostGroupSuccessful; else
	if ((mState == kSendUserListToServer) && (evt == kFail)) return kShowRetryUserList; else
	if ((mState == kSendUserListToServer) && (evt == kSuccess)) return kIsUserListValid; else
	if ((mState == kServerErrorIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kServerErrorIdle) && (evt == kSend)) return kShowServerError; else
	if ((mState == kSetWaitForGetProfile) && (evt == kNext)) return kSendGetProfileIToServer; else
	if ((mState == kSetWaitForUserList) && (evt == kNext)) return kSendUserListToServer; else
	if ((mState == kShowEmptySelection) && (evt == kYes)) return kIdle; else
	if ((mState == kShowPostGroupFailed) && (evt == kYes)) return kIdle; else
	if ((mState == kShowPostGroupSuccess) && (evt == kYes)) return kSendGoInboxToVC; else
	if ((mState == kShowReallySend) && (evt == kNo)) return kIdle; else
	if ((mState == kShowReallySend) && (evt == kYes)) return kSendPostGroupToServer; else
	if ((mState == kShowRetryGetProfile) && (evt == kNo)) return kIdle; else
	if ((mState == kShowRetryGetProfile) && (evt == kYes)) return kSetWaitForGetProfile; else
	if ((mState == kShowRetryPostGroup) && (evt == kNo)) return kServerErrorIdle; else
	if ((mState == kShowRetryPostGroup) && (evt == kYes)) return kSendPostGroupToServer; else
	if ((mState == kShowRetryUserList) && (evt == kNo)) return kShowServerError; else
	if ((mState == kShowRetryUserList) && (evt == kYes)) return kSendUserListToServer; else
	if ((mState == kShowServerError) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kShowUserListEmpty) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kStart) && (evt == kNext)) return kSetWaitForUserList; else
	if ((mState == kUpdateLocalUserList) && (evt == kNext)) return kInitIToZero; else
	if ((mState == kUpdateUserListI) && (evt == kNext)) return kReUpdateLocalUserList; else
	if ((mState == kWasPostGroupSuccessful) && (evt == kNo)) return kShowPostGroupFailed; else
	if ((mState == kWasPostGroupSuccessful) && (evt == kYes)) return kShowPostGroupSuccess;

	return kInvalidState;
}

bool SendToGroupScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kGetSelectedGroupFromUserTable:
		case kIncrementI:
		case kInitIToZero:
		case kReUpdateLocalUserList:
		case kSetWaitForGetProfile:
		case kSetWaitForUserList:
		case kStart:
		case kUpdateLocalUserList:
		case kUpdateUserListI:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void SendToGroupScreen::update(const SendToGroupScreenMessage& msg)
{
	process(msg.mEvent);
}

void SendToGroupScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kOKYesAlertPressed:         process(kYes); break;
        case MemoEvent::kNoAlertPressed:            process(kNo); break;
        case MemoEvent::kSendSendToGroupPressed:    process(kSend); break;
        case MemoEvent::kCancelSendToGroupPressed:  process(kCancel); break;

        default:
            break;
    }
}

void SendToGroupScreen::update(const URLLoaderEvent& msg)
{
    [gAppDelegateInstance setBlockingViewVisible:false];

    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendUserListToServer:
                    mUserListJSON = JSONUtil::extract(msg.mString);
                    break;

                case kSendPostGroupToServer:
                    mPostGroupJSON = JSONUtil::extract(msg.mString);
                    break;

                case kSendGetProfileIToServer:
                    mGetProfileJSON = JSONUtil::extract(msg.mString);
                    break;

                default:
                    break;
            }
            process(kSuccess);
        }
            break;

        default:
            break;
    }
}

