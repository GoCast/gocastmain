#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
InboxScreen::InboxScreen()
{
	ConstructMachine();
}

InboxScreen::~InboxScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void InboxScreen::startEntry()
{
    [gAppDelegateInstance setNavigationBarTitle:"Inbox"];
}

void InboxScreen::endEntry()
{
}

void InboxScreen::idleEntry()
{
}

void InboxScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void InboxScreen::CallEntry()
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

void InboxScreen::CallExit()
{
}

int  InboxScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool InboxScreen::HasEdgeNamedNext() const
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
void InboxScreen::update(const InboxScreenMessage& msg)
{
	process(msg.mEvent);
}

void InboxScreen::update(const GCTEvent &msg)
{
#pragma unused(msg)
}

