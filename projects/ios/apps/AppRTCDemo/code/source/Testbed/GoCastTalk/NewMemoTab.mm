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

    mViewStack.push(kNewMemo);
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

#pragma mark Queries
void NewMemoTab::whereAreWeOnTheStackEntry()
{
    mViewStack.pop();
    SetImmediateEvent(mViewStack.top());
}

#pragma mark UI

void NewMemoTab::pushContactsEntry()
{
    mViewStack.push(kContacts);
    [gAppDelegateInstance pushContacts:1];
}

void NewMemoTab::pushGroupsEntry()
{
    mViewStack.push(kGroups);
    [gAppDelegateInstance pushGroups:1];
}

void NewMemoTab::pushRecordMessageEntry()
{
    mViewStack.push(kRecordMessage);
    [gAppDelegateInstance pushRecordMessage:1];
}

void NewMemoTab::popTabEntry()
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
		case kPopTab: popTabEntry(); break;
		case kPushContacts: pushContactsEntry(); break;
		case kPushGroups: pushGroupsEntry(); break;
		case kPushRecordMessage: pushRecordMessageEntry(); break;
		case kRecordMessageIdle: recordMessageIdleEntry(); break;
		case kStart: startEntry(); break;
		case kWhereAreWeOnTheStack: whereAreWeOnTheStackEntry(); break;
		default: break;
	}
}

void NewMemoTab::CallExit()
{
}

int  NewMemoTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kContactsIdle) && (evt == kItemSelected)) return kPopTab; else
	if ((mState == kContactsIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kGroupsIdle) && (evt == kItemSelected)) return kPopTab; else
	if ((mState == kGroupsIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kNewMemoIdle) && (evt == kAddContactsPressed)) return kPushContacts; else
	if ((mState == kNewMemoIdle) && (evt == kAddGroupsPressed)) return kPushGroups; else
	if ((mState == kNewMemoIdle) && (evt == kItemSelected)) return kPushRecordMessage; else
	if ((mState == kPopTab) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kPushContacts) && (evt == kNext)) return kContactsIdle; else
	if ((mState == kPushGroups) && (evt == kNext)) return kGroupsIdle; else
	if ((mState == kPushRecordMessage) && (evt == kNext)) return kRecordMessageIdle; else
	if ((mState == kRecordMessageIdle) && (evt == kItemSelected)) return kPopTab; else
	if ((mState == kRecordMessageIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kStart) && (evt == kNext)) return kNewMemoIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kContacts)) return kContactsIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kGroups)) return kGroupsIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kNewMemo)) return kNewMemoIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kRecordMessage)) return kRecordMessageIdle;

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

