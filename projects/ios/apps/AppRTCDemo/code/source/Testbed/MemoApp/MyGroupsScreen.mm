#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
MyGroupsScreen::MyGroupsScreen()
{
	ConstructMachine();
}

MyGroupsScreen::~MyGroupsScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void MyGroupsScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    [gAppDelegateInstance setMyGroupsScreenVisible:true];
    [gAppDelegateInstance setNavigationBarTitle:"Groups"];

    mItemSelected = (tUInt32)0;
    mHasSelection = false;
}

void MyGroupsScreen::endEntry()
{
    [gAppDelegateInstance setMyGroupsScreenVisible:false];
}

void MyGroupsScreen::idleEntry()
{
}

void MyGroupsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Queries
void MyGroupsScreen::isAnItemSelectedEntry()
{
    SetImmediateEvent(mHasSelection ? kYes : kNo);
}

void MyGroupsScreen::wasGetGroupsSuccessfulEntry()
{
    bool result = false;

    if (mGetGroupsJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void MyGroupsScreen::wasUpdateGroupsSuccessfulEntry()
{
    bool result = false;

    if (mUpdateGroupsJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void MyGroupsScreen::sendGetGroupsToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=getGroups&name=%s",
            kMemoAppServerURL,
            std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt")).c_str());

    URLLoader::getInstance()->loadString(buf);
}

void MyGroupsScreen::sendUpdateGroupsToServerEntry()
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

void MyGroupsScreen::calculateGroupListEntry()
{
    mGroupList.clear();
    for (size_t i = 0; i < mGetGroupsJSON["groups"].mArray.size(); i++)
    {
        mGroupList.push_back(mGetGroupsJSON["groups"].mArray[i].mObject["name"].mString);
    }
}

void MyGroupsScreen::removeSelectedItemFromJSONEntry()
{
    mGetGroupsJSON["groups"].mArray.erase((mGetGroupsJSON["groups"].mArray.begin()) + (int)mItemSelected);
}

void MyGroupsScreen::updateGroupsTableEntry()
{
    [gAppDelegateInstance setMyGroupsTable:mGroupList];
}

#pragma mark User Interface
void MyGroupsScreen::setWaitForGetGroupsEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void MyGroupsScreen::setWaitForUpdateGroupsEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void MyGroupsScreen::showErrorLoadingGroupsEntry()
{
    tAlert("Error loading groups");
}

void MyGroupsScreen::showErrorUpdatingGroupsEntry()
{
    tAlert("Error updating groups");
}

void MyGroupsScreen::showPleaseSelectAnItemEntry()
{
    tAlert("Please select an item first");
}

void MyGroupsScreen::showRetryGetGroupsEntry()
{
    tConfirm("Couldn't contact server, retry get groups?");
}

void MyGroupsScreen::showRetryUpdateGroupsEntry()
{
    tConfirm("Couldn't contact server, retry update groups?");
}

#pragma mark Sending messages to other machines

void MyGroupsScreen::sendGoEditGroupToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoEditGroup));
}

#pragma mark State wiring
void MyGroupsScreen::CallEntry()
{
	switch(mState)
	{
		case kCalculateGroupList: calculateGroupListEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsAnItemSelected: isAnItemSelectedEntry(); break;
		case kRemoveSelectedItemFromJSON: removeSelectedItemFromJSONEntry(); break;
		case kSendGetGroupsToServer: sendGetGroupsToServerEntry(); break;
		case kSendGoEditGroupToVC: sendGoEditGroupToVCEntry(); break;
		case kSendUpdateGroupsToServer: sendUpdateGroupsToServerEntry(); break;
		case kSetWaitForGetGroups: setWaitForGetGroupsEntry(); break;
		case kSetWaitForUpdateGroups: setWaitForUpdateGroupsEntry(); break;
		case kShowErrorLoadingGroups: showErrorLoadingGroupsEntry(); break;
		case kShowErrorUpdatingGroups: showErrorUpdatingGroupsEntry(); break;
		case kShowPleaseSelectAnItem: showPleaseSelectAnItemEntry(); break;
		case kShowRetryGetGroups: showRetryGetGroupsEntry(); break;
		case kShowRetryUpdateGroups: showRetryUpdateGroupsEntry(); break;
		case kStart: startEntry(); break;
		case kUpdateGroupsTable: updateGroupsTableEntry(); break;
		case kWasGetGroupsSuccessful: wasGetGroupsSuccessfulEntry(); break;
		case kWasUpdateGroupsSuccessful: wasUpdateGroupsSuccessfulEntry(); break;
		default: break;
	}
}

void MyGroupsScreen::CallExit()
{
}

int  MyGroupsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kCalculateGroupList) && (evt == kNext)) return kUpdateGroupsTable; else
	if ((mState == kIdle) && (evt == kAdd)) return kSendGoEditGroupToVC; else
	if ((mState == kIdle) && (evt == kEdit)) return kIsAnItemSelected; else
	if ((mState == kIdle) && (evt == kItemDeleted)) return kRemoveSelectedItemFromJSON; else
	if ((mState == kIsAnItemSelected) && (evt == kNo)) return kShowPleaseSelectAnItem; else
	if ((mState == kIsAnItemSelected) && (evt == kYes)) return kSendGoEditGroupToVC; else
	if ((mState == kRemoveSelectedItemFromJSON) && (evt == kNext)) return kSetWaitForUpdateGroups; else
	if ((mState == kSendGetGroupsToServer) && (evt == kFail)) return kShowRetryGetGroups; else
	if ((mState == kSendGetGroupsToServer) && (evt == kSuccess)) return kWasGetGroupsSuccessful; else
	if ((mState == kSendUpdateGroupsToServer) && (evt == kFail)) return kShowRetryUpdateGroups; else
	if ((mState == kSendUpdateGroupsToServer) && (evt == kSuccess)) return kWasUpdateGroupsSuccessful; else
	if ((mState == kSetWaitForGetGroups) && (evt == kNext)) return kSendGetGroupsToServer; else
	if ((mState == kSetWaitForUpdateGroups) && (evt == kNext)) return kSendUpdateGroupsToServer; else
	if ((mState == kShowErrorLoadingGroups) && (evt == kYes)) return kCalculateGroupList; else
	if ((mState == kShowErrorUpdatingGroups) && (evt == kYes)) return kSetWaitForGetGroups; else
	if ((mState == kShowPleaseSelectAnItem) && (evt == kYes)) return kIdle; else
	if ((mState == kShowRetryGetGroups) && (evt == kNo)) return kIdle; else
	if ((mState == kShowRetryUpdateGroups) && (evt == kNo)) return kSetWaitForGetGroups; else
	if ((mState == kShowRetryUpdateGroups) && (evt == kYes)) return kSetWaitForUpdateGroups; else
	if ((mState == kStart) && (evt == kNext)) return kSetWaitForGetGroups; else
	if ((mState == kUpdateGroupsTable) && (evt == kNext)) return kIdle; else
	if ((mState == kWasGetGroupsSuccessful) && (evt == kNo)) return kShowErrorLoadingGroups; else
	if ((mState == kWasGetGroupsSuccessful) && (evt == kYes)) return kCalculateGroupList; else
	if ((mState == kWasUpdateGroupsSuccessful) && (evt == kNo)) return kShowErrorUpdatingGroups; else
	if ((mState == kWasUpdateGroupsSuccessful) && (evt == kYes)) return kSetWaitForGetGroups;

	return kInvalidState;
}

bool MyGroupsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kCalculateGroupList:
		case kRemoveSelectedItemFromJSON:
		case kSetWaitForGetGroups:
		case kSetWaitForUpdateGroups:
		case kStart:
		case kUpdateGroupsTable:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void MyGroupsScreen::update(const MyGroupsScreenMessage& msg)
{
	process(msg.mEvent);
}

void MyGroupsScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kAddGroupPressed:       process(kAdd); break;
        case MemoEvent::kEditGroupPressed:      process(kEdit); break;

        case MemoEvent::kOKYesAlertPressed: process(kYes); break;
        case MemoEvent::kNoAlertPressed: process(kNo); break;

        case MemoEvent::kTableItemSelected:
            mItemSelected = msg.mItemSelected;
            mHasSelection = true;
            break;

        case MemoEvent::kTableItemDeleted:
            mItemSelected = msg.mItemSelected;
            mHasSelection = false;
            process(kItemDeleted);
            break;

        default:
            break;
    }
}

void MyGroupsScreen::update(const URLLoaderEvent& msg)
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
                case kSendGetGroupsToServer:
                    mGetGroupsJSON = JSONUtil::extract(msg.mString);
                    break;

                case kSendUpdateGroupsToServer:
                    mUpdateGroupsJSON = JSONUtil::extract(msg.mString);
                    break;

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

