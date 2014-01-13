#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
InboxTab::InboxTab()
{
	ConstructMachine();
}

InboxTab::~InboxTab()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void InboxTab::startEntry()
{
    GCTEventManager::getInstance()->attach(this);
    [gAppDelegateInstance setNavigationBarTitle:"Inbox"];

    mViewStack.push(kInbox);
}

void InboxTab::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

#pragma mark Idling
void InboxTab::inboxIdleEntry()
{
}

void InboxTab::inboxMessageIdleEntry()
{
}

void InboxTab::messageHistoryIdleEntry()
{
}

void InboxTab::recordMessageIdleEntry()
{
}

#pragma mark Queries
void InboxTab::whereAreWeOnTheStackEntry()
{
    mViewStack.pop();
    SetImmediateEvent(mViewStack.top());
}

#pragma mark Push Pop UI
void InboxTab::pushInboxMessageEntry()
{
    mViewStack.push(kInboxMessage);
    [gAppDelegateInstance pushInboxMessage:0];
}

void InboxTab::pushMessageHistoryEntry()
{
    mViewStack.push(kMessageHistory);
    [gAppDelegateInstance pushMessageHistory:0];
}

void InboxTab::pushRecordMessageEntry()
{
    mViewStack.push(kRecordMessage);
    [gAppDelegateInstance pushRecordMessage:0];
}

void InboxTab::popTabEntry()
{
    [gAppDelegateInstance popInbox:true];
}

void InboxTab::showConfirmDeleteEntry()
{
    tConfirm("Delete this message?");
}

void InboxTab::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void InboxTab::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kInboxIdle: inboxIdleEntry(); break;
		case kInboxMessageIdle: inboxMessageIdleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMessageHistoryIdle: messageHistoryIdleEntry(); break;
		case kPopTab: popTabEntry(); break;
		case kPushInboxMessage: pushInboxMessageEntry(); break;
		case kPushMessageHistory: pushMessageHistoryEntry(); break;
		case kPushRecordMessage: pushRecordMessageEntry(); break;
		case kRecordMessageIdle: recordMessageIdleEntry(); break;
		case kShowConfirmDelete: showConfirmDeleteEntry(); break;
		case kStart: startEntry(); break;
		case kWhereAreWeOnTheStack: whereAreWeOnTheStackEntry(); break;
		default: break;
	}
}

void InboxTab::CallExit()
{
}

int  InboxTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kInboxIdle) && (evt == kItemSelected)) return kPushInboxMessage; else
	if ((mState == kInboxMessageIdle) && (evt == kDeletePressed)) return kShowConfirmDelete; else
	if ((mState == kInboxMessageIdle) && (evt == kHistoryPressed)) return kPushMessageHistory; else
	if ((mState == kInboxMessageIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kInboxMessageIdle) && (evt == kReplyPressed)) return kPushRecordMessage; else
	if ((mState == kMessageHistoryIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kMessageHistoryIdle) && (evt == kReplyPressed)) return kPushRecordMessage; else
	if ((mState == kPopTab) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kPushInboxMessage) && (evt == kNext)) return kInboxMessageIdle; else
	if ((mState == kPushMessageHistory) && (evt == kNext)) return kMessageHistoryIdle; else
	if ((mState == kPushRecordMessage) && (evt == kNext)) return kRecordMessageIdle; else
	if ((mState == kRecordMessageIdle) && (evt == kItemSelected)) return kPopTab; else
	if ((mState == kRecordMessageIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kShowConfirmDelete) && (evt == kNo)) return kInboxMessageIdle; else
	if ((mState == kShowConfirmDelete) && (evt == kYes)) return kPopTab; else
	if ((mState == kStart) && (evt == kNext)) return kInboxIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kInbox)) return kInboxIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kInboxMessage)) return kInboxMessageIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kMessageHistory)) return kMessageHistoryIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kRecordMessage)) return kRecordMessageIdle;

	return kInvalidState;
}

bool InboxTab::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPushInboxMessage:
		case kPushMessageHistory:
		case kPushRecordMessage:
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void InboxTab::update(const InboxTabMessage& msg)
{
	process(msg.mEvent);
}

void InboxTab::update(const GCTEvent &msg)
{
    if (mActiveTab)
    {
        switch (msg.mEvent)
        {
            case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
            case GCTEvent::kNoAlertPressed:     process(kNo); break;

            case GCTEvent::kPop:                process(kPopHappened); break;

            case GCTEvent::kTableItemSelected:
                if (getState() == kInboxIdle)
                {
                    if (msg.mItemSelected == 0)
                    {
                        process(kItemSelected);
                    }
                }
                else if (getState() == kRecordMessageIdle)
                {
                    process(kItemSelected);
                }
                else if (getState() == kInboxMessageIdle)
                {
                    if (msg.mItemSelected == 0)
                    {
                        process(kHistoryPressed);
                    }
                    else if (msg.mItemSelected == 1)
                    {
                        process(kReplyPressed);
                    }
                    else if (msg.mItemSelected == 2)
                    {
                        process(kDeletePressed);
                    }
                }
                else if (getState() == kMessageHistoryIdle)
                {
                    process(kReplyPressed);
                }
                break;
                
            default:
                break;
        }
    }
}

