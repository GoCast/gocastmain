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
}

void ContactsTab::endEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void ContactsTab::changeRegisteredNameViewEntry()
{
    [gAppDelegateInstance setChangeRegisteredNameViewVisible:true];
    [gAppDelegateInstance setNavigationButtonVisible:true];
    [gAppDelegateInstance setNavigationButtonTitle:"Done"];
}

void ContactsTab::changeRegisteredNameViewExit()
{
    [gAppDelegateInstance setChangeRegisteredNameViewVisible:false];
    [gAppDelegateInstance setNavigationButtonVisible:false];
}

void ContactsTab::contactsViewEntry()
{
    [gAppDelegateInstance setContactsViewVisible:true];
    [gAppDelegateInstance setNavigationButtonVisible:true];
    [gAppDelegateInstance setNavigationButtonTitle:"Edit"];
}

void ContactsTab::contactsViewExit()
{
    [gAppDelegateInstance setContactsViewVisible:false];
    [gAppDelegateInstance setNavigationButtonVisible:false];
}

void ContactsTab::contactDetailsViewEntry()
{
    [gAppDelegateInstance setContactDetailsViewVisible:true];
}

void ContactsTab::contactDetailsViewExit()
{
    [gAppDelegateInstance setContactDetailsViewVisible:false];
}

void ContactsTab::editContactsViewEntry()
{
    [gAppDelegateInstance setEditContactsViewVisible:true];
    [gAppDelegateInstance setNavigationButtonVisible:true];
    [gAppDelegateInstance setNavigationButtonTitle:"Done"];
}

void ContactsTab::editContactsViewExit()
{
    [gAppDelegateInstance setEditContactsViewVisible:false];
    [gAppDelegateInstance setNavigationButtonVisible:false];
}

void ContactsTab::messageHistoryViewEntry()
{
    [gAppDelegateInstance setMessageHistoryViewVisible:true];
}

void ContactsTab::messageHistoryViewExit()
{
    [gAppDelegateInstance setMessageHistoryViewVisible:false];
}

void ContactsTab::recordMessageViewEntry()
{
    [gAppDelegateInstance setRecordMessageViewVisible:true];
}

void ContactsTab::recordMessageViewExit()
{
    [gAppDelegateInstance setRecordMessageViewVisible:false];
}

void ContactsTab::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark State wiring
void ContactsTab::CallEntry()
{
	switch(mState)
	{
		case kChangeRegisteredNameView: changeRegisteredNameViewEntry(); break;
		case kContactDetailsView: contactDetailsViewEntry(); break;
		case kContactsView: contactsViewEntry(); break;
		case kEditContactsView: editContactsViewEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMessageHistoryView: messageHistoryViewEntry(); break;
		case kRecordMessageView: recordMessageViewEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void ContactsTab::CallExit()
{
	switch(mState)
	{
		case kChangeRegisteredNameView: changeRegisteredNameViewExit(); break;
		case kContactDetailsView: contactDetailsViewExit(); break;
		case kContactsView: contactsViewExit(); break;
		case kEditContactsView: editContactsViewExit(); break;
		case kMessageHistoryView: messageHistoryViewExit(); break;
		case kRecordMessageView: recordMessageViewExit(); break;
		default: break;
	}
}

int  ContactsTab::StateTransitionFunction(const int evt) const
{
	if ((mState == kChangeRegisteredNameView) && (evt == kDonePressed)) return kEditContactsView; else
	if ((mState == kContactDetailsView) && (evt == kHistoryPressed)) return kMessageHistoryView; else
	if ((mState == kContactDetailsView) && (evt == kReplyPressed)) return kRecordMessageView; else
	if ((mState == kContactsView) && (evt == kEditPressed)) return kEditContactsView; else
	if ((mState == kContactsView) && (evt == kItemSelected)) return kContactDetailsView; else
	if ((mState == kEditContactsView) && (evt == kDonePressed)) return kContactsView; else
	if ((mState == kEditContactsView) && (evt == kItemSelected)) return kChangeRegisteredNameView; else
	if ((mState == kMessageHistoryView) && (evt == kReplyPressed)) return kRecordMessageView; else
	if ((mState == kRecordMessageView) && (evt == kItemSelected)) return kContactsView; else
	if ((mState == kStart) && (evt == kNext)) return kContactsView;

	return kInvalidState;
}

bool ContactsTab::HasEdgeNamedNext() const
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
            case GCTEvent::kNavButtonPressed:
                if (getState() == kContactsView)
                {
                    process(kEditPressed);
                }
                else if (getState() == kEditContactsView)
                {
                    process(kDonePressed);
                }
                else if (getState() == kChangeRegisteredNameView)
                {
                    process(kDonePressed);
                }
                break;

            case GCTEvent::kTableItemSelected:
                if (getState() == kContactsView)
                {
                    if (msg.mItemSelected == 1)
                    {
                        process(kItemSelected);
                    }
                }
                else if (getState() == kEditContactsView)
                {
                    if (msg.mItemSelected == 0)
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
}

