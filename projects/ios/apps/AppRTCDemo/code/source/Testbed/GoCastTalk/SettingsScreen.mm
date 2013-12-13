#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
SettingsScreen::SettingsScreen()
{
	ConstructMachine();
}

SettingsScreen::~SettingsScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void SettingsScreen::startEntry()
{
    GCTEventManager::getInstance()->attach(this);
    [gAppDelegateInstance setNavigationBarTitle:"Settings"];
}

void SettingsScreen::endEntry()
{
    [gAppDelegateInstance setSettingsViewVisible:false];
    [gAppDelegateInstance setChangeRegisteredNameViewVisible:false];
}

void SettingsScreen::settingsViewEntry()
{
    [gAppDelegateInstance setSettingsViewVisible:true];
}

void SettingsScreen::settingsViewExit()
{
    [gAppDelegateInstance setSettingsViewVisible:false];
}

void SettingsScreen::changeRegisteredNameViewEntry()
{
    [gAppDelegateInstance setChangeRegisteredNameViewVisible:true];
}

void SettingsScreen::changeRegisteredNameViewExit()
{
    [gAppDelegateInstance setChangeRegisteredNameViewVisible:false];
}

void SettingsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void SettingsScreen::CallEntry()
{
	switch(mState)
	{
		case kChangeRegisteredNameView: changeRegisteredNameViewEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kSettingsView: settingsViewEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void SettingsScreen::CallExit()
{
	switch(mState)
	{
		case kChangeRegisteredNameView: changeRegisteredNameViewExit(); break;
		case kSettingsView: settingsViewExit(); break;
		default: break;
	}
}

int  SettingsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kSettingsView) && (evt == kItemSelected)) return kChangeRegisteredNameView; else
	if ((mState == kStart) && (evt == kNext)) return kSettingsView;

	return kInvalidState;
}

bool SettingsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
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

void SettingsScreen::update(const GCTEvent &msg)
{
    switch (msg.mEvent)
    {
        case GCTEvent::kTableItemSelected:
            if (getState() == kSettingsView)
            {
                if (msg.mItemSelected == 0)
                {
                    process(kItemSelected);
                }
            }
            break;

        default:
            break;
    }
}

