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

    mCameFromMessageHistory = false;
}

void InboxTab::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

#pragma mark Idling
void InboxTab::inboxIdleEntry()
{
    mCameFromMessageHistory = false;
}

void InboxTab::inboxMessageIdleEntry()
{
}

void InboxTab::messageHistoryIdleEntry()
{
    mCameFromMessageHistory = true;
}

void InboxTab::recordMessageIdleEntry()
{
}

#pragma mark Queries
void InboxTab::didWeComeFromMessageHistoryEntry()
{
    SetImmediateEvent(mCameFromMessageHistory ? kYes : kNo);
}

#pragma mark Push Pop UI
void InboxTab::pushInboxMessageEntry()
{
    [gAppDelegateInstance pushInboxMessage];
}

void InboxTab::pushMessageHistoryEntry()
{
    [gAppDelegateInstance pushMessageHistory];
}

void InboxTab::pushRecordMessageEntry()
{
    [gAppDelegateInstance pushRecordMessage];
}

void InboxTab::popInboxMessageEntry()
{
    [gAppDelegateInstance pop:true];
}

void InboxTab::popIfWeCameFromMessageHistoryEntry()
{
    if (mCameFromMessageHistory)
    {
        [gAppDelegateInstance pop:false];
    }
    else
    {
        process(kPopHappened);
    }
}

void InboxTab::popRecordMessageEntry()
{
    [gAppDelegateInstance pop:false];
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
		case kDidWeComeFromMessageHistory: didWeComeFromMessageHistoryEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kInboxIdle: inboxIdleEntry(); break;
		case kInboxMessageIdle: inboxMessageIdleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMessageHistoryIdle: messageHistoryIdleEntry(); break;
		case kPopIfWeCameFromMessageHistory: popIfWeCameFromMessageHistoryEntry(); break;
		case kPopInboxMessage: popInboxMessageEntry(); break;
		case kPopRecordMessage: popRecordMessageEntry(); break;
		case kPushInboxMessage: pushInboxMessageEntry(); break;
		case kPushMessageHistory: pushMessageHistoryEntry(); break;
		case kPushRecordMessage: pushRecordMessageEntry(); break;
		case kRecordMessageIdle: recordMessageIdleEntry(); break;
		case kShowConfirmDelete: showConfirmDeleteEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void InboxTab::CallExit()
{
}

int  InboxTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kDidWeComeFromMessageHistory) && (evt == kNo)) return kInboxMessageIdle; else
	if ((mState == kDidWeComeFromMessageHistory) && (evt == kYes)) return kMessageHistoryIdle; else
	if ((mState == kInboxIdle) && (evt == kItemSelected)) return kPushInboxMessage; else
	if ((mState == kInboxMessageIdle) && (evt == kDeletePressed)) return kShowConfirmDelete; else
	if ((mState == kInboxMessageIdle) && (evt == kHistoryPressed)) return kPushMessageHistory; else
	if ((mState == kInboxMessageIdle) && (evt == kPopHappened)) return kInboxIdle; else
	if ((mState == kInboxMessageIdle) && (evt == kReplyPressed)) return kPushRecordMessage; else
	if ((mState == kMessageHistoryIdle) && (evt == kPopHappened)) return kInboxMessageIdle; else
	if ((mState == kMessageHistoryIdle) && (evt == kReplyPressed)) return kPushRecordMessage; else
	if ((mState == kPopIfWeCameFromMessageHistory) && (evt == kPopHappened)) return kInboxMessageIdle; else
	if ((mState == kPopInboxMessage) && (evt == kPopHappened)) return kInboxIdle; else
	if ((mState == kPopRecordMessage) && (evt == kPopHappened)) return kPopIfWeCameFromMessageHistory; else
	if ((mState == kPushInboxMessage) && (evt == kNext)) return kInboxMessageIdle; else
	if ((mState == kPushMessageHistory) && (evt == kNext)) return kMessageHistoryIdle; else
	if ((mState == kPushRecordMessage) && (evt == kNext)) return kRecordMessageIdle; else
	if ((mState == kRecordMessageIdle) && (evt == kItemSelected)) return kPopRecordMessage; else
	if ((mState == kRecordMessageIdle) && (evt == kPopHappened)) return kDidWeComeFromMessageHistory; else
	if ((mState == kShowConfirmDelete) && (evt == kNo)) return kInboxMessageIdle; else
	if ((mState == kShowConfirmDelete) && (evt == kYes)) return kPopInboxMessage; else
	if ((mState == kStart) && (evt == kNext)) return kInboxIdle;

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

