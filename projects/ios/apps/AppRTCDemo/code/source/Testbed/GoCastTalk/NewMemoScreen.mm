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
    GCTEventManager::getInstance()->attach(this);

    [gAppDelegateInstance setNavigationBarTitle:"New Memo"];
}

void NewMemoScreen::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void NewMemoScreen::newMemoViewEntry()
{
    [gAppDelegateInstance setNewMemoViewVisible:true];
}

void NewMemoScreen::newMemoViewExit()
{
    [gAppDelegateInstance setNewMemoViewVisible:false];
}

void NewMemoScreen::recordMessageViewEntry()
{
    [gAppDelegateInstance setRecordMessageViewVisible:true];
}

void NewMemoScreen::recordMessageViewExit()
{
    [gAppDelegateInstance setRecordMessageViewVisible:false];
}

void NewMemoScreen::contactsViewEntry()
{
    [gAppDelegateInstance setContactsViewVisible:true];
}

void NewMemoScreen::contactsViewExit()
{
    [gAppDelegateInstance setContactsViewVisible:false];
}

void NewMemoScreen::groupsViewEntry()
{
    [gAppDelegateInstance setGroupsViewVisible:true];
}

void NewMemoScreen::groupsViewExit()
{
    [gAppDelegateInstance setGroupsViewVisible:false];
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
		case kContactsView: contactsViewEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kGroupsView: groupsViewEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kNewMemoView: newMemoViewEntry(); break;
		case kRecordMessageView: recordMessageViewEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void NewMemoScreen::CallExit()
{
	switch(mState)
	{
		case kContactsView: contactsViewExit(); break;
		case kGroupsView: groupsViewExit(); break;
		case kNewMemoView: newMemoViewExit(); break;
		case kRecordMessageView: recordMessageViewExit(); break;
		default: break;
	}
}

int  NewMemoScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kContactsView) && (evt == kItemSelected)) return kNewMemoView; else
	if ((mState == kGroupsView) && (evt == kItemSelected)) return kNewMemoView; else
	if ((mState == kNewMemoView) && (evt == kAddContactsPressed)) return kContactsView; else
	if ((mState == kNewMemoView) && (evt == kAddGroupsPressed)) return kGroupsView; else
	if ((mState == kNewMemoView) && (evt == kItemSelected)) return kRecordMessageView; else
	if ((mState == kRecordMessageView) && (evt == kItemSelected)) return kNewMemoView; else
	if ((mState == kStart) && (evt == kNext)) return kNewMemoView;

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
    if (mActiveTab)
    {
        switch (msg.mEvent)
        {
            case GCTEvent::kTableItemSelected: process(kItemSelected); break;
            case GCTEvent::kAddContactsButtonPressed: process(kAddContactsPressed); break;
            case GCTEvent::kAddGroupsButtonPressed: process(kAddGroupsPressed); break;

            default:
                break;
        }
    }
}

