#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
SettingsTab::SettingsTab()
{
	ConstructMachine();
}

SettingsTab::~SettingsTab()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void SettingsTab::startEntry()
{
    GCTEventManager::getInstance()->attach(this);
    [gAppDelegateInstance setNavigationBarTitle:"Settings"];
}

void SettingsTab::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void SettingsTab::settingsViewEntry()
{
    [gAppDelegateInstance setSettingsViewVisible:true];
}

void SettingsTab::settingsViewExit()
{
    [gAppDelegateInstance setSettingsViewVisible:false];
}

void SettingsTab::changeRegisteredNameViewEntry()
{
    [gAppDelegateInstance setChangeRegisteredNameViewVisible:true];
}

void SettingsTab::changeRegisteredNameViewExit()
{
    [gAppDelegateInstance setChangeRegisteredNameViewVisible:false];
}

void SettingsTab::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void SettingsTab::CallEntry()
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

void SettingsTab::CallExit()
{
	switch(mState)
	{
		case kChangeRegisteredNameView: changeRegisteredNameViewExit(); break;
		case kSettingsView: settingsViewExit(); break;
		default: break;
	}
}

int  SettingsTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kSettingsView) && (evt == kItemSelected)) return kChangeRegisteredNameView; else
	if ((mState == kStart) && (evt == kNext)) return kSettingsView;

	return kInvalidState;
}

bool SettingsTab::HasEdgeNamedNext() const
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
void SettingsTab::update(const SettingsTabMessage& msg)
{
	process(msg.mEvent);
}

void SettingsTab::update(const GCTEvent &msg)
{
    if (mActiveTab)
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
}

