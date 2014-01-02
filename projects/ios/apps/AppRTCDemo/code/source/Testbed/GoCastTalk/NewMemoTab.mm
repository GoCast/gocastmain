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

#pragma mark Idle

void NewMemoTab::newMemoIdleEntry()
{
}

void NewMemoTab::recordMessageIdleEntry()
{
}

void NewMemoTab::groupsIdleEntry()
{
}

void NewMemoTab::contactsIdleEntry()
{
}

void NewMemoTab::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark UI

void NewMemoTab::pushContactsEntry()
{
    [gAppDelegateInstance pushContacts:1];
}

void NewMemoTab::pushGroupsEntry()
{
    [gAppDelegateInstance pushGroups:1];
}

void NewMemoTab::pushRecordMessageEntry()
{
    [gAppDelegateInstance pushRecordMessage:1];
}

void NewMemoTab::popWhateverEntry()
{
    [gAppDelegateInstance popNewMemo:true];
}

#pragma mark State wiring
void NewMemoTab::CallEntry()
{
	switch(mState)
	{
		case kContactsIdle: contactsIdleEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kGroupsIdle: groupsIdleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kNewMemoIdle: newMemoIdleEntry(); break;
		case kPopWhatever: popWhateverEntry(); break;
		case kPushContacts: pushContactsEntry(); break;
		case kPushGroups: pushGroupsEntry(); break;
		case kPushRecordMessage: pushRecordMessageEntry(); break;
		case kRecordMessageIdle: recordMessageIdleEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void NewMemoTab::CallExit()
{
}

int  NewMemoTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kContactsIdle) && (evt == kItemSelected)) return kPopWhatever; else
	if ((mState == kContactsIdle) && (evt == kPopHappened)) return kNewMemoIdle; else
	if ((mState == kGroupsIdle) && (evt == kItemSelected)) return kPopWhatever; else
	if ((mState == kGroupsIdle) && (evt == kPopHappened)) return kNewMemoIdle; else
	if ((mState == kNewMemoIdle) && (evt == kAddContactsPressed)) return kPushContacts; else
	if ((mState == kNewMemoIdle) && (evt == kAddGroupsPressed)) return kPushGroups; else
	if ((mState == kNewMemoIdle) && (evt == kItemSelected)) return kPushRecordMessage; else
	if ((mState == kPopWhatever) && (evt == kPopHappened)) return kNewMemoIdle; else
	if ((mState == kPushContacts) && (evt == kNext)) return kContactsIdle; else
	if ((mState == kPushGroups) && (evt == kNext)) return kGroupsIdle; else
	if ((mState == kPushRecordMessage) && (evt == kNext)) return kRecordMessageIdle; else
	if ((mState == kRecordMessageIdle) && (evt == kItemSelected)) return kPopWhatever; else
	if ((mState == kRecordMessageIdle) && (evt == kPopHappened)) return kNewMemoIdle; else
	if ((mState == kStart) && (evt == kNext)) return kNewMemoIdle;

	return kInvalidState;
}

bool NewMemoTab::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPushContacts:
		case kPushGroups:
		case kPushRecordMessage:
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
            case GCTEvent::kPop: process(kPopHappened); break;

            default:
                break;
        }
    }
}

