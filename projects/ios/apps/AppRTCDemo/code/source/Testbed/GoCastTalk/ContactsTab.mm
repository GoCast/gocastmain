#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
ContactsTab::ContactsTab()
{
	ConstructMachine();
}

ContactsTab::~ContactsTab()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void ContactsTab::startEntry()
{
    GCTEventManager::getInstance()->attach(this);

    [gAppDelegateInstance setNavigationBarTitle:"Contacts"];

    [gAppDelegateInstance setContactsViewVisible:true];

    mStackSize = 0;
}

void ContactsTab::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void ContactsTab::contactsIdleEntry() { }
void ContactsTab::contactDetailsIdleEntry()
{
    mCameFromMessageHistory = false;
}
void ContactsTab::editContactsIdleEntry() { }
void ContactsTab::messageHistoryIdleEntry()
{
    mCameFromMessageHistory = true;
}
void ContactsTab::recordMessageIdleEntry() { }
void ContactsTab::changeRegisteredNameIdleEntry() { }

void ContactsTab::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Queries
void ContactsTab::didWeComeFromMessageHistoryEntry()
{
    SetImmediateEvent(mCameFromMessageHistory ? kYes : kNo);
}

#pragma mark UI
void ContactsTab::pushChangeRegisteredNameEntry()
{
    [gAppDelegateInstance pushChangeRegisterdName:2];
    mStackSize++;
}

void ContactsTab::pushContactDetailsEntry()
{
    [gAppDelegateInstance pushContactDetails:2];
    mStackSize++;
}

void ContactsTab::pushEditContactsEntry()
{
    [gAppDelegateInstance pushEditContacts:2];
    mStackSize++;
}

void ContactsTab::pushMessageHistoryEntry()
{
    [gAppDelegateInstance pushMessageHistory:2];
    mStackSize++;
}

void ContactsTab::pushRecordMessageEntry()
{
    [gAppDelegateInstance pushRecordMessage:2];
    mStackSize++;
}

void ContactsTab::popChangeRegisteredNameEntry()
{
    [gAppDelegateInstance popContacts:true];
    mStackSize--;
}

void ContactsTab::popTo0Entry()
{
    while (mStackSize != 0)
    {
        [gAppDelegateInstance popContacts:false];
        mStackSize--;
    }
}

#pragma mark State wiring
void ContactsTab::CallEntry()
{
	switch(mState)
	{
		case kChangeRegisteredNameIdle: changeRegisteredNameIdleEntry(); break;
		case kContactDetailsIdle: contactDetailsIdleEntry(); break;
		case kContactsIdle: contactsIdleEntry(); break;
		case kDidWeComeFromMessageHistory: didWeComeFromMessageHistoryEntry(); break;
		case kEditContactsIdle: editContactsIdleEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMessageHistoryIdle: messageHistoryIdleEntry(); break;
		case kPopChangeRegisteredName: popChangeRegisteredNameEntry(); break;
		case kPopTo0: popTo0Entry(); break;
		case kPushChangeRegisteredName: pushChangeRegisteredNameEntry(); break;
		case kPushContactDetails: pushContactDetailsEntry(); break;
		case kPushEditContacts: pushEditContactsEntry(); break;
		case kPushMessageHistory: pushMessageHistoryEntry(); break;
		case kPushRecordMessage: pushRecordMessageEntry(); break;
		case kRecordMessageIdle: recordMessageIdleEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void ContactsTab::CallExit()
{
}

int  ContactsTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kChangeRegisteredNameIdle) && (evt == kDonePressed)) return kPopChangeRegisteredName; else
	if ((mState == kChangeRegisteredNameIdle) && (evt == kPopHappened)) return kEditContactsIdle; else
	if ((mState == kContactDetailsIdle) && (evt == kHistoryPressed)) return kPushMessageHistory; else
	if ((mState == kContactDetailsIdle) && (evt == kPopHappened)) return kContactsIdle; else
	if ((mState == kContactDetailsIdle) && (evt == kReplyPressed)) return kPushRecordMessage; else
	if ((mState == kContactsIdle) && (evt == kEditPressed)) return kPushEditContacts; else
	if ((mState == kContactsIdle) && (evt == kItemSelected)) return kPushContactDetails; else
	if ((mState == kDidWeComeFromMessageHistory) && (evt == kNo)) return kContactDetailsIdle; else
	if ((mState == kDidWeComeFromMessageHistory) && (evt == kYes)) return kMessageHistoryIdle; else
	if ((mState == kEditContactsIdle) && (evt == kDonePressed)) return kPopTo0; else
	if ((mState == kEditContactsIdle) && (evt == kItemSelected)) return kPushChangeRegisteredName; else
	if ((mState == kEditContactsIdle) && (evt == kPopHappened)) return kContactsIdle; else
	if ((mState == kMessageHistoryIdle) && (evt == kPopHappened)) return kContactDetailsIdle; else
	if ((mState == kMessageHistoryIdle) && (evt == kReplyPressed)) return kPushRecordMessage; else
	if ((mState == kPopChangeRegisteredName) && (evt == kPopHappened)) return kEditContactsIdle; else
	if ((mState == kPopTo0) && (evt == kPopHappened)) return kContactsIdle; else
	if ((mState == kPushChangeRegisteredName) && (evt == kNext)) return kChangeRegisteredNameIdle; else
	if ((mState == kPushContactDetails) && (evt == kNext)) return kContactDetailsIdle; else
	if ((mState == kPushEditContacts) && (evt == kNext)) return kEditContactsIdle; else
	if ((mState == kPushMessageHistory) && (evt == kNext)) return kMessageHistoryIdle; else
	if ((mState == kPushRecordMessage) && (evt == kNext)) return kRecordMessageIdle; else
	if ((mState == kRecordMessageIdle) && (evt == kItemSelected)) return kPopTo0; else
	if ((mState == kRecordMessageIdle) && (evt == kPopHappened)) return kDidWeComeFromMessageHistory; else
	if ((mState == kStart) && (evt == kNext)) return kContactsIdle;

	return kInvalidState;
}

bool ContactsTab::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPushChangeRegisteredName:
		case kPushContactDetails:
		case kPushEditContacts:
		case kPushMessageHistory:
		case kPushRecordMessage:
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void ContactsTab::update(const ContactsTabMessage& msg)
{
	process(msg.mEvent);
}

void ContactsTab::update(const GCTEvent &msg)
{
    if (mActiveTab)
    {
        switch (msg.mEvent)
        {
            case GCTEvent::kPop: process(kPopHappened); break;

            case GCTEvent::kNavButtonPressed:
                if (getState() == kContactsIdle)
                {
                    process(kEditPressed);
                }
                else if (getState() == kEditContactsIdle)
                {
                    process(kDonePressed);
                }
                else if (getState() == kChangeRegisteredNameIdle)
                {
                    process(kDonePressed);
                }
                break;

            case GCTEvent::kTableItemSelected:
                if (getState() == kContactsIdle)
                {
                    process(kItemSelected);
                }
                else if (getState() == kEditContactsIdle)
                {
                    if (msg.mItemSelected == 0)
                    {
                        process(kItemSelected);
                    }
                }
                else if (getState() == kContactDetailsIdle)
                {
                    if (msg.mItemSelected == 0)
                    {
                        process(kHistoryPressed);
                    }
                    else if (msg.mItemSelected == 1)
                    {
                        process(kReplyPressed);
                    }
                }
                else if (getState() == kMessageHistoryIdle)
                {
                    process(kReplyPressed);
                }
                else if (getState() == kRecordMessageIdle)
                {
                    process(kItemSelected);
                }
                break;
                
            default:
                break;
        }
    }
}

