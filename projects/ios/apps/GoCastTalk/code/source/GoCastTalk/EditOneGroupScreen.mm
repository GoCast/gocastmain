#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "EditOneGroupVC.h"

#define kScreenName "EditOneGroup"

#pragma mark Constructor / Destructor
EditOneGroupScreen::EditOneGroupScreen(EditOneGroupVC* newVC, const JSONObject& initObject)
:   mPeer(newVC),
    mInitObject(initObject)
{
	ConstructMachine();
}

EditOneGroupScreen::~EditOneGroupScreen()
{
	DestructMachine();
}

#pragma mark Public methods
void EditOneGroupScreen::pressDone(const std::string& newName)
{
    mNewName = newName;

    update(kDonePressed);
}

bool EditOneGroupScreen::isChecked(const size_t& i)
{
    return mIsChecked.at(i);
}

void EditOneGroupScreen::contactPressed(const size_t& i)
{
    mIsChecked[i] = !mIsChecked.at(i);

    [mPeer reloadTable];
}

#pragma mark Peer communication
void EditOneGroupScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

#pragma mark Start / End / Invalid
void EditOneGroupScreen::startEntry()
{
    GoogleAnalytics::getInstance()->trackScreenEntry(kScreenName);

    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);
}

void EditOneGroupScreen::endEntry()
{
}

void EditOneGroupScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void EditOneGroupScreen::idleEntry()
{
}

#pragma mark Queries
void EditOneGroupScreen::areAnyMembersSelectedEntry()
{
    bool found = false;

    for(size_t i = 0; i < mIsChecked.size(); i++)
    {
        if (mIsChecked.at(i))
        {
            found = true;
            break;
        }
    }

    SetImmediateEvent(found ? kYes : kNo);
}

void EditOneGroupScreen::isNewNameEmptyEntry()
{
    SetImmediateEvent(mNewName.empty() ? kYes : kNo);
}

void EditOneGroupScreen::wasSetGroupsSuccessfulEntry()
{
    bool result = false;
    bool expired = false;

    if (mSetGroupsJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    if (mSetGroupsJSON["status"].mString == std::string("expired"))
    {
        expired = true;
    }

    SetImmediateEvent(expired ? kExpired : (result ? kYes : kNo));
}

#pragma mark Actions
void EditOneGroupScreen::calculateChecksEntry()
{
    mIsChecked.clear();
    mIsChecked.resize(InboxScreen::mContacts.size(), false);

    for (size_t i = 0; i < InboxScreen::mContacts.size(); i++)
    {
        for (size_t j = 0; j < mInitObject["emails"].mArray.size(); j++)
        {
            if (InboxScreen::mContacts[i].mObject["email"].mString == mInitObject["emails"].mArray[j].mString)
            {
                mIsChecked[i] = true;
                break;
            }
        }
    }
}

void EditOneGroupScreen::deleteOldLocalGroupEntry()
{
    if (!mInitObject["name"].mString.empty())
    {
        for(JSONArray::iterator iter = InboxScreen::mGroups.begin(); iter != InboxScreen::mGroups.end(); iter++)
        {
            if ((*iter).mObject["name"].mString == mInitObject["name"].mString)
            {
                InboxScreen::mGroups.erase(iter);
                break;
            }
        }
    }
}

void EditOneGroupScreen::writeNewLocalGroupEntry()
{
    JSONObject newEntry;

    newEntry["name"] = JSONValue(mNewName);
    newEntry["emails"] = JSONArray();

    for (size_t i = 0; i < mIsChecked.size(); i++)
    {
        if (mIsChecked.at(i))
        {
            newEntry["emails"].mArray.push_back(InboxScreen::mContacts[i].mObject["email"].mString);
        }
    }

    InboxScreen::mGroups.push_back(newEntry);
}

void EditOneGroupScreen::sendSetGroupsToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "setGroups"));
    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress));
    params.push_back(std::pair<std::string, std::string>("authToken", InboxScreen::mToken));

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "10485760"));

    tFile(tFile::kTemporaryDirectory, "groups.json").write(JSONValue(InboxScreen::mGroups).toString());

    URLLoader::getInstance()->postFile(this, kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "groups.json"));
}

#pragma mark UI
void EditOneGroupScreen::setWaitForSetGroupsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void EditOneGroupScreen::showErrorWithSetGroupsEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showErrorWithSetGroupsEntry");
    tAlert("Error saving group details");
}

void EditOneGroupScreen::showMustSelectMembersEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showMustSelectMembersEntry");
    tAlert("No group members selected");
}

void EditOneGroupScreen::showNameCantBeEmptyEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showNameCantBeEmptyEntry");
    tAlert("Group name must not be empty");
}

#pragma mark Sending messages to other machines
void EditOneGroupScreen::sendForceLogoutToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kForceLogout));
}
void EditOneGroupScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void EditOneGroupScreen::CallEntry()
{
	switch(mState)
	{
		case kAreAnyMembersSelected: areAnyMembersSelectedEntry(); break;
		case kCalculateChecks: calculateChecksEntry(); break;
		case kDeleteOldLocalGroup: deleteOldLocalGroupEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsNewNameEmpty: isNewNameEmptyEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kSendForceLogoutToVC: sendForceLogoutToVCEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSendSetGroupsToServer: sendSetGroupsToServerEntry(); break;
		case kSetWaitForSetGroups: setWaitForSetGroupsEntry(); break;
		case kShowErrorWithSetGroups: showErrorWithSetGroupsEntry(); break;
		case kShowMustSelectMembers: showMustSelectMembersEntry(); break;
		case kShowNameCantBeEmpty: showNameCantBeEmptyEntry(); break;
		case kStart: startEntry(); break;
		case kWasSetGroupsSuccessful: wasSetGroupsSuccessfulEntry(); break;
		case kWriteNewLocalGroup: writeNewLocalGroupEntry(); break;
		default: break;
	}
}

void EditOneGroupScreen::CallExit()
{
}

int  EditOneGroupScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kAreAnyMembersSelected) && (evt == kNo)) return kShowMustSelectMembers; else
	if ((mState == kAreAnyMembersSelected) && (evt == kYes)) return kDeleteOldLocalGroup; else
	if ((mState == kCalculateChecks) && (evt == kNext)) return kIdle; else
	if ((mState == kDeleteOldLocalGroup) && (evt == kNext)) return kWriteNewLocalGroup; else
	if ((mState == kIdle) && (evt == kDonePressed)) return kIsNewNameEmpty; else
	if ((mState == kIsNewNameEmpty) && (evt == kNo)) return kAreAnyMembersSelected; else
	if ((mState == kIsNewNameEmpty) && (evt == kYes)) return kShowNameCantBeEmpty; else
	if ((mState == kSendForceLogoutToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSendSetGroupsToServer) && (evt == kFail)) return kShowErrorWithSetGroups; else
	if ((mState == kSendSetGroupsToServer) && (evt == kSuccess)) return kWasSetGroupsSuccessful; else
	if ((mState == kSetWaitForSetGroups) && (evt == kNext)) return kSendSetGroupsToServer; else
	if ((mState == kShowErrorWithSetGroups) && (evt == kYes)) return kIdle; else
	if ((mState == kShowMustSelectMembers) && (evt == kYes)) return kIdle; else
	if ((mState == kShowNameCantBeEmpty) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kCalculateChecks; else
	if ((mState == kWasSetGroupsSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasSetGroupsSuccessful) && (evt == kNo)) return kShowErrorWithSetGroups; else
	if ((mState == kWasSetGroupsSuccessful) && (evt == kYes)) return kSendReloadInboxToVC; else
	if ((mState == kWriteNewLocalGroup) && (evt == kNext)) return kSetWaitForSetGroups;

	return kInvalidState;
}

bool EditOneGroupScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kCalculateChecks:
		case kDeleteOldLocalGroup:
		case kSendForceLogoutToVC:
		case kSendReloadInboxToVC:
		case kSetWaitForSetGroups:
		case kStart:
		case kWriteNewLocalGroup:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void EditOneGroupScreen::update(const EditOneGroupScreenMessage& msg)
{
    switch (msg.mEvent)
    {
        case kDonePressed:  GoogleAnalytics::getInstance()->trackButton(kScreenName, "kDonePressed"); break;
        default: break;
    }

	process(msg.mEvent);
}

void EditOneGroupScreen::update(const URLLoaderEvent& msg)
{
    if (msg.mId == this)
    {
        [mPeer setBlockingViewVisible:false];

        switch (msg.mEvent)
        {
            case URLLoaderEvent::kLoadFail: update(kFail); break;
            case URLLoaderEvent::kLoadedString:
            {
                switch (getState())
                {
                    case kSendSetGroupsToServer:
                        mSetGroupsJSON = JSONUtil::extract(msg.mString);
                        break;

                    default:
                        break;
                }
            }
                update(kSuccess);
                break;

            case URLLoaderEvent::kLoadedFile: update(kSuccess); break;

            default:
                break;
        }
    }
}

void EditOneGroupScreen::update(const GCTEvent& msg)
{
    if (msg.mEvent == GCTEvent::kLanguageChanged)
    {
        [mPeer refreshLanguage];
    }

    switch (getState())
    {
        case kShowNameCantBeEmpty:
        case kShowErrorWithSetGroups:
        case kShowMustSelectMembers:
            switch(msg.mEvent)
        {
            case GCTEvent::kOKYesAlertPressed:  update(kYes); break;
            case GCTEvent::kNoAlertPressed:     update(kNo); break;

            default:
                break;
        }
            break;
            
        default:
            break;
    }
}

