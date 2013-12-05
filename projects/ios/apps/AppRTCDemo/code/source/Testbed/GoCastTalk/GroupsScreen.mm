#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
GroupsScreen::GroupsScreen()
{
	ConstructMachine();
}

GroupsScreen::~GroupsScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void GroupsScreen::startEntry()
{
    [gAppDelegateInstance setNavigationBarTitle:"Groups"];
}

void GroupsScreen::endEntry()
{
}

void GroupsScreen::idleEntry()
{
}

void GroupsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void GroupsScreen::CallEntry()
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

void GroupsScreen::CallExit()
{
}

int  GroupsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool GroupsScreen::HasEdgeNamedNext() const
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
void GroupsScreen::update(const GroupsScreenMessage& msg)
{
	process(msg.mEvent);
}

void GroupsScreen::update(const GCTEvent &msg)
{
#pragma unused(msg)
}

