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
    [gAppDelegateInstance setNavigationBarTitle:"Settings"];
    [gAppDelegateInstance setSettingsViewVisible:true];
}

void SettingsScreen::endEntry()
{
    [gAppDelegateInstance setSettingsViewVisible:false];
}

void SettingsScreen::idleEntry()
{
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
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void SettingsScreen::CallExit()
{
}

int  SettingsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kStart) && (evt == kNext)) return kIdle;

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
#pragma unused(msg)
}

