#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "ContactsVC.h"

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
        process(kItemSelected);
    }
}

void ContactsScreen::groupPressed(const size_t& i)
{
#pragma unused(i)
    //TODO: Implement
}
void ContactsScreen::editPressed()
{
    if (getState() == kIdle)
    {
        process(kHelpPressed);
    }
}

void ContactsScreen::deletePressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mDeleteSelected = i;
        process(kDeleteSelected);
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

void ContactsScreen::peerPushEditContactsEntry()
{
    [mPeer pushEditContacts];
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

void ContactsScreen::wasSetContactsSuccessfulEntry()
{
    bool result = false;

    if (mSetContactsJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void ContactsScreen::deleteLocalContactEntry()
{
    std::string email = InboxScreen::mContacts[mDeleteSelected].mObject["email"].mString;

    InboxScreen::mContactMap[email] = "";

    InboxScreen::mContacts.erase(InboxScreen::mContacts.begin() + (int)mDeleteSelected);
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

#pragma mark UI
void ContactsScreen::setWaitForSetContactsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void ContactsScreen::showErrorWithSetContactsEntry()
{
    tAlert("Error save contact details");
}

#pragma mark Sending messages to other machines
void ContactsScreen::sendAppendNewContactToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kAppendNewContact, InboxScreen::mContacts[mItemSelected].mObject["email"].mString, mIdentifier));
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
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsThisAChildScreen: isThisAChildScreenEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kPeerPushChangeRegisteredName: peerPushChangeRegisteredNameEntry(); break;
		case kPeerPushEditContacts: peerPushEditContactsEntry(); break;
		case kPeerReloadTable: peerReloadTableEntry(); break;
		case kSendAppendNewContactToVC: sendAppendNewContactToVCEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSendSetContactsToServer: sendSetContactsToServerEntry(); break;
		case kSetWaitForSetContacts: setWaitForSetContactsEntry(); break;
		case kShowErrorWithSetContacts: showErrorWithSetContactsEntry(); break;
		case kStart: startEntry(); break;
		case kWasSetContactsSuccessful: wasSetContactsSuccessfulEntry(); break;
		default: break;
	}
}

void ContactsScreen::CallExit()
{
}

int  ContactsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDeleteLocalContact) && (evt == kNext)) return kSetWaitForSetContacts; else
	if ((mState == kIdle) && (evt == kDeleteSelected)) return kDeleteLocalContact; else
	if ((mState == kIdle) && (evt == kHelpPressed)) return kPeerPushEditContacts; else
	if ((mState == kIdle) && (evt == kItemSelected)) return kIsThisAChildScreen; else
	if ((mState == kIdle) && (evt == kRefreshSelected)) return kPeerReloadTable; else
	if ((mState == kIsThisAChildScreen) && (evt == kNo)) return kPeerPushChangeRegisteredName; else
	if ((mState == kIsThisAChildScreen) && (evt == kYes)) return kSendAppendNewContactToVC; else
	if ((mState == kPeerPushChangeRegisteredName) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerPushChangeRegisteredName) && (evt == kYes)) return kIdle; else
	if ((mState == kPeerPushEditContacts) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerReloadTable) && (evt == kNext)) return kIdle; else
	if ((mState == kSendAppendNewContactToVC) && (evt == kNext)) return kPeerPopSelf; else
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

bool ContactsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kEnd:
		case kIdle:
		case kInvalidState:
		case kIsThisAChildScreen:
		case kPeerPopSelf:
		case kSendSetContactsToServer:
		case kShowErrorWithSetContacts:
		case kWasSetContactsSuccessful:
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
    }
}

