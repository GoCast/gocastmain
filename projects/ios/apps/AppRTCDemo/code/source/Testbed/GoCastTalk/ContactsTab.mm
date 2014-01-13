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
    mViewStack.push(kContacts);

    GCTEventManager::getInstance()->attach(this);

    [gAppDelegateInstance setNavigationBarTitle:"Contacts"];

    [gAppDelegateInstance setContactsViewVisible:true];
}

void ContactsTab::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void ContactsTab::contactsIdleEntry() { }
void ContactsTab::contactDetailsIdleEntry() { }
void ContactsTab::editContactsIdleEntry() { }
void ContactsTab::messageHistoryIdleEntry() { }
void ContactsTab::recordMessageIdleEntry() { }
void ContactsTab::changeRegisteredNameIdleEntry() { }

void ContactsTab::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Queries
void ContactsTab::whereAreWeOnTheStackEntry()
{
    mViewStack.pop();
    SetImmediateEvent(mViewStack.top());
}

#pragma mark UI
void ContactsTab::pushChangeRegisteredNameEntry()
{
    mViewStack.push(kChangeRegisteredName);
    [gAppDelegateInstance pushChangeRegisterdName:2];
}

void ContactsTab::pushContactDetailsEntry()
{
    mViewStack.push(kContactDetails);
    [gAppDelegateInstance pushContactDetails:2];
}

void ContactsTab::pushEditContactsEntry()
{
    mViewStack.push(kEditContacts);
    [gAppDelegateInstance pushEditContacts:2];
}

void ContactsTab::pushMessageHistoryEntry()
{
    mViewStack.push(kMessageHistory);
    [gAppDelegateInstance pushMessageHistory:2];
}

void ContactsTab::pushRecordMessageEntry()
{
    mViewStack.push(kRecordMessage);
    [gAppDelegateInstance pushRecordMessage:2];
}

void ContactsTab::popTabEntry()
{
    [gAppDelegateInstance popContacts:true];
}

#pragma mark State wiring
void ContactsTab::CallEntry()
{
	switch(mState)
	{
		case kChangeRegisteredNameIdle: changeRegisteredNameIdleEntry(); break;
		case kContactDetailsIdle: contactDetailsIdleEntry(); break;
		case kContactsIdle: contactsIdleEntry(); break;
		case kEditContactsIdle: editContactsIdleEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMessageHistoryIdle: messageHistoryIdleEntry(); break;
		case kPopTab: popTabEntry(); break;
		case kPushChangeRegisteredName: pushChangeRegisteredNameEntry(); break;
		case kPushContactDetails: pushContactDetailsEntry(); break;
		case kPushEditContacts: pushEditContactsEntry(); break;
		case kPushMessageHistory: pushMessageHistoryEntry(); break;
		case kPushRecordMessage: pushRecordMessageEntry(); break;
		case kRecordMessageIdle: recordMessageIdleEntry(); break;
		case kStart: startEntry(); break;
		case kWhereAreWeOnTheStack: whereAreWeOnTheStackEntry(); break;
		default: break;
	}
}

void ContactsTab::CallExit()
{
}

int  ContactsTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kChangeRegisteredNameIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kContactDetailsIdle) && (evt == kHistoryPressed)) return kPushMessageHistory; else
	if ((mState == kContactDetailsIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kContactDetailsIdle) && (evt == kReplyPressed)) return kPushRecordMessage; else
	if ((mState == kContactsIdle) && (evt == kEditPressed)) return kPushEditContacts; else
	if ((mState == kContactsIdle) && (evt == kItemSelected)) return kPushContactDetails; else
	if ((mState == kEditContactsIdle) && (evt == kItemSelected)) return kPushChangeRegisteredName; else
	if ((mState == kEditContactsIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kMessageHistoryIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kMessageHistoryIdle) && (evt == kReplyPressed)) return kPushRecordMessage; else
	if ((mState == kPopTab) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kPushChangeRegisteredName) && (evt == kNext)) return kChangeRegisteredNameIdle; else
	if ((mState == kPushContactDetails) && (evt == kNext)) return kContactDetailsIdle; else
	if ((mState == kPushEditContacts) && (evt == kNext)) return kEditContactsIdle; else
	if ((mState == kPushMessageHistory) && (evt == kNext)) return kMessageHistoryIdle; else
	if ((mState == kPushRecordMessage) && (evt == kNext)) return kRecordMessageIdle; else
	if ((mState == kRecordMessageIdle) && (evt == kItemSelected)) return kPopTab; else
	if ((mState == kRecordMessageIdle) && (evt == kPopHappened)) return kWhereAreWeOnTheStack; else
	if ((mState == kStart) && (evt == kNext)) return kContactsIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kChangeRegisteredName)) return kChangeRegisteredNameIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kContactDetails)) return kContactDetailsIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kContacts)) return kContactsIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kEditContacts)) return kEditContactsIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kMessageHistory)) return kMessageHistoryIdle; else
	if ((mState == kWhereAreWeOnTheStack) && (evt == kRecordMessage)) return kRecordMessageIdle;

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

