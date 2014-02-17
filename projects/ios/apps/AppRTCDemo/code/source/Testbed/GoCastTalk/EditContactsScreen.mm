#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "EditContactsVC.h"

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
        process(kCreateSelected);
    }
}

void EditContactsScreen::itemPressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mItemSelected = i;
        process(kItemSelected);
    }
}

void EditContactsScreen::deletePressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mDeleteSelected = i;
        process(kDeleteSelected);
    }
}

void EditContactsScreen::refreshPressed()
{
    if (getState() == kIdle)
    {
        process(kRefreshSelected);
    }
}

#pragma mark Start / End / Invalid
void EditContactsScreen::startEntry()
{
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

    if (mSetContactsJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void EditContactsScreen::deleteLocalContactEntry()
{
    std::string email = InboxScreen::mContacts[mDeleteSelected].mObject["email"].mString;

    InboxScreen::mContactMap[email] = "";

    InboxScreen::mContacts.erase(InboxScreen::mContacts.begin() + (int)mDeleteSelected);
}

void EditContactsScreen::sendSetContactsToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "setContacts"));
    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress));

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
    tAlert("Error save contact details");
}

#pragma mark Sending messages to other machines
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
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerReloadTable; else
	if ((mState == kSendSetContactsToServer) && (evt == kFail)) return kShowErrorWithSetContacts; else
	if ((mState == kSendSetContactsToServer) && (evt == kSuccess)) return kWasSetContactsSuccessful; else
	if ((mState == kSetWaitForSetContacts) && (evt == kNext)) return kSendSetContactsToServer; else
	if ((mState == kShowErrorWithSetContacts) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
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
	process(msg.mEvent);
}

void EditContactsScreen::update(const URLLoaderEvent& msg)
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

void EditContactsScreen::update(const GCTEvent& msg)
{
    switch(getState())
    {
        case kShowErrorWithSetContacts:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
                case GCTEvent::kNoAlertPressed:     process(kNo); break;

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
