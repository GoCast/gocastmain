#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
ContactsScreen::ContactsScreen()
{
	ConstructMachine();
}

ContactsScreen::~ContactsScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void ContactsScreen::startEntry()
{
    GCTEventManager::getInstance()->attach(this);

    [gAppDelegateInstance setNavigationBarTitle:"Contacts"];
    [gAppDelegateInstance setContactsViewVisible:true];
}

void ContactsScreen::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void ContactsScreen::contactsViewEntry()
{
    [gAppDelegateInstance setContactsViewVisible:true];
}

void ContactsScreen::contactsViewExit()
{
    [gAppDelegateInstance setContactsViewVisible:false];
}

void ContactsScreen::contactDetailsViewEntry()
{
    [gAppDelegateInstance setContactDetailsViewVisible:true];
}

void ContactsScreen::contactDetailsViewExit()
{
    [gAppDelegateInstance setContactDetailsViewVisible:false];
}

void ContactsScreen::messageHistoryViewEntry()
{
    [gAppDelegateInstance setMessageHistoryViewVisible:true];
}

void ContactsScreen::messageHistoryViewExit()
{
    [gAppDelegateInstance setMessageHistoryViewVisible:false];
}

void ContactsScreen::recordMessageViewEntry()
{
    [gAppDelegateInstance setRecordMessageViewVisible:true];
}

void ContactsScreen::recordMessageViewExit()
{
    [gAppDelegateInstance setRecordMessageViewVisible:false];
}

void ContactsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void ContactsScreen::CallEntry()
{
	switch(mState)
	{
		case kContactDetailsView: contactDetailsViewEntry(); break;
		case kContactsView: contactsViewEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMessageHistoryView: messageHistoryViewEntry(); break;
		case kRecordMessageView: recordMessageViewEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void ContactsScreen::CallExit()
{
	switch(mState)
	{
		case kContactDetailsView: contactDetailsViewExit(); break;
		case kContactsView: contactsViewExit(); break;
		case kMessageHistoryView: messageHistoryViewExit(); break;
		case kRecordMessageView: recordMessageViewExit(); break;
		default: break;
	}
}

int  ContactsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kContactDetailsView) && (evt == kHistoryPressed)) return kMessageHistoryView; else
	if ((mState == kContactDetailsView) && (evt == kReplyPressed)) return kRecordMessageView; else
	if ((mState == kContactsView) && (evt == kItemSelected)) return kContactDetailsView; else
	if ((mState == kMessageHistoryView) && (evt == kReplyPressed)) return kRecordMessageView; else
	if ((mState == kRecordMessageView) && (evt == kItemSelected)) return kContactsView; else
	if ((mState == kStart) && (evt == kNext)) return kContactsView;

	return kInvalidState;
}

bool ContactsScreen::HasEdgeNamedNext() const
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
void ContactsScreen::update(const ContactsScreenMessage& msg)
{
	process(msg.mEvent);
}

void ContactsScreen::update(const GCTEvent &msg)
{
    switch (msg.mEvent)
    {
        case GCTEvent::kTableItemSelected:
            if (getState() == kContactsView)
            {
                if (msg.mItemSelected == 1)
                {
                    process(kItemSelected);
                }
            }
            else if (getState() == kContactDetailsView)
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
            else if (getState() == kMessageHistoryView)
            {
                process(kReplyPressed);
            }
            else if (getState() == kRecordMessageView)
            {
                process(kItemSelected);
            }
            break;

        default:
            break;
    }
}

