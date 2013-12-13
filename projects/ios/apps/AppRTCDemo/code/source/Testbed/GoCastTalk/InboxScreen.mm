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
    [gAppDelegateInstance setInboxViewVisible:false];
    [gAppDelegateInstance setInboxMessageViewVisible:false];
}

void InboxScreen::inboxViewEntry()
{
    [gAppDelegateInstance setInboxViewVisible:true];
}

void InboxScreen::inboxViewExit()
{
    [gAppDelegateInstance setInboxViewVisible:false];
}

void InboxScreen::showInboxMessageViewEntry()
{
    [gAppDelegateInstance setInboxMessageViewVisible:true];
}

void InboxScreen::hideInboxMessageViewEntry()
{
    [gAppDelegateInstance setInboxMessageViewVisible:false];
}

void InboxScreen::inboxMessageViewIdleEntry()
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
		case kHideInboxMessageView: hideInboxMessageViewEntry(); break;
		case kInboxMessageViewIdle: inboxMessageViewIdleEntry(); break;
		case kInboxView: inboxViewEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kShowConfirmDelete: showConfirmDeleteEntry(); break;
		case kShowInboxMessageView: showInboxMessageViewEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void InboxScreen::CallExit()
{
	switch(mState)
	{
		case kInboxView: inboxViewExit(); break;
		default: break;
	}
}

int  InboxScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kHideInboxMessageView) && (evt == kNext)) return kInboxView; else
	if ((mState == kInboxMessageViewIdle) && (evt == kDeletePressed)) return kShowConfirmDelete; else
	if ((mState == kInboxView) && (evt == kItemSelected)) return kShowInboxMessageView; else
	if ((mState == kShowConfirmDelete) && (evt == kNo)) return kInboxMessageViewIdle; else
	if ((mState == kShowConfirmDelete) && (evt == kYes)) return kHideInboxMessageView; else
	if ((mState == kShowInboxMessageView) && (evt == kNext)) return kInboxMessageViewIdle; else
	if ((mState == kStart) && (evt == kNext)) return kInboxView;

	return kInvalidState;
}

bool InboxScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kHideInboxMessageView:
		case kShowInboxMessageView:
		case kStart:
			return true;
		default: break;
	}
	return false;
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
            if (getState() == kInboxView)
            {
                process(kItemSelected);
            }
            else if (getState() == kInboxMessageViewIdle)
            {
                if (msg.mItemSelected == 2)
                {
                    process(kDeletePressed);
                }
            }
            break;

        default:
            break;
    }
}

