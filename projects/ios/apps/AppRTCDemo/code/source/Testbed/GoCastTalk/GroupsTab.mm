#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
GroupsTab::GroupsTab()
{
	ConstructMachine();
}

GroupsTab::~GroupsTab()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void GroupsTab::startEntry()
{
    [gAppDelegateInstance setNavigationBarTitle:"Groups"];
    [gAppDelegateInstance setGroupsViewVisible:true];
}

void GroupsTab::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void GroupsTab::idleEntry()
{
}

void GroupsTab::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void GroupsTab::CallEntry()
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

void GroupsTab::CallExit()
{
}

int  GroupsTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool GroupsTab::HasEdgeNamedNext() const
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
void GroupsTab::update(const GroupsTabMessage& msg)
{
	process(msg.mEvent);
}

void GroupsTab::update(const GCTEvent &msg)
{
#pragma unused(msg)
    if (mActiveTab)
    {

    }
}

