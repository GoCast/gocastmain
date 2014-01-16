#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#include "InboxVC.h"

#pragma mark Constructor / Destructor
InboxScreen::InboxScreen(InboxVC* newVC)
: mPeer(newVC)
{
	ConstructMachine();
}

InboxScreen::~InboxScreen()
{
	DestructMachine();
}

#pragma mark public methods
size_t  InboxScreen::getInboxSize()
{
    return mListInboxJSON["list"].mArray.size();
}

std::string InboxScreen::getFrom(const size_t& i)
{
#pragma unused(i)
    return mListInboxJSON["list"].mArray[i].mString;
}

std::string InboxScreen::getDate(const size_t& i)
{
#pragma unused(i)
    return "Date";
}

std::string InboxScreen::getTranscription(const size_t& i)
{
#pragma unused(i)
    return "Transcription";
}

bool        InboxScreen::getIsReceive(const size_t& i)
{
#pragma unused(i)
    return i & 0x01;
}

bool        InboxScreen::getIsGroup(const size_t& i)
{
#pragma unused(i)
    return i & 0x02;
}

void        InboxScreen::selectItem(const size_t& i)
{
    mItemSelected = i;

    update(InboxScreenMessage(InboxScreen::kItemSelected));
}

#pragma mark Start / End / Invalid
void InboxScreen::startEntry()
{
    URLLoader::getInstance()->attach(this);
}

void InboxScreen::endEntry()
{
}

void InboxScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void InboxScreen::idleEntry()
{
}

#pragma mark Queries
void InboxScreen::wasListInboxValidEntry()
{
    bool result = false;

    if (mListInboxJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void InboxScreen::peerReloadTableEntry()
{
    [mPeer reloadTable];
}

void InboxScreen::peerPushInboxMessageEntry()
{
    [mPeer pushInboxMessage];
}

void InboxScreen::sendListInboxToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=listInbox&name=%s",
            kMemoAppServerURL,
            "tjgrant@tatewake.com");

    URLLoader::getInstance()->loadString(buf);
}

#pragma mark User Interface
void InboxScreen::setWaitForListInboxEntry()
{
    //TODO
}

void InboxScreen::showErrorLoadingInboxEntry()
{
    tAlert("There was an error loading inbox from the server");
}

void InboxScreen::showRetryListInboxEntry()
{
    tConfirm("Couldn't contact server, retry refresh inbox?");
}

#pragma mark State wiring
void InboxScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPushInboxMessage: peerPushInboxMessageEntry(); break;
		case kPeerReloadTable: peerReloadTableEntry(); break;
		case kSendListInboxToServer: sendListInboxToServerEntry(); break;
		case kSetWaitForListInbox: setWaitForListInboxEntry(); break;
		case kShowErrorLoadingInbox: showErrorLoadingInboxEntry(); break;
		case kShowRetryListInbox: showRetryListInboxEntry(); break;
		case kStart: startEntry(); break;
		case kWasListInboxValid: wasListInboxValidEntry(); break;
		default: break;
	}
}

void InboxScreen::CallExit()
{
}

int  InboxScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kItemSelected)) return kPeerPushInboxMessage; else
	if ((mState == kIdle) && (evt == kRefreshSelected)) return kSetWaitForListInbox; else
	if ((mState == kPeerPushInboxMessage) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerReloadTable) && (evt == kNext)) return kIdle; else
	if ((mState == kSendListInboxToServer) && (evt == kFail)) return kShowRetryListInbox; else
	if ((mState == kSendListInboxToServer) && (evt == kSuccess)) return kWasListInboxValid; else
	if ((mState == kSetWaitForListInbox) && (evt == kNext)) return kSendListInboxToServer; else
	if ((mState == kShowErrorLoadingInbox) && (evt == kYes)) return kPeerReloadTable; else
	if ((mState == kShowRetryListInbox) && (evt == kNo)) return kPeerReloadTable; else
	if ((mState == kShowRetryListInbox) && (evt == kYes)) return kSetWaitForListInbox; else
	if ((mState == kStart) && (evt == kNext)) return kSetWaitForListInbox; else
	if ((mState == kWasListInboxValid) && (evt == kNo)) return kShowErrorLoadingInbox; else
	if ((mState == kWasListInboxValid) && (evt == kYes)) return kPeerReloadTable;

	return kInvalidState;
}

bool InboxScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPeerPushInboxMessage:
		case kPeerReloadTable:
		case kSetWaitForListInbox:
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

void InboxScreen::update(const URLLoaderEvent& msg)
{
    [gAppDelegateInstance setBlockingViewVisible:false];

    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendListInboxToServer:
                    mListInboxJSON = JSONUtil::extract(msg.mString);
                    break;

                default:
                    break;
            }
            process(kSuccess);
        }
            break;

        case URLLoaderEvent::kLoadedFile: process(kSuccess); break;

        default:
            break;
    }
}

