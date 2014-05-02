#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "ContactsVC.h"

#define kScreenName "Contacts"

#pragma mark Constructor / Destructor
ContactsScreen::ContactsScreen(ContactsVC* newVC, bool newIsChild, void* newIdentifier)
:   mPeer(newVC),
    mIdentifier(newIdentifier),
    mIsChild(newIsChild)
{
	ConstructMachine();
}

ContactsScreen::~ContactsScreen()
{
	DestructMachine();
}

void ContactsScreen::contactPressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mItemSelected = i;
        process(kContactSelected);
    }
}

void ContactsScreen::groupPressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mItemSelected = i;
        process(kGroupSelected);
    }
}

void ContactsScreen::editContactsPressed()
{
    if (getState() == kIdle)
    {
        process(kEditContactsPressed);
    }
}

void ContactsScreen::editGroupsPressed()
{
    if (getState() == kIdle)
    {
        process(kEditGroupsPressed);
    }
}

void ContactsScreen::deleteContactPressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mDeleteSelected = i;
        process(kDeleteContact);
    }
}

void ContactsScreen::deleteGroupPressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mDeleteSelected = i;
        process(kDeleteGroup);
    }
}

void ContactsScreen::refreshPressed()
{
    if (getState() == kIdle)
    {
        process(kRefreshSelected);
    }
}

#pragma mark Start / End / Invalid
void ContactsScreen::startEntry()
{
    GoogleAnalytics::getInstance()->trackScreenEntry(kScreenName);

    URLLoader::getInstance()->attach(this);
    GCTEventManager::getInstance()->attach(this);
}

void ContactsScreen::endEntry()
{
}

void ContactsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void ContactsScreen::idleEntry()
{
}

#pragma mark Peer communication
void ContactsScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

void ContactsScreen::peerPushChangeRegisteredNameEntry()
{
    [mPeer pushChangeRegisteredName:InboxScreen::mContacts[mItemSelected].mObject];
}

void ContactsScreen::peerPushEditAllGroupsEntry()
{
    [mPeer pushEditAllGroups];
}

void ContactsScreen::peerPushEditContactsEntry()
{
    [mPeer pushEditContacts];
}

void ContactsScreen::peerPushGroupViewEntry()
{
    [mPeer pushGroupView:InboxScreen::mGroups[mItemSelected].mObject];
}

void ContactsScreen::peerReloadTableEntry()
{
    [mPeer reloadTable];
}

#pragma mark Queries
void ContactsScreen::isThisAChildScreenEntry()
{
    SetImmediateEvent(mIsChild ? kYes : kNo);
}

void ContactsScreen::isThisAChildScreenGroupsEntry()
{
    SetImmediateEvent(mIsChild ? kYes : kNo);
}

void ContactsScreen::wasSetContactsSuccessfulEntry()
{
    bool result = false;
    bool expired = false;

    if (mSetContactsJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    if (mSetContactsJSON["status"].mString == std::string("expired"))
    {
        expired = true;
    }

    SetImmediateEvent(expired ? kExpired : (result ? kYes : kNo));
}

void ContactsScreen::wasSetGroupsSuccessfulEntry()
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
void ContactsScreen::deleteLocalContactEntry()
{
    std::string email = InboxScreen::mContacts[mDeleteSelected].mObject["email"].mString;

    if (!InboxScreen::mContacts.empty())
    {
        InboxScreen::mContacts.erase(InboxScreen::mContacts.begin() + (int)mDeleteSelected);
    }
}

void ContactsScreen::deleteLocalGroupEntry()
{
    if (!InboxScreen::mGroups.empty())
    {
        InboxScreen::mGroups.erase(InboxScreen::mGroups.begin() + (int)mDeleteSelected);
    }
}

void ContactsScreen::sendSetContactsToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "setContacts"));
    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress));
    params.push_back(std::pair<std::string, std::string>("authToken", InboxScreen::mToken));

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "10485760"));

    tFile(tFile::kTemporaryDirectory, "contacts.json").write(JSONValue(InboxScreen::mContacts).toString());

    URLLoader::getInstance()->postFile(this, kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "contacts.json"));
}

void ContactsScreen::sendSetGroupsToServerEntry()
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
void ContactsScreen::setWaitForSetContactsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void ContactsScreen::setWaitForSetGroupsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void ContactsScreen::showErrorWithSetContactsEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showErrorWithSetContactsEntry");
    // "Error saving contact details"
    tAlert("メンバーの保存に失敗しました");
}

void ContactsScreen::showErrorWithSetGroupsEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showErrorWithSetGroupsEntry");
    //"Error saving group details"
    tAlert("グループの保存に失敗しました");
}

#pragma mark Sending messages to other machines
void ContactsScreen::sendAppendNewContactToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kAppendNewContact, InboxScreen::mContacts[mItemSelected].mObject["email"].mString, mIdentifier));
}

void ContactsScreen::sendAppendNewGroupToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kAppendNewGroup, InboxScreen::mGroups[mItemSelected].mObject["emails"].mArray, mIdentifier));
}

void ContactsScreen::sendForceLogoutToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kForceLogout));
}

void ContactsScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void ContactsScreen::CallEntry()
{
	switch(mState)
	{
		case kDeleteLocalContact: deleteLocalContactEntry(); break;
		case kDeleteLocalGroup: deleteLocalGroupEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsThisAChildScreen: isThisAChildScreenEntry(); break;
		case kIsThisAChildScreenGroups: isThisAChildScreenGroupsEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kPeerPushChangeRegisteredName: peerPushChangeRegisteredNameEntry(); break;
		case kPeerPushEditAllGroups: peerPushEditAllGroupsEntry(); break;
		case kPeerPushEditContacts: peerPushEditContactsEntry(); break;
		case kPeerPushGroupView: peerPushGroupViewEntry(); break;
		case kPeerReloadTable: peerReloadTableEntry(); break;
		case kSendAppendNewContactToVC: sendAppendNewContactToVCEntry(); break;
		case kSendAppendNewGroupToVC: sendAppendNewGroupToVCEntry(); break;
		case kSendForceLogoutToVC: sendForceLogoutToVCEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSendSetContactsToServer: sendSetContactsToServerEntry(); break;
		case kSendSetGroupsToServer: sendSetGroupsToServerEntry(); break;
		case kSetWaitForSetContacts: setWaitForSetContactsEntry(); break;
		case kSetWaitForSetGroups: setWaitForSetGroupsEntry(); break;
		case kShowErrorWithSetContacts: showErrorWithSetContactsEntry(); break;
		case kShowErrorWithSetGroups: showErrorWithSetGroupsEntry(); break;
		case kStart: startEntry(); break;
		case kWasSetContactsSuccessful: wasSetContactsSuccessfulEntry(); break;
		case kWasSetGroupsSuccessful: wasSetGroupsSuccessfulEntry(); break;
		default: break;
	}
}

void ContactsScreen::CallExit()
{
}

int  ContactsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDeleteLocalContact) && (evt == kNext)) return kSetWaitForSetContacts; else
	if ((mState == kDeleteLocalGroup) && (evt == kNext)) return kSetWaitForSetGroups; else
	if ((mState == kIdle) && (evt == kContactSelected)) return kIsThisAChildScreen; else
	if ((mState == kIdle) && (evt == kDeleteContact)) return kDeleteLocalContact; else
	if ((mState == kIdle) && (evt == kDeleteGroup)) return kDeleteLocalGroup; else
	if ((mState == kIdle) && (evt == kEditContactsPressed)) return kPeerPushEditContacts; else
	if ((mState == kIdle) && (evt == kEditGroupsPressed)) return kPeerPushEditAllGroups; else
	if ((mState == kIdle) && (evt == kGroupSelected)) return kIsThisAChildScreenGroups; else
	if ((mState == kIdle) && (evt == kRefreshSelected)) return kPeerReloadTable; else
	if ((mState == kIsThisAChildScreen) && (evt == kNo)) return kPeerPushChangeRegisteredName; else
	if ((mState == kIsThisAChildScreen) && (evt == kYes)) return kSendAppendNewContactToVC; else
	if ((mState == kIsThisAChildScreenGroups) && (evt == kNo)) return kPeerPushGroupView; else
	if ((mState == kIsThisAChildScreenGroups) && (evt == kYes)) return kSendAppendNewGroupToVC; else
	if ((mState == kPeerPushChangeRegisteredName) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerPushEditAllGroups) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerPushEditContacts) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerPushGroupView) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerReloadTable) && (evt == kNext)) return kIdle; else
	if ((mState == kSendAppendNewContactToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSendAppendNewGroupToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSendForceLogoutToVC) && (evt == kNext)) return kIdle; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerReloadTable; else
	if ((mState == kSendSetContactsToServer) && (evt == kFail)) return kShowErrorWithSetContacts; else
	if ((mState == kSendSetContactsToServer) && (evt == kSuccess)) return kWasSetContactsSuccessful; else
	if ((mState == kSendSetGroupsToServer) && (evt == kFail)) return kShowErrorWithSetGroups; else
	if ((mState == kSendSetGroupsToServer) && (evt == kSuccess)) return kWasSetGroupsSuccessful; else
	if ((mState == kSetWaitForSetContacts) && (evt == kNext)) return kSendSetContactsToServer; else
	if ((mState == kSetWaitForSetGroups) && (evt == kNext)) return kSendSetGroupsToServer; else
	if ((mState == kShowErrorWithSetContacts) && (evt == kYes)) return kIdle; else
	if ((mState == kShowErrorWithSetGroups) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kNo)) return kShowErrorWithSetContacts; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kYes)) return kSendReloadInboxToVC; else
	if ((mState == kWasSetGroupsSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasSetGroupsSuccessful) && (evt == kNo)) return kShowErrorWithSetGroups; else
	if ((mState == kWasSetGroupsSuccessful) && (evt == kYes)) return kSendReloadInboxToVC;

	return kInvalidState;
}

bool ContactsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kEnd:
		case kIdle:
		case kInvalidState:
		case kIsThisAChildScreen:
		case kIsThisAChildScreenGroups:
		case kPeerPopSelf:
		case kSendSetContactsToServer:
		case kSendSetGroupsToServer:
		case kShowErrorWithSetContacts:
		case kShowErrorWithSetGroups:
		case kWasSetContactsSuccessful:
		case kWasSetGroupsSuccessful:
			return false;
		default: break;
	}
	return true;
}

#pragma mark Messages
void ContactsScreen::update(const ContactsScreenMessage& msg)
{
	process(msg.mEvent);
}

void ContactsScreen::update(const URLLoaderEvent& msg)
{
    if (msg.mId == this)
    {
        [mPeer setBlockingViewVisible:false];

        switch (msg.mEvent)
        {
            case URLLoaderEvent::kLoadFail: process(kFail); break;
            case URLLoaderEvent::kLoadedString:
            {
                switch (getState())
                {
                    case kSendSetContactsToServer:
                        mSetContactsJSON = JSONUtil::extract(msg.mString);
                        break;

                    case kSendSetGroupsToServer:
                        mSetGroupsJSON = JSONUtil::extract(msg.mString);
                        break;

                    default:
                        break;
                }
            }
                process(kSuccess);
                break;

            case URLLoaderEvent::kLoadedFile: process(kSuccess); break;

            default:
                break;
        }
    }
}

void ContactsScreen::update(const GCTEvent& msg)
{
    switch(getState())
    {
        case kIdle:
            switch (msg.mEvent)
            {
                case GCTEvent::kReloadInbox:        refreshPressed(); break;

                default:
                    break;
            }
            break;

        case kShowErrorWithSetContacts:
        case kShowErrorWithSetGroups:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  update(kYes); break;
                case GCTEvent::kNoAlertPressed:     update(kNo); break;

                default:
                    break;
            }
            break;
    }
}

