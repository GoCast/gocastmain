#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
ContactsScreen::ContactsScreen()
{
	ConstructMachine();
}

ContactsScreen::~ContactsScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void ContactsScreen::startEntry()
{
    [gAppDelegateInstance setNavigationBarTitle:"Contacts"];
}

void ContactsScreen::endEntry()
{
}

void ContactsScreen::idleEntry()
{
}

void ContactsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void ContactsScreen::CallEntry()
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

void ContactsScreen::CallExit()
{
}

int  ContactsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool ContactsScreen::HasEdgeNamedNext() const
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
void ContactsScreen::update(const ContactsScreenMessage& msg)
{
	process(msg.mEvent);
}

void ContactsScreen::update(const GCTEvent &msg)
{
#pragma unused(msg)
}

