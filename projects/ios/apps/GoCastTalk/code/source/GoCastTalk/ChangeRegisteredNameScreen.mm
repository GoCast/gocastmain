#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "ChangeRegisteredNameVC.h"

#define kScreenName "ChangeRegisteredName"

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
    GoogleAnalytics::getInstance()->trackScreenEntry(kScreenName);

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
void ChangeRegisteredNameScreen::sendSetContactsToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "setContacts"));
    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress));
    params.push_back(std::pair<std::string, std::string>("authToken", InboxScreen::mToken));

    tFile(tFile::kTemporaryDirectory, "contacts.json").write(JSONValue(InboxScreen::mContacts).toString());

    URLLoader::getInstance()->postFile(this, kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "contacts.json"));
}

void ChangeRegisteredNameScreen::updateGlobalContactsEntry()
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
    }
}

#pragma mark UI
void ChangeRegisteredNameScreen::setWaitForSetContactsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void ChangeRegisteredNameScreen::showErrorWithSetContactsEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showErrorWithSetContactsEntry");
    tAlert("Error saving contact details");
}

#pragma mark Sending messages to other machines
void ChangeRegisteredNameScreen::sendForceLogoutToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kForceLogout));
}

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
		case kSendForceLogoutToVC: sendForceLogoutToVCEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSendSetContactsToServer: sendSetContactsToServerEntry(); break;
		case kSetWaitForSetContacts: setWaitForSetContactsEntry(); break;
		case kShowErrorWithSetContacts: showErrorWithSetContactsEntry(); break;
		case kStart: startEntry(); break;
		case kUpdateGlobalContacts: updateGlobalContactsEntry(); break;
		case kWasSetContactsSuccessful: wasSetContactsSuccessfulEntry(); break;
		default: break;
	}
}

void ChangeRegisteredNameScreen::CallExit()
{
}

int  ChangeRegisteredNameScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kSaveSelected)) return kUpdateGlobalContacts; else
	if ((mState == kPeerPopSelf) && (evt == kNext)) return kIdle; else
	if ((mState == kSendForceLogoutToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSendSetContactsToServer) && (evt == kFail)) return kShowErrorWithSetContacts; else
	if ((mState == kSendSetContactsToServer) && (evt == kSuccess)) return kWasSetContactsSuccessful; else
	if ((mState == kSetWaitForSetContacts) && (evt == kNext)) return kSendSetContactsToServer; else
	if ((mState == kShowErrorWithSetContacts) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kUpdateGlobalContacts) && (evt == kNext)) return kSetWaitForSetContacts; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kNo)) return kShowErrorWithSetContacts; else
	if ((mState == kWasSetContactsSuccessful) && (evt == kYes)) return kSendReloadInboxToVC;

	return kInvalidState;
}

bool ChangeRegisteredNameScreen::HasEdgeNamedNext() const
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
void ChangeRegisteredNameScreen::update(const ChangeRegisteredNameScreenMessage& msg)
{
    switch (msg.mEvent)
    {
        case kSaveSelected: GoogleAnalytics::getInstance()->trackButton(kScreenName, "kSaveSelected"); break;
        default: break;
    }

	process(msg.mEvent);
}

void ChangeRegisteredNameScreen::update(const URLLoaderEvent& msg)
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

void ChangeRegisteredNameScreen::update(const GCTEvent& msg)
{
    if (msg.mEvent == GCTEvent::kLanguageChanged)
    {
        [mPeer refreshLanguage];
    }

    switch (getState())
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
            
        default:
            break;
    }
}

