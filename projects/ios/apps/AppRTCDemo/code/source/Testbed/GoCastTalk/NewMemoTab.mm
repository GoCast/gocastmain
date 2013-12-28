#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
NewMemoTab::NewMemoTab()
{
	ConstructMachine();
}

NewMemoTab::~NewMemoTab()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void NewMemoTab::startEntry()
{
    GCTEventManager::getInstance()->attach(this);

    [gAppDelegateInstance setNavigationBarTitle:"New Memo"];
}

void NewMemoTab::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void NewMemoTab::newMemoViewEntry()
{
    [gAppDelegateInstance setNewMemoViewVisible:true];
}

void NewMemoTab::newMemoViewExit()
{
    [gAppDelegateInstance setNewMemoViewVisible:false];
}

void NewMemoTab::recordMessageViewEntry()
{
    [gAppDelegateInstance setRecordMessageViewVisible:true];
}

void NewMemoTab::recordMessageViewExit()
{
    [gAppDelegateInstance setRecordMessageViewVisible:false];
}

void NewMemoTab::contactsViewEntry()
{
    [gAppDelegateInstance setContactsViewVisible:true];
}

void NewMemoTab::contactsViewExit()
{
    [gAppDelegateInstance setContactsViewVisible:false];
}

void NewMemoTab::groupsViewEntry()
{
    [gAppDelegateInstance setGroupsViewVisible:true];
}

void NewMemoTab::groupsViewExit()
{
    [gAppDelegateInstance setGroupsViewVisible:false];
}

void NewMemoTab::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void NewMemoTab::CallEntry()
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

void NewMemoTab::CallExit()
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

int  NewMemoTab::StateTransitionFunction(const int evt) const
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

bool NewMemoTab::HasEdgeNamedNext() const
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
void NewMemoTab::update(const NewMemoTabMessage& msg)
{
	process(msg.mEvent);
}

void NewMemoTab::update(const GCTEvent &msg)
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

