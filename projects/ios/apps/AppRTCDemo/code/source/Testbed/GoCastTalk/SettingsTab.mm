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
    mViewStack.push(kSettings);

    GCTEventManager::getInstance()->attach(this);
    [gAppDelegateInstance setNavigationBarTitle:"Settings"];
}

void SettingsTab::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

#pragma mark Idle

void SettingsTab::settingsIdleEntry() { }
void SettingsTab::changeRegisteredNameIdleEntry() { }

void SettingsTab::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Queries
void SettingsTab::whereAreWeOnTheStackEntry()
{
    mViewStack.pop();
    SetImmediateEvent(mViewStack.top());
}

#pragma mark UI

void SettingsTab::pushChangeRegisteredNameEntry()
{
    mViewStack.push(kChangeRegisteredName);
    [gAppDelegateInstance pushChangeRegisterdName:4];
}

#pragma mark State wiring
void SettingsTab::CallEntry()
{
	switch(mState)
	{
		case kChangeRegisteredNameIdle: changeRegisteredNameIdleEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPushChangeRegisteredName: pushChangeRegisteredNameEntry(); break;
		case kSettingsIdle: settingsIdleEntry(); break;
		case kStart: startEntry(); break;
		case kWhereAreWeOnTheStack: whereAreWeOnTheStackEntry(); break;
		default: break;
	}
}

void SettingsTab::CallExit()
{
}

int  SettingsTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kChangeRegisteredNameIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kPushChangeRegisteredName) && (evt == kNext)) return kChangeRegisteredNameIdle; else
	if ((mState == kSettingsIdle) && (evt == kItemSelected)) return kPushChangeRegisteredName; else
	if ((mState == kStart) && (evt == kNext)) return kSettingsIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kChangeRegisteredName)) return kChangeRegisteredNameIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kSettings)) return kSettingsIdle;

	return kInvalidState;
}

bool SettingsTab::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPushChangeRegisteredName:
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
            case GCTEvent::kPop: process(kPopHappened); break;

            case GCTEvent::kTableItemSelected:
                if (getState() == kSettingsIdle)
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

