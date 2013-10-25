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
    bool result = JSONUtil::extract(mUserListJSON)["status"].mString == std::string("success");

    SetImmediateEvent(result ? kYes : kNo);
}

void SendToGroupScreen::wasPostGroupSuccessfulEntry()
{
    bool result = JSONUtil::extract(mPostGroupJSON)["status"].mString == std::string("success");

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void SendToGroupScreen::getSelectedGroupFromUserTableEntry()
{
    mSelectedGroup = [gAppDelegateInstance getSelectedFromUserListTable];
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
        params.push_back(std::pair<std::string, std::string>("group[]", mSelectedGroup[i]));
    }

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "1048576"));

    URLLoader::getInstance()->postFile(kMemoAppServerURL, params, tFile(tFile::kDocumentsDirectory, mFilename));
}

#pragma mark User Interface
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

void SendToGroupScreen::updateLocalUserListEntry()
{
    mUserListTable = JSONUtil::explodeCommas(JSONUtil::extract(mUserListJSON)["list"].mString);
    [gAppDelegateInstance setUserListTable:mUserListTable];
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
		case kInvalidState: invalidStateEntry(); break;
		case kIsGroupEmpty: isGroupEmptyEntry(); break;
		case kIsUserListValid: isUserListValidEntry(); break;
		case kSendGoInboxToVC: sendGoInboxToVCEntry(); break;
		case kSendPostGroupToServer: sendPostGroupToServerEntry(); break;
		case kSendUserListToServer: sendUserListToServerEntry(); break;
		case kServerErrorIdle: serverErrorIdleEntry(); break;
		case kShowEmptySelection: showEmptySelectionEntry(); break;
		case kShowPostGroupFailed: showPostGroupFailedEntry(); break;
		case kShowPostGroupSuccess: showPostGroupSuccessEntry(); break;
		case kShowReallySend: showReallySendEntry(); break;
		case kShowRetryPostGroup: showRetryPostGroupEntry(); break;
		case kShowRetryUserList: showRetryUserListEntry(); break;
		case kShowServerError: showServerErrorEntry(); break;
		case kShowUserListEmpty: showUserListEmptyEntry(); break;
		case kStart: startEntry(); break;
		case kUpdateLocalUserList: updateLocalUserListEntry(); break;
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
	if ((mState == kIsGroupEmpty) && (evt == kNo)) return kShowReallySend; else
	if ((mState == kIsGroupEmpty) && (evt == kYes)) return kShowEmptySelection; else
	if ((mState == kIsUserListValid) && (evt == kNo)) return kShowUserListEmpty; else
	if ((mState == kIsUserListValid) && (evt == kYes)) return kUpdateLocalUserList; else
	if ((mState == kSendPostGroupToServer) && (evt == kFail)) return kShowRetryPostGroup; else
	if ((mState == kSendPostGroupToServer) && (evt == kSuccess)) return kWasPostGroupSuccessful; else
	if ((mState == kSendUserListToServer) && (evt == kFail)) return kShowRetryUserList; else
	if ((mState == kSendUserListToServer) && (evt == kSuccess)) return kIsUserListValid; else
	if ((mState == kServerErrorIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kServerErrorIdle) && (evt == kSend)) return kShowServerError; else
	if ((mState == kShowEmptySelection) && (evt == kYes)) return kIdle; else
	if ((mState == kShowPostGroupFailed) && (evt == kYes)) return kIdle; else
	if ((mState == kShowPostGroupSuccess) && (evt == kYes)) return kSendGoInboxToVC; else
	if ((mState == kShowReallySend) && (evt == kNo)) return kIdle; else
	if ((mState == kShowReallySend) && (evt == kYes)) return kSendPostGroupToServer; else
	if ((mState == kShowRetryPostGroup) && (evt == kNo)) return kServerErrorIdle; else
	if ((mState == kShowRetryPostGroup) && (evt == kYes)) return kSendPostGroupToServer; else
	if ((mState == kShowRetryUserList) && (evt == kNo)) return kShowServerError; else
	if ((mState == kShowRetryUserList) && (evt == kYes)) return kSendUserListToServer; else
	if ((mState == kShowServerError) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kShowUserListEmpty) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kStart) && (evt == kNext)) return kSendUserListToServer; else
	if ((mState == kUpdateLocalUserList) && (evt == kNext)) return kIdle; else
	if ((mState == kWasPostGroupSuccessful) && (evt == kNo)) return kShowPostGroupFailed; else
	if ((mState == kWasPostGroupSuccessful) && (evt == kYes)) return kShowPostGroupSuccess;

	return kInvalidState;
}

bool SendToGroupScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kGetSelectedGroupFromUserTable:
		case kStart:
		case kUpdateLocalUserList:
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
    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendUserListToServer:
                    mUserListJSON = msg.mString;
                    break;

                case kSendPostGroupToServer:
                    mPostGroupJSON = msg.mString;
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

