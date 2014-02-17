#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#include "InboxVC.h"

JSONArray   InboxScreen::mInbox;
JSONArray   InboxScreen::mContacts;
std::map<std::string, std::string> InboxScreen::mContactMap;
std::string InboxScreen::mEmailAddress;

bool sortByDate (JSONValue i, JSONValue j);
bool sortByDate (JSONValue i, JSONValue j)
{
    return i.mObject["date"].mString > j.mObject["date"].mString;
}

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
    std::string email   = mInbox[i].mObject["from"].mString;
    std::string result  = mContactMap[email];

    if (result.empty())
    {
        result = email;
    }

    return result;
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
    if (!mInbox[i].mObject["transcription"].mObject["ja"].mString.empty())
    {
        return mInbox[i].mObject["transcription"].mObject["ja"].mString;
    }

    return "Transcription not available";
}

bool        InboxScreen::getIsReceive(const size_t& i)
{
#pragma unused(i)
    return mInbox[i].mObject["from"].mString != InboxScreen::mEmailAddress;
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
void InboxScreen::didWeDownloadContactsEntry()
{
    SetImmediateEvent(!mContacts.empty() ? kYes : kNo);
}

void InboxScreen::doWeHaveATokenEntry()
{
    SetImmediateEvent(InboxScreen::mEmailAddress.empty() ? kNo : kYes);
}

void InboxScreen::wasDeleteMessageValidEntry()
{
    bool result = false;

    if (mDeleteMessageJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void InboxScreen::wasGetContactsValidEntry()
{
    bool result = false;

    mContacts.clear();
    mContactMap.clear();

    if (mGetContactsJSON["status"].mString == std::string("success"))
    {
        mContacts = mGetContactsJSON["contacts"].mArray;

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
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Peer communication

void InboxScreen::peerReloadTableEntry()
{
    [mPeer reloadTable];
}

void InboxScreen::peerPushInboxMessageEntry()
{
    [mPeer pushInboxMessage:mInbox[mItemSelected].mObject];
}

#pragma mark Actions
void InboxScreen::buildContactMapEntry()
{
    mContactMap.clear();

    for (size_t i = 0; i < mContacts.size(); i++)
    {
        mContactMap[mContacts[i].mObject["email"].mString] = mContacts[i].mObject["kanji"].mString;
    }
}

void InboxScreen::clearInboxEntry()
{
    mInbox.clear();
    mContacts.clear();
    mContactMap.clear();
}

void InboxScreen::sortTableByDateEntry()
{
    mInbox = mListMessagesJSON["list"].mArray;

    std::sort(mInbox.begin(), mInbox.end(), sortByDate);
}

void InboxScreen::sendGetContactsToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=getContacts&name=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void InboxScreen::sendListMessagesToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=listMessages&name=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void InboxScreen::sendDeleteMessageToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=deleteMessage&name=%s&audio=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str(),
            mInbox[mDeleteSelected].mObject["audio"].mString.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

#pragma mark User Interface
void InboxScreen::setWaitForGetContactsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void InboxScreen::setWaitForDeleteMessageEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void InboxScreen::setWaitForListMessagesEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void InboxScreen::showErrorDeletingMessageEntry()
{
    tAlert("There was an error deleting a message from the server");
}

void InboxScreen::showErrorLoadingContactsEntry()
{
    tAlert("There was an error loading contacts from the server");
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
		case kBuildContactMap: buildContactMapEntry(); break;
		case kClearInbox: clearInboxEntry(); break;
		case kDidWeDownloadContacts: didWeDownloadContactsEntry(); break;
		case kDoWeHaveAToken: doWeHaveATokenEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPushInboxMessage: peerPushInboxMessageEntry(); break;
		case kPeerReloadTable: peerReloadTableEntry(); break;
		case kSendDeleteMessageToServer: sendDeleteMessageToServerEntry(); break;
		case kSendGetContactsToServer: sendGetContactsToServerEntry(); break;
		case kSendListMessagesToServer: sendListMessagesToServerEntry(); break;
		case kSetWaitForDeleteMessage: setWaitForDeleteMessageEntry(); break;
		case kSetWaitForGetContacts: setWaitForGetContactsEntry(); break;
		case kSetWaitForListMessages: setWaitForListMessagesEntry(); break;
		case kShowErrorDeletingMessage: showErrorDeletingMessageEntry(); break;
		case kShowErrorLoadingContacts: showErrorLoadingContactsEntry(); break;
		case kShowErrorLoadingInbox: showErrorLoadingInboxEntry(); break;
		case kShowRetryListMessages: showRetryListMessagesEntry(); break;
		case kSortTableByDate: sortTableByDateEntry(); break;
		case kStart: startEntry(); break;
		case kWasDeleteMessageValid: wasDeleteMessageValidEntry(); break;
		case kWasGetContactsValid: wasGetContactsValidEntry(); break;
		case kWasListMessagesValid: wasListMessagesValidEntry(); break;
		default: break;
	}
}

void InboxScreen::CallExit()
{
}

int  InboxScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kBuildContactMap) && (evt == kNext)) return kPeerReloadTable; else
	if ((mState == kClearInbox) && (evt == kNext)) return kPeerReloadTable; else
	if ((mState == kDidWeDownloadContacts) && (evt == kNo)) return kSetWaitForGetContacts; else
	if ((mState == kDidWeDownloadContacts) && (evt == kYes)) return kSetWaitForListMessages; else
	if ((mState == kDoWeHaveAToken) && (evt == kNo)) return kClearInbox; else
	if ((mState == kDoWeHaveAToken) && (evt == kYes)) return kDidWeDownloadContacts; else
	if ((mState == kIdle) && (evt == kDeleteSelected)) return kSetWaitForDeleteMessage; else
	if ((mState == kIdle) && (evt == kItemSelected)) return kPeerPushInboxMessage; else
	if ((mState == kIdle) && (evt == kRefreshSelected)) return kDoWeHaveAToken; else
	if ((mState == kPeerPushInboxMessage) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerReloadTable) && (evt == kNext)) return kIdle; else
	if ((mState == kSendDeleteMessageToServer) && (evt == kFail)) return kShowErrorDeletingMessage; else
	if ((mState == kSendDeleteMessageToServer) && (evt == kSuccess)) return kWasDeleteMessageValid; else
	if ((mState == kSendGetContactsToServer) && (evt == kFail)) return kShowErrorLoadingContacts; else
	if ((mState == kSendGetContactsToServer) && (evt == kSuccess)) return kWasGetContactsValid; else
	if ((mState == kSendListMessagesToServer) && (evt == kFail)) return kShowRetryListMessages; else
	if ((mState == kSendListMessagesToServer) && (evt == kSuccess)) return kWasListMessagesValid; else
	if ((mState == kSetWaitForDeleteMessage) && (evt == kNext)) return kSendDeleteMessageToServer; else
	if ((mState == kSetWaitForGetContacts) && (evt == kNext)) return kSendGetContactsToServer; else
	if ((mState == kSetWaitForListMessages) && (evt == kNext)) return kSendListMessagesToServer; else
	if ((mState == kShowErrorDeletingMessage) && (evt == kYes)) return kPeerReloadTable; else
	if ((mState == kShowErrorLoadingContacts) && (evt == kYes)) return kSetWaitForListMessages; else
	if ((mState == kShowErrorLoadingInbox) && (evt == kYes)) return kPeerReloadTable; else
	if ((mState == kShowRetryListMessages) && (evt == kNo)) return kPeerReloadTable; else
	if ((mState == kShowRetryListMessages) && (evt == kYes)) return kDoWeHaveAToken; else
	if ((mState == kSortTableByDate) && (evt == kNext)) return kBuildContactMap; else
	if ((mState == kStart) && (evt == kNext)) return kDoWeHaveAToken; else
	if ((mState == kWasDeleteMessageValid) && (evt == kNo)) return kShowErrorDeletingMessage; else
	if ((mState == kWasDeleteMessageValid) && (evt == kYes)) return kDoWeHaveAToken; else
	if ((mState == kWasGetContactsValid) && (evt == kNo)) return kShowErrorLoadingContacts; else
	if ((mState == kWasGetContactsValid) && (evt == kYes)) return kSetWaitForListMessages; else
	if ((mState == kWasListMessagesValid) && (evt == kNo)) return kShowErrorLoadingInbox; else
	if ((mState == kWasListMessagesValid) && (evt == kYes)) return kSortTableByDate;

	return kInvalidState;
}

bool InboxScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kBuildContactMap:
		case kClearInbox:
		case kPeerPushInboxMessage:
		case kPeerReloadTable:
		case kSetWaitForDeleteMessage:
		case kSetWaitForGetContacts:
		case kSetWaitForListMessages:
		case kSortTableByDate:
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
    if (msg.mId == this)
    {
        [mPeer setBlockingViewVisible:false];

        switch (msg.mEvent)
        {
            case URLLoaderEvent::kLoadFail: process(kFail); break;
            case URLLoaderEvent::kLoadedString:
            {
                switch (getState())
                {
                    case kSendGetContactsToServer:
                        mGetContactsJSON = JSONUtil::extract(msg.mString);
                        break;

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
        case kIdle:
            switch (msg.mEvent)
            {
                case GCTEvent::kReloadInbox:        refreshPressed(); break;
                        
                default:
                    break;
            }
            break;

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

