#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "CreateContactVC.h"

#pragma mark Constructor / Destructor
CreateContactScreen::CreateContactScreen(CreateContactVC* newVC)
:   mPeer(newVC)
{
	ConstructMachine();
}

CreateContactScreen::~CreateContactScreen()
{
	DestructMachine();
}

#pragma mark Public methods

void CreateContactScreen::savePressed(const JSONObject& saveObject)
{
    mSaveObject = saveObject;

    update(CreateContactScreenMessage(kSaveSelected));
}

#pragma mark Start / End / Invalid
void CreateContactScreen::startEntry()
{
    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);
}

void CreateContactScreen::endEntry()
{
}

void CreateContactScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void CreateContactScreen::idleEntry()
{

}

#pragma mark Peer communication
void CreateContactScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

#pragma mark Queries
void CreateContactScreen::wasSetContactsSuccessfulEntry()
{
    bool result = false;

    if (mSetContactsJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void CreateContactScreen::sendSetContactsToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "setContacts"));
    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress));

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "10485760"));

    tFile(tFile::kTemporaryDirectory, "contacts.json").write(JSONValue(InboxScreen::mContacts).toString());

    URLLoader::getInstance()->postFile(this, kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "contacts.json"));
}

void CreateContactScreen::addToContactsEntry()
{
    InboxScreen::mContacts.push_back(mSaveObject);
    InboxScreen::mContactMap[mSaveObject["email"].mString] = mSaveObject["kanji"].mString;
}

#pragma mark UI
void CreateContactScreen::setWaitForSetContactsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void CreateContactScreen::showErrorWithSetContactsEntry()
{
    tAlert("Error save contact details");
}

#pragma mark Sending messages to other machines
void CreateContactScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void CreateContactScreen::CallEntry()
{
	switch(mState)
	{
		case kAddToContacts: addToContactsEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSendSetContactsToServer: sendSetContactsToServerEntry(); break;
		case kSetWaitForSetContacts: setWaitForSetContactsEntry(); break;
		case kShowErrorWithSetContacts: showErrorWithSetContactsEntry(); break;
		case kStart: startEntry(); break;
		case kWasSetContactsSuccessful: wasSetContactsSuccessfulEntry(); break;
		default: break;
	}
}

void CreateContactScreen::CallExit()
{
}

int  CreateContactScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kAddToContacts) && (evt == kNext)) return kSetWaitForSetContacts; else
	if ((mState == kIdle) && (evt == kSaveSelected)) return kAddToContacts; else
	if ((mState == kPeerPopSelf) && (evt == kNext)) return kIdle; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSendSetContactsToServer) && (evt == kFail)) return kShowErrorWithSetContacts; else
	if ((mState == kSendSetContactsToServer) && (evt == kSuccess)) return kWasSetContactsSuccessful; else
	if ((mState == kSetWaitForSetContacts) && (evt == kNext)) return kSendSetContactsToServer; else
	if ((mState == kShowErrorWithSetContacts) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kNo)) return kShowErrorWithSetContacts; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kYes)) return kSendReloadInboxToVC;

	return kInvalidState;
}

bool CreateContactScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kAddToContacts:
		case kPeerPopSelf:
		case kSendReloadInboxToVC:
		case kSetWaitForSetContacts:
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void CreateContactScreen::update(const CreateContactScreenMessage& msg)
{
	process(msg.mEvent);
}

void CreateContactScreen::update(const URLLoaderEvent& msg)
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

void CreateContactScreen::update(const GCTEvent& msg)
{
    switch (getState())
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
            
        default:
            break;
    }
}

