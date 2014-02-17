#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "ChangeRegisteredNameVC.h"

#pragma mark Constructor / Destructor
ChangeRegisteredNameScreen::ChangeRegisteredNameScreen(ChangeRegisteredNameVC* newVC, const JSONObject& initObject)
:   mPeer(newVC),
    mInitObject(initObject)
{
	ConstructMachine();
}

ChangeRegisteredNameScreen::~ChangeRegisteredNameScreen()
{
	DestructMachine();
}

#pragma mark Public methods

void ChangeRegisteredNameScreen::savePressed(const JSONObject& initObject)
{
    mInitObject = initObject;

    update(ChangeRegisteredNameScreenMessage(kSaveSelected));
}

#pragma mark Start / End / Invalid
void ChangeRegisteredNameScreen::startEntry()
{
    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);
}

void ChangeRegisteredNameScreen::endEntry()
{
}

void ChangeRegisteredNameScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void ChangeRegisteredNameScreen::idleEntry()
{

}

#pragma mark Peer communication
void ChangeRegisteredNameScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

#pragma mark Queries
void ChangeRegisteredNameScreen::wasSetContactsSuccessfulEntry()
{
    bool result = false;

    if (mSetContactsJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void ChangeRegisteredNameScreen::sendSetContactsToServerEntry()
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

void ChangeRegisteredNameScreen::updateGlobalContactsAndContactmapEntry()
{
    bool found = false;

    for(size_t i = 0; i < InboxScreen::mContacts.size(); i++)
    {
        if (InboxScreen::mContacts[i].mObject["email"].mString == mInitObject["email"].mString)
        {
            InboxScreen::mContacts[i].mObject["kanji"]   = mInitObject["kanji"].mString;
            InboxScreen::mContacts[i].mObject["kana"]    = mInitObject["kana"].mString;

            found = true;
            break;
        }
    }

    if (!found)
    {
        InboxScreen::mContacts.push_back(mInitObject);
        InboxScreen::mContactMap[mInitObject["email"].mString] = mInitObject["kanji"].mString;
    }

    InboxScreen::mContactMap[mInitObject["email"].mString] = mInitObject["kanji"].mString;
}

#pragma mark UI
void ChangeRegisteredNameScreen::setWaitForSetContactsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void ChangeRegisteredNameScreen::showErrorWithSetContactsEntry()
{
    tAlert("Error save contact details");
}

#pragma mark Sending messages to other machines
void ChangeRegisteredNameScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void ChangeRegisteredNameScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSendSetContactsToServer: sendSetContactsToServerEntry(); break;
		case kSetWaitForSetContacts: setWaitForSetContactsEntry(); break;
		case kShowErrorWithSetContacts: showErrorWithSetContactsEntry(); break;
		case kStart: startEntry(); break;
		case kUpdateGlobalContactsAndContactmap: updateGlobalContactsAndContactmapEntry(); break;
		case kWasSetContactsSuccessful: wasSetContactsSuccessfulEntry(); break;
		default: break;
	}
}

void ChangeRegisteredNameScreen::CallExit()
{
}

int  ChangeRegisteredNameScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kSaveSelected)) return kUpdateGlobalContactsAndContactmap; else
	if ((mState == kPeerPopSelf) && (evt == kNext)) return kIdle; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSendSetContactsToServer) && (evt == kFail)) return kShowErrorWithSetContacts; else
	if ((mState == kSendSetContactsToServer) && (evt == kSuccess)) return kWasSetContactsSuccessful; else
	if ((mState == kSetWaitForSetContacts) && (evt == kNext)) return kSendSetContactsToServer; else
	if ((mState == kShowErrorWithSetContacts) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kUpdateGlobalContactsAndContactmap) && (evt == kNext)) return kSetWaitForSetContacts; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kNo)) return kShowErrorWithSetContacts; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kYes)) return kSendReloadInboxToVC;

	return kInvalidState;
}

bool ChangeRegisteredNameScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPeerPopSelf:
		case kSendReloadInboxToVC:
		case kSetWaitForSetContacts:
		case kStart:
		case kUpdateGlobalContactsAndContactmap:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void ChangeRegisteredNameScreen::update(const ChangeRegisteredNameScreenMessage& msg)
{
	process(msg.mEvent);
}

void ChangeRegisteredNameScreen::update(const URLLoaderEvent& msg)
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

void ChangeRegisteredNameScreen::update(const GCTEvent& msg)
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

