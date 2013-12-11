#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
NewMemoScreen::NewMemoScreen()
{
	ConstructMachine();
}

NewMemoScreen::~NewMemoScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void NewMemoScreen::startEntry()
{
    [gAppDelegateInstance setNavigationBarTitle:"New Memo"];
    [gAppDelegateInstance setNewMemoViewVisible:true];
}

void NewMemoScreen::endEntry()
{
    [gAppDelegateInstance setNewMemoViewVisible:false];
}

void NewMemoScreen::idleEntry()
{
}

void NewMemoScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void NewMemoScreen::CallEntry()
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

void NewMemoScreen::CallExit()
{
}

int  NewMemoScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool NewMemoScreen::HasEdgeNamedNext() const
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
void NewMemoScreen::update(const NewMemoScreenMessage& msg)
{
	process(msg.mEvent);
}

void NewMemoScreen::update(const GCTEvent &msg)
{
#pragma unused(msg)
}

