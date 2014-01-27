#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "NewMemoVC.h"

#pragma mark Constructor / Destructor
NewMemoScreen::NewMemoScreen(NewMemoVC* newVC)
: mPeer(newVC)
{
	ConstructMachine();
}

NewMemoScreen::~NewMemoScreen()
{
	DestructMachine();
}

void NewMemoScreen::addContactsPressed()
{
    if (getState() == kIdle)
    {
        process(kAddContactsSelected);
    }
}

void NewMemoScreen::addGroupsPressed()
{
    if (getState() == kIdle)
    {
        process(kAddGroupsSelected);
    }
}

void NewMemoScreen::clearPressed()
{
    if (getState() == kIdle)
    {
        process(kClearSelected);
    }
}

void NewMemoScreen::replyPressed()
{
    if (getState() == kIdle)
    {
        process(kReplySelected);
    }
}

#pragma mark Start / End / Invalid
void NewMemoScreen::startEntry()
{
    GCTEventManager::getInstance()->attach(this);
}

void NewMemoScreen::endEntry()
{
}

void NewMemoScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void NewMemoScreen::idleEntry()
{
}

#pragma mark Peer communication
void NewMemoScreen::peerPushContactsEntry()
{
    [mPeer pushContacts];
}

void NewMemoScreen::peerPushRecordMessageEntry()
{
    JSONObject newMessage;

    newMessage["from"] = InboxScreen::mToken;
    newMessage["to"] = mToList;

    [mPeer pushRecordMessage:newMessage];
}

void NewMemoScreen::peerUpdateToListEntry()
{
    std::string result;

    for(size_t i = 0; i < mToList.size(); i++)
    {
        result += mToList[i].mString;

        if (i != mToList.size() - 1)
        {
            result += ",\n";
        }
    }

    [mPeer updateToList:result];
}

#pragma mark Actions
void NewMemoScreen::appendToListEntry()
{
    mToList.push_back(mIncomingAppendAddr);
}

void NewMemoScreen::clearToListEntry()
{
    mToList.clear();
}

#pragma mark UI
void NewMemoScreen::showNotYetImplementedEntry()
{
    tAlert("Not yet implemented");
}

#pragma mark State wiring
void NewMemoScreen::CallEntry()
{
	switch(mState)
	{
		case kAppendToList: appendToListEntry(); break;
		case kClearToList: clearToListEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPushContacts: peerPushContactsEntry(); break;
		case kPeerPushRecordMessage: peerPushRecordMessageEntry(); break;
		case kPeerUpdateToList: peerUpdateToListEntry(); break;
		case kShowNotYetImplemented: showNotYetImplementedEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void NewMemoScreen::CallExit()
{
}

int  NewMemoScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kAppendToList) && (evt == kNext)) return kPeerUpdateToList; else
	if ((mState == kClearToList) && (evt == kNext)) return kPeerUpdateToList; else
	if ((mState == kIdle) && (evt == kAddContactsSelected)) return kPeerPushContacts; else
	if ((mState == kIdle) && (evt == kAddGroupsSelected)) return kShowNotYetImplemented; else
	if ((mState == kIdle) && (evt == kAppendContact)) return kAppendToList; else
	if ((mState == kIdle) && (evt == kClearSelected)) return kClearToList; else
	if ((mState == kIdle) && (evt == kReplySelected)) return kPeerPushRecordMessage; else
	if ((mState == kPeerPushContacts) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerPushRecordMessage) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerUpdateToList) && (evt == kNext)) return kIdle; else
	if ((mState == kShowNotYetImplemented) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kClearToList;

	return kInvalidState;
}

bool NewMemoScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kEnd:
		case kIdle:
		case kInvalidState:
		case kShowNotYetImplemented:
			return false;
		default: break;
	}
	return true;
}

#pragma mark Messages
void NewMemoScreen::update(const NewMemoScreenMessage& msg)
{
	process(msg.mEvent);
}

void NewMemoScreen::update(const GCTEvent& msg)
{
    switch (getState())
    {
        case kShowNotYetImplemented:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
//                case GCTEvent::kNoAlertPressed:     process(kNo); break;

                default:
                    break;
            }
            break;

        case kIdle:
            switch (msg.mEvent)
            {
                case GCTEvent::kAppendNewContact:
                    mIncomingAppendAddr = msg.mContact;
                    process(kAppendContact);
                    break;

                default:
                    break;
            }
            break;

        default:
            break;
    }
}
