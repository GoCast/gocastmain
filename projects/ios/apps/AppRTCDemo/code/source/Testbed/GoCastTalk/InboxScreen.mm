#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#include "InboxVC.h"

JSONArray InboxScreen::mInbox;

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
    return mInbox.size();
}

std::string InboxScreen::getFrom(const size_t& i)
{
#pragma unused(i)
    return mInbox[i].mObject["from"].mString;
}

std::string InboxScreen::getDate(const size_t& i)
{
#pragma unused(i)
    std::string date = mInbox[i].mObject["date"].mString;

    std::string result = "xx/xx xx:xx";

    if (date.size() == 16)
    {
        result = date.substr(4,2) + "/" + date.substr(6,2) + " " + date.substr(8,2) + ":" + date.substr(10,2);
    }

    return result;
}

std::string InboxScreen::getTranscription(const size_t& i)
{
#pragma unused(i)
    return mInbox[i].mObject["transcription"].mObject["ja"].mString;
}

bool        InboxScreen::getIsReceive(const size_t& i)
{
#pragma unused(i)
    return mInbox[i].mObject["from"].mString != "tjgrant@tatewake.com";
}

bool        InboxScreen::getIsGroup(const size_t& i)
{
#pragma unused(i)
    return false;
}

void        InboxScreen::selectItem(const size_t& i)
{
    mItemSelected = i;

    update(InboxScreenMessage(InboxScreen::kItemSelected));
}

void       InboxScreen::refreshPressed()
{
    if (getState() == kIdle)
    {
        process(kRefreshSelected);
    }
}

void       InboxScreen::deletePressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mDeleteSelected = i;
        process(kDeleteSelected);
    }
}

#pragma mark Start / End / Invalid
void InboxScreen::startEntry()
{
    URLLoader::getInstance()->attach(this);
    GCTEventManager::getInstance()->attach(this);
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
void InboxScreen::wasDeleteMessageValidEntry()
{
    bool result = false;

    if (mDeleteMessageJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void InboxScreen::wasListMessagesValidEntry()
{
    bool result = false;

    if (mListMessagesJSON["status"].mString == std::string("success"))
    {
        result = true;

        mInbox = mListMessagesJSON["list"].mArray;
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
    [mPeer pushInboxMessage:mInbox[mItemSelected].mObject];
}

void InboxScreen::sendListMessagesToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=listMessages&name=%s",
            kMemoAppServerURL,
            "tjgrant@tatewake.com");

    URLLoader::getInstance()->loadString(1, buf);
}

void InboxScreen::sendDeleteMessageToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=deleteMessage&name=%s&audio=%s",
            kMemoAppServerURL,
            "tjgrant@tatewake.com",
            mInbox[mDeleteSelected].mObject["audio"].mString.c_str());

    URLLoader::getInstance()->loadString(1, buf);
}

#pragma mark User Interface
void InboxScreen::setWaitForDeleteMessageEntry()
{
    //TODO
}

void InboxScreen::setWaitForListMessagesEntry()
{
    //TODO
}

void InboxScreen::showErrorDeletingMessageEntry()
{
    tAlert("There was an error deleting a message from the server");
}

void InboxScreen::showErrorLoadingInboxEntry()
{
    tAlert("There was an error loading inbox from the server");
}

void InboxScreen::showRetryListMessagesEntry()
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
		case kSendDeleteMessageToServer: sendDeleteMessageToServerEntry(); break;
		case kSendListMessagesToServer: sendListMessagesToServerEntry(); break;
		case kSetWaitForDeleteMessage: setWaitForDeleteMessageEntry(); break;
		case kSetWaitForListMessages: setWaitForListMessagesEntry(); break;
		case kShowErrorDeletingMessage: showErrorDeletingMessageEntry(); break;
		case kShowErrorLoadingInbox: showErrorLoadingInboxEntry(); break;
		case kShowRetryListMessages: showRetryListMessagesEntry(); break;
		case kStart: startEntry(); break;
		case kWasDeleteMessageValid: wasDeleteMessageValidEntry(); break;
		case kWasListMessagesValid: wasListMessagesValidEntry(); break;
		default: break;
	}
}

void InboxScreen::CallExit()
{
}

int  InboxScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kDeleteSelected)) return kSetWaitForDeleteMessage; else
	if ((mState == kIdle) && (evt == kItemSelected)) return kPeerPushInboxMessage; else
	if ((mState == kIdle) && (evt == kRefreshSelected)) return kSetWaitForListMessages; else
	if ((mState == kPeerPushInboxMessage) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerReloadTable) && (evt == kNext)) return kIdle; else
	if ((mState == kSendDeleteMessageToServer) && (evt == kFail)) return kShowErrorDeletingMessage; else
	if ((mState == kSendDeleteMessageToServer) && (evt == kSuccess)) return kWasDeleteMessageValid; else
	if ((mState == kSendListMessagesToServer) && (evt == kFail)) return kShowRetryListMessages; else
	if ((mState == kSendListMessagesToServer) && (evt == kSuccess)) return kWasListMessagesValid; else
	if ((mState == kSetWaitForDeleteMessage) && (evt == kNext)) return kSendDeleteMessageToServer; else
	if ((mState == kSetWaitForListMessages) && (evt == kNext)) return kSendListMessagesToServer; else
	if ((mState == kShowErrorDeletingMessage) && (evt == kYes)) return kPeerReloadTable; else
	if ((mState == kShowErrorLoadingInbox) && (evt == kYes)) return kPeerReloadTable; else
	if ((mState == kShowRetryListMessages) && (evt == kNo)) return kPeerReloadTable; else
	if ((mState == kShowRetryListMessages) && (evt == kYes)) return kSetWaitForListMessages; else
	if ((mState == kStart) && (evt == kNext)) return kSetWaitForListMessages; else
	if ((mState == kWasDeleteMessageValid) && (evt == kNo)) return kShowErrorDeletingMessage; else
	if ((mState == kWasDeleteMessageValid) && (evt == kYes)) return kSetWaitForListMessages; else
	if ((mState == kWasListMessagesValid) && (evt == kNo)) return kShowErrorLoadingInbox; else
	if ((mState == kWasListMessagesValid) && (evt == kYes)) return kPeerReloadTable;

	return kInvalidState;
}

bool InboxScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPeerPushInboxMessage:
		case kPeerReloadTable:
		case kSetWaitForDeleteMessage:
		case kSetWaitForListMessages:
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
    if (msg.mId == 1)
    {
        [gAppDelegateInstance setBlockingViewVisible:false];

        switch (msg.mEvent)
        {
            case URLLoaderEvent::kLoadFail: process(kFail); break;
            case URLLoaderEvent::kLoadedString:
            {
                switch (getState())
                {
                    case kSendListMessagesToServer:
                        mListMessagesJSON = JSONUtil::extract(msg.mString);
                        break;

                    case kSendDeleteMessageToServer:
                        mDeleteMessageJSON = JSONUtil::extract(msg.mString);
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
}

void InboxScreen::update(const GCTEvent& msg)
{
    switch(getState())
    {
        case kShowErrorDeletingMessage:
        case kShowErrorLoadingInbox:
        case kShowRetryListMessages:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
                case GCTEvent::kNoAlertPressed:     process(kNo); break;

                default:
                    break;
            }
            break;
    }
}

