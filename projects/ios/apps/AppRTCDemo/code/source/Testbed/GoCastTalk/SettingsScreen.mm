#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "SettingsVC.h"

#pragma mark Constructor / Destructor
SettingsScreen::SettingsScreen(SettingsVC* newVC)
: mPeer(newVC)
{
	ConstructMachine();
}

SettingsScreen::~SettingsScreen()
{
	DestructMachine();
}

#pragma mark Public methods

void SettingsScreen::registeredNamePressed()
{
    update(SettingsScreenMessage(kRegisteredNameSelected));
}

void SettingsScreen::changePasswordPressed()
{
    update(SettingsScreenMessage(kChangePasswordSelected));
}

void SettingsScreen::logOutPressed()
{
    update(SettingsScreenMessage(kLogOutSelected));
}

void SettingsScreen::aboutThisAppPressed()
{
    update(SettingsScreenMessage(kAboutThisAppSelected));
}

#pragma mark Start / End / Invalid
void SettingsScreen::startEntry()
{
    GCTEventManager::getInstance()->attach(this);
}

void SettingsScreen::endEntry()
{
}

void SettingsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void SettingsScreen::idleEntry()
{
}

#pragma mark Peer Communication
void SettingsScreen::peerPushChangeRegisteredNameEntry()
{
    JSONObject initObject;

    for(size_t i = 0; i < InboxScreen::mContacts.size(); i++)
    {
        if (InboxScreen::mContacts[i].mObject["email"].mString == InboxScreen::mEmailAddress)
        {
            initObject = InboxScreen::mContacts[i].mObject;
            break;
        }
    }

    initObject["email"] = InboxScreen::mEmailAddress;

    [mPeer pushChangeRegisteredName:initObject];
}

#pragma mark UI
void SettingsScreen::showNotYetImplementedEntry()
{
    tAlert("Not yet implemented");
}

#pragma mark State wiring
void SettingsScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPushChangeRegisteredName: peerPushChangeRegisteredNameEntry(); break;
		case kShowNotYetImplemented: showNotYetImplementedEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void SettingsScreen::CallExit()
{
}

int  SettingsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kAboutThisAppSelected)) return kShowNotYetImplemented; else
	if ((mState == kIdle) && (evt == kChangePasswordSelected)) return kShowNotYetImplemented; else
	if ((mState == kIdle) && (evt == kLogOutSelected)) return kShowNotYetImplemented; else
	if ((mState == kIdle) && (evt == kRegisteredNameSelected)) return kPeerPushChangeRegisteredName; else
	if ((mState == kPeerPushChangeRegisteredName) && (evt == kNext)) return kIdle; else
	if ((mState == kShowNotYetImplemented) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool SettingsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPeerPushChangeRegisteredName:
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void SettingsScreen::update(const SettingsScreenMessage& msg)
{
	process(msg.mEvent);
}

void SettingsScreen::update(const GCTEvent& msg)
{
    switch(getState())
    {
        case kShowNotYetImplemented:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
//                case GCTEvent::kNoAlertPressed:     process(kNo); break;

                default:
                    break;
            }
            break;
    }
}

