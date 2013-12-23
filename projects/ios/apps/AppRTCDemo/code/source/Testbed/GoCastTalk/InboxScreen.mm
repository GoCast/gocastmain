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
    GCTEventManager::getInstance()->attach(this);
    [gAppDelegateInstance setNavigationBarTitle:"Inbox"];
}

void InboxScreen::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

#pragma mark Idling
void InboxScreen::inboxIdleEntry() { }
void InboxScreen::inboxMessageIdleEntry() { }
void InboxScreen::messageHistoryIdleEntry() { }
void InboxScreen::recordMessageIdleEntry() { }

#pragma mark Push Pop UI
void InboxScreen::pushInboxMessageEntry()
{
    [gAppDelegateInstance pushInboxMessage];
}

void InboxScreen::pushMessageHistoryEntry()
{
    [gAppDelegateInstance pushMessageHistory];
}

void InboxScreen::pushRecordMessageEntry()
{
    [gAppDelegateInstance pushRecordMessage];
}

void InboxScreen::popInboxMessageEntry()
{
    
}

void InboxScreen::popMessageHistoryEntry()
{

}

void InboxScreen::popRecordMessageEntry()
{

}

void InboxScreen::showConfirmDeleteEntry()
{
    tConfirm("Delete this message?");
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
		case kInboxIdle: inboxIdleEntry(); break;
		case kInboxMessageIdle: inboxMessageIdleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMessageHistoryIdle: messageHistoryIdleEntry(); break;
		case kPopInboxMessage: popInboxMessageEntry(); break;
		case kPopMessageHistory: popMessageHistoryEntry(); break;
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

void InboxScreen::CallExit()
{
}

int  InboxScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kInboxIdle) && (evt == kItemSelected)) return kPushInboxMessage; else
	if ((mState == kInboxMessageIdle) && (evt == kDeletePressed)) return kShowConfirmDelete; else
	if ((mState == kInboxMessageIdle) && (evt == kHistoryPressed)) return kPushMessageHistory; else
	if ((mState == kInboxMessageIdle) && (evt == kReplyPressed)) return kRecordMessageIdle; else
	if ((mState == kMessageHistoryIdle) && (evt == kReplyPressed)) return kPushRecordMessage; else
	if ((mState == kPopInboxMessage) && (evt == kNext)) return kInboxIdle; else
	if ((mState == kPopMessageHistory) && (evt == kNext)) return kInboxMessageIdle; else
	if ((mState == kPopRecordMessage) && (evt == kNext)) return kPopMessageHistory; else
	if ((mState == kPushInboxMessage) && (evt == kNext)) return kInboxMessageIdle; else
	if ((mState == kPushMessageHistory) && (evt == kNext)) return kMessageHistoryIdle; else
	if ((mState == kPushRecordMessage) && (evt == kNext)) return kRecordMessageIdle; else
	if ((mState == kRecordMessageIdle) && (evt == kItemSelected)) return kPopRecordMessage; else
	if ((mState == kShowConfirmDelete) && (evt == kNo)) return kInboxMessageIdle; else
	if ((mState == kShowConfirmDelete) && (evt == kYes)) return kPopInboxMessage; else
	if ((mState == kStart) && (evt == kNext)) return kInboxIdle;

	return kInvalidState;
}

bool InboxScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kEnd:
		case kInboxIdle:
		case kInboxMessageIdle:
		case kInvalidState:
		case kMessageHistoryIdle:
		case kRecordMessageIdle:
		case kShowConfirmDelete:
			return false;
		default: break;
	}
	return true;
}

#pragma mark Messages
void InboxScreen::update(const InboxScreenMessage& msg)
{
	process(msg.mEvent);
}

void InboxScreen::update(const GCTEvent &msg)
{
    switch (msg.mEvent)
    {
        case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
        case GCTEvent::kNoAlertPressed:     process(kNo); break;

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

