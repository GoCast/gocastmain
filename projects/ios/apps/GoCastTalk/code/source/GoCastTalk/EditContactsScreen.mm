#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "EditContactsVC.h"

#define kScreenName "EditContacts"

#pragma mark Constructor / Destructor
EditContactsScreen::EditContactsScreen(EditContactsVC* newVC)
: mPeer(newVC)
{
	ConstructMachine();
}

EditContactsScreen::~EditContactsScreen()
{
	DestructMachine();
}

void EditContactsScreen::createPressed()
{
    if (getState() == kIdle)
    {
        update(kCreateSelected);
    }
}

void EditContactsScreen::itemPressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mItemSelected = i;
        update(kItemSelected);
    }
}

void EditContactsScreen::deletePressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mDeleteSelected = i;
        update(kDeleteSelected);
    }
}

void EditContactsScreen::refreshPressed()
{
    if (getState() == kIdle)
    {
        update(kRefreshSelected);
    }
}

#pragma mark Start / End / Invalid
void EditContactsScreen::startEntry()
{
    GoogleAnalytics::getInstance()->trackScreenEntry(kScreenName);

    URLLoader::getInstance()->attach(this);
    GCTEventManager::getInstance()->attach(this);
}

void EditContactsScreen::endEntry()
{
}

void EditContactsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void EditContactsScreen::idleEntry()
{
}

#pragma mark Peer communication
void EditContactsScreen::peerPushChangeRegisteredNameEntry()
{
    [mPeer pushChangeRegisteredName:InboxScreen::mContacts[mItemSelected].mObject];
}

void EditContactsScreen::peerPushCreateContactEntry()
{
    [mPeer pushCreateContact];
}

void EditContactsScreen::peerReloadTableEntry()
{
    [mPeer reloadTable];
}

#pragma mark Queries
void EditContactsScreen::wasSetContactsSuccessfulEntry()
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

#pragma mark Actions
void EditContactsScreen::deleteLocalContactEntry()
{
    std::string email = InboxScreen::mContacts[mDeleteSelected].mObject["email"].mString;

    InboxScreen::mContacts.erase(InboxScreen::mContacts.begin() + (int)mDeleteSelected);
}

void EditContactsScreen::sendSetContactsToServerEntry()
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


#pragma mark UI
void EditContactsScreen::setWaitForSetContactsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void EditContactsScreen::showErrorWithSetContactsEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showErrorWithSetContactsEntry");
    tAlert("Error saving contact details");
}

#pragma mark Sending messages to other machines
void EditContactsScreen::sendForceLogoutToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kForceLogout));
}
void EditContactsScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void EditContactsScreen::CallEntry()
{
	switch(mState)
	{
		case kDeleteLocalContact: deleteLocalContactEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPushChangeRegisteredName: peerPushChangeRegisteredNameEntry(); break;
		case kPeerPushCreateContact: peerPushCreateContactEntry(); break;
		case kPeerReloadTable: peerReloadTableEntry(); break;
		case kSendForceLogoutToVC: sendForceLogoutToVCEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSendSetContactsToServer: sendSetContactsToServerEntry(); break;
		case kSetWaitForSetContacts: setWaitForSetContactsEntry(); break;
		case kShowErrorWithSetContacts: showErrorWithSetContactsEntry(); break;
		case kStart: startEntry(); break;
		case kWasSetContactsSuccessful: wasSetContactsSuccessfulEntry(); break;
		default: break;
	}
}

void EditContactsScreen::CallExit()
{
}

int  EditContactsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDeleteLocalContact) && (evt == kNext)) return kSetWaitForSetContacts; else
	if ((mState == kIdle) && (evt == kCreateSelected)) return kPeerPushCreateContact; else
	if ((mState == kIdle) && (evt == kDeleteSelected)) return kDeleteLocalContact; else
	if ((mState == kIdle) && (evt == kItemSelected)) return kPeerPushChangeRegisteredName; else
	if ((mState == kIdle) && (evt == kRefreshSelected)) return kPeerReloadTable; else
	if ((mState == kPeerPushChangeRegisteredName) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerPushCreateContact) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerReloadTable) && (evt == kNext)) return kIdle; else
	if ((mState == kSendForceLogoutToVC) && (evt == kNext)) return kPeerReloadTable; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerReloadTable; else
	if ((mState == kSendSetContactsToServer) && (evt == kFail)) return kShowErrorWithSetContacts; else
	if ((mState == kSendSetContactsToServer) && (evt == kSuccess)) return kWasSetContactsSuccessful; else
	if ((mState == kSetWaitForSetContacts) && (evt == kNext)) return kSendSetContactsToServer; else
	if ((mState == kShowErrorWithSetContacts) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kNo)) return kShowErrorWithSetContacts; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kYes)) return kSendReloadInboxToVC;

	return kInvalidState;
}

bool EditContactsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kEnd:
		case kIdle:
		case kInvalidState:
		case kSendSetContactsToServer:
		case kShowErrorWithSetContacts:
		case kWasSetContactsSuccessful:
			return false;
		default: break;
	}
	return true;
}

#pragma mark Messages
void EditContactsScreen::update(const EditContactsScreenMessage& msg)
{
    switch (msg.mEvent)
    {
        case kDeleteSelected:   GoogleAnalytics::getInstance()->trackButton(kScreenName, "kDeleteSelected"); break;
        case kItemSelected:     GoogleAnalytics::getInstance()->trackButton(kScreenName, "kItemSelected"); break;
        case kCreateSelected:   GoogleAnalytics::getInstance()->trackButton(kScreenName, "kCreateSelected"); break;
        case kRefreshSelected:  GoogleAnalytics::getInstance()->trackButton(kScreenName, "kRefreshSelected"); break;
        default: break;
    }

	process(msg.mEvent);
}

void EditContactsScreen::update(const URLLoaderEvent& msg)
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
                    case kSendSetContactsToServer:
                        mSetContactsJSON = JSONUtil::extract(msg.mString);
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

void EditContactsScreen::update(const GCTEvent& msg)
{
    if (msg.mEvent == GCTEvent::kLanguageChanged)
    {
        [mPeer refreshLanguage];
    }

    switch(getState())
    {
        case kShowErrorWithSetContacts:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  update(kYes); break;
                case GCTEvent::kNoAlertPressed:     update(kNo); break;

                default:
                    break;
            }
            break;

        case kIdle:
            switch (msg.mEvent)
            {
                case GCTEvent::kReloadInbox:        refreshPressed(); break;

                default:
                    break;
            }
            break;
    }
}
