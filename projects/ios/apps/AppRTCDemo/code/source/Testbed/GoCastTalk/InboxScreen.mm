#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "InboxVC.h"

JSONArray   InboxScreen::mInbox;
JSONArray   InboxScreen::mContacts;
JSONArray   InboxScreen::mGroups;

std::string InboxScreen::mEmailAddress;
std::string InboxScreen::mToken;

bool sortByDate (JSONValue i, JSONValue j);
bool sortByDate (JSONValue i, JSONValue j)
{
    return i.mObject["date"].mString > j.mObject["date"].mString;
}

std::string InboxScreen::getGmtString()
{
    char buf[80];
    time_t curTime;
    tm* timeStruct;

    curTime=time(NULL);
    timeStruct = gmtime(&curTime);

    sprintf(buf, "%04d%02d%02d%02d%02d%02d%02d",
            timeStruct->tm_year+1900,   timeStruct->tm_mon+1,   timeStruct->tm_mday,
            timeStruct->tm_hour,        timeStruct->tm_min,     timeStruct->tm_sec,
            tTimer::getTimeMS() % 100);

    return buf;
}

std::string InboxScreen::gmtToLocal(const std::string& gmtTime)
{
    if (gmtTime.size() == 16)
    {
        std::string appleTime = gmtTime.substr(0, 14) + " UTC";
        NSDateFormatter *fmt = [[[NSDateFormatter alloc] init] autorelease];
        fmt.dateFormat = @"yyyyMMddHHmmss zzz";
        NSDate *utc = [fmt dateFromString:[NSString stringWithUTF8String:appleTime.c_str()]];
        fmt.timeZone = [NSTimeZone systemTimeZone];
        std::string local = [[fmt stringFromDate:utc] UTF8String];

        return local.substr(0, 14) + "00";
    }

    return gmtTime;
}

std::string InboxScreen::nameFromEmail(const std::string& email)
{
    bool found = false;
    size_t i;

    for(i = 0; i < mContacts.size(); i++)
    {
        if (mContacts[i].mObject["email"].mType == JSONValue::kString &&
            mContacts[i].mObject["email"].mString == email)
        {
            found = true;
            break;
        }
    }

    if (found)
    {
        if (mContacts[i].mObject["kanji"].mType == JSONValue::kString &&
            !mContacts[i].mObject["kanji"].mString.empty())
        {
            return mContacts[i].mObject["kanji"].mString;
        }
        if (mContacts[i].mObject["kana"].mType == JSONValue::kString &&
            !mContacts[i].mObject["kana"].mString.empty())
        {
            return mContacts[i].mObject["kana"].mString;
        }
    }

    return email;
}

#pragma mark Constructor / Destructor
InboxScreen::InboxScreen(InboxVC* newVC)
:   mPeer(newVC),
    mNewMessageSound(NULL)
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
    std::string result  = InboxScreen::nameFromEmail(email);

    if (result.empty())
    {
        result = email;
    }

    return result;
}

std::string InboxScreen::getDate(const size_t& i)
{
#pragma unused(i)
    std::string date = InboxScreen::gmtToLocal(mInbox[i].mObject["date"].mString);

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
    return mInbox[i].mObject["from"].mString != InboxScreen::mEmailAddress;
}

bool        InboxScreen::getIsGroup(const size_t& i)
{
#pragma unused(i)
    return false;
}

bool        InboxScreen::getIsRead(const size_t& i)
{
    return mInbox[i].mObject["read"].mString == "yes";
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

    mNewMessageSound = new tSound(tFile(tFile::kBundleDirectory, "newmessage.wav"));

    mRefreshTimer = new tTimer(30000);
    mRefreshTimer->attach(this);
    mRefreshTimer->start();
}

void InboxScreen::endEntry()
{
    if (mRefreshTimer) { delete mRefreshTimer; mRefreshTimer = NULL; }
    if (mNewMessageSound) { delete mNewMessageSound; mNewMessageSound = NULL; }
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
void InboxScreen::areThereNewMessagesEntry()
{
    size_t newUnread = 0;

    for(size_t i = 0; i < mInbox.size(); i++)
    {
        if (!getIsRead(i))
        {
            newUnread++;
        }
    }

    SetImmediateEvent((newUnread > mPriorUnreadCount) ? kYes : kNo);
}

void InboxScreen::didWeDownloadContactsEntry()
{
    SetImmediateEvent(!mContacts.empty() ? kYes : kNo);
}

void InboxScreen::didWeDownloadGroupsEntry()
{
    SetImmediateEvent(!mGroups.empty() ? kYes : kNo);
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

    if (mGetContactsJSON["status"].mString == std::string("success"))
    {
        mContacts = mGetContactsJSON["contacts"].mArray;

        JSONObject misterFeedback;

        misterFeedback["kana"] = std::string("フィードバック");
        misterFeedback["email"] = std::string("feedback@gocast.it");

        JSONObject welcomingCommittee;

        welcomingCommittee["kana"] = std::string("ゴーキャスト　チーム");
        welcomingCommittee["email"] = std::string("gocast.team@gocast.it");

        mContacts.push_back(misterFeedback);
        mContacts.push_back(welcomingCommittee);

        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void InboxScreen::wasGetGroupsValidEntry()
{
    bool result = false;

    mGroups.clear();

    if (mGetGroupsJSON["status"].mString == std::string("success"))
    {
        mGroups = mGetGroupsJSON["groups"].mArray;

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
void InboxScreen::clearInboxEntry()
{
    mInbox.clear();
    mContacts.clear();
}

void InboxScreen::playNewMessageSoundEntry()
{
    if (mNewMessageSound)
    {
        mNewMessageSound->play();
    }
}

void InboxScreen::sortTableByDateEntry()
{
    mInbox = mListMessagesJSON["list"].mArray;

//Fake message
    JSONObject welcomeMessage;
    welcomeMessage["from"]  = std::string("gocast.team@gocast.it");
    welcomeMessage["date"]  = std::string("2001010201010101");
    welcomeMessage["to"]    = JSONArray();
    welcomeMessage["to"].mArray.push_back(InboxScreen::mEmailAddress);
    welcomeMessage["audio"] = std::string("welcome-feedback@gocast.it");
    welcomeMessage["read"]  = std::string("yes");
    welcomeMessage["transcription"] = JSONObject();
    welcomeMessage["transcription"].mObject["ja"] =
    std::string("ようこそ。\nこのアプリはGoCastTalkです。\nこれは完璧なエンジニアリングの例です。ハハハ。\n真剣に、それは完璧だ。\nあなたはすでにこれを知っていた。");

    mInbox.push_back(welcomeMessage);

    std::sort(mInbox.begin(), mInbox.end(), sortByDate);
}

void InboxScreen::sendGetContactsToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=getContacts&name=%s&authToken=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str(),
            InboxScreen::mToken.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void InboxScreen::sendGetGroupsToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=getGroups&name=%s&authToken=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str(),
            InboxScreen::mToken.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void InboxScreen::sendListMessagesToServerEntry()
{
    mPriorUnreadCount = 0;
    for(size_t i = 0; i < mInbox.size(); i++)
    {
        if (!getIsRead(i))
        {
            mPriorUnreadCount++;
        }
    }

    char buf[512];

    sprintf(buf, "%s?action=listMessages&name=%s&authToken=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str(),
            InboxScreen::mToken.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void InboxScreen::sendDeleteMessageToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=deleteMessage&name=%s&audio=%s&authToken=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str(),
            mInbox[mDeleteSelected].mObject["audio"].mString.c_str(),
            InboxScreen::mToken.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

#pragma mark User Interface
void InboxScreen::setWaitForGetContactsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void InboxScreen::setWaitForGetGroupsEntry()
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
    //"There was an error deleting a message from the server"
    tAlert("メッセージの削除に失敗しました");
}

void InboxScreen::showErrorLoadingContactsEntry()
{
    //"There was an error loading contacts from the server"
    tAlert("メンバーの取得に失敗しました");
}

void InboxScreen::showErrorLoadingGroupsEntry()
{
    //"There was an error loading groups from the server"
    tAlert("グループの取得に失敗しました");
}

void InboxScreen::showErrorLoadingInboxEntry()
{
    //"There was an error loading inbox from the server"
    tAlert("メッセージの取得に失敗しました");
}

void InboxScreen::showRetryListMessagesEntry()
{
    //"Couldn't contact server, retry refresh inbox?"
    tConfirm("メッセージ取り込み中に接続エラーが発生しました。リトライしますか？");
}

#pragma mark State wiring
void InboxScreen::CallEntry()
{
	switch(mState)
	{
		case kAreThereNewMessages: areThereNewMessagesEntry(); break;
		case kClearInbox: clearInboxEntry(); break;
		case kDidWeDownloadContacts: didWeDownloadContactsEntry(); break;
		case kDidWeDownloadGroups: didWeDownloadGroupsEntry(); break;
		case kDoWeHaveAToken: doWeHaveATokenEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPushInboxMessage: peerPushInboxMessageEntry(); break;
		case kPeerReloadTable: peerReloadTableEntry(); break;
		case kPlayNewMessageSound: playNewMessageSoundEntry(); break;
		case kSendDeleteMessageToServer: sendDeleteMessageToServerEntry(); break;
		case kSendGetContactsToServer: sendGetContactsToServerEntry(); break;
		case kSendGetGroupsToServer: sendGetGroupsToServerEntry(); break;
		case kSendListMessagesToServer: sendListMessagesToServerEntry(); break;
		case kSetWaitForDeleteMessage: setWaitForDeleteMessageEntry(); break;
		case kSetWaitForGetContacts: setWaitForGetContactsEntry(); break;
		case kSetWaitForGetGroups: setWaitForGetGroupsEntry(); break;
		case kSetWaitForListMessages: setWaitForListMessagesEntry(); break;
		case kShowErrorDeletingMessage: showErrorDeletingMessageEntry(); break;
		case kShowErrorLoadingContacts: showErrorLoadingContactsEntry(); break;
		case kShowErrorLoadingGroups: showErrorLoadingGroupsEntry(); break;
		case kShowErrorLoadingInbox: showErrorLoadingInboxEntry(); break;
		case kShowRetryListMessages: showRetryListMessagesEntry(); break;
		case kSortTableByDate: sortTableByDateEntry(); break;
		case kStart: startEntry(); break;
		case kWasDeleteMessageValid: wasDeleteMessageValidEntry(); break;
		case kWasGetContactsValid: wasGetContactsValidEntry(); break;
		case kWasGetGroupsValid: wasGetGroupsValidEntry(); break;
		case kWasListMessagesValid: wasListMessagesValidEntry(); break;
		default: break;
	}
}

void InboxScreen::CallExit()
{
}

int  InboxScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kAreThereNewMessages) && (evt == kNo)) return kPeerReloadTable; else
	if ((mState == kAreThereNewMessages) && (evt == kYes)) return kPlayNewMessageSound; else
	if ((mState == kClearInbox) && (evt == kNext)) return kPeerReloadTable; else
	if ((mState == kDidWeDownloadContacts) && (evt == kNo)) return kSetWaitForGetContacts; else
	if ((mState == kDidWeDownloadContacts) && (evt == kYes)) return kDidWeDownloadGroups; else
	if ((mState == kDidWeDownloadGroups) && (evt == kNo)) return kSetWaitForGetGroups; else
	if ((mState == kDidWeDownloadGroups) && (evt == kYes)) return kSetWaitForListMessages; else
	if ((mState == kDoWeHaveAToken) && (evt == kNo)) return kClearInbox; else
	if ((mState == kDoWeHaveAToken) && (evt == kYes)) return kDidWeDownloadContacts; else
	if ((mState == kIdle) && (evt == kDeleteSelected)) return kSetWaitForDeleteMessage; else
	if ((mState == kIdle) && (evt == kItemSelected)) return kPeerPushInboxMessage; else
	if ((mState == kIdle) && (evt == kRefreshSelected)) return kDoWeHaveAToken; else
	if ((mState == kPeerPushInboxMessage) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerReloadTable) && (evt == kNext)) return kIdle; else
	if ((mState == kPlayNewMessageSound) && (evt == kNext)) return kPeerReloadTable; else
	if ((mState == kSendDeleteMessageToServer) && (evt == kFail)) return kShowErrorDeletingMessage; else
	if ((mState == kSendDeleteMessageToServer) && (evt == kSuccess)) return kWasDeleteMessageValid; else
	if ((mState == kSendGetContactsToServer) && (evt == kFail)) return kShowErrorLoadingContacts; else
	if ((mState == kSendGetContactsToServer) && (evt == kSuccess)) return kWasGetContactsValid; else
	if ((mState == kSendGetGroupsToServer) && (evt == kFail)) return kShowErrorLoadingGroups; else
	if ((mState == kSendGetGroupsToServer) && (evt == kSuccess)) return kWasGetGroupsValid; else
	if ((mState == kSendListMessagesToServer) && (evt == kFail)) return kShowRetryListMessages; else
	if ((mState == kSendListMessagesToServer) && (evt == kSuccess)) return kWasListMessagesValid; else
	if ((mState == kSetWaitForDeleteMessage) && (evt == kNext)) return kSendDeleteMessageToServer; else
	if ((mState == kSetWaitForGetContacts) && (evt == kNext)) return kSendGetContactsToServer; else
	if ((mState == kSetWaitForGetGroups) && (evt == kNext)) return kSendGetGroupsToServer; else
	if ((mState == kSetWaitForListMessages) && (evt == kNext)) return kSendListMessagesToServer; else
	if ((mState == kShowErrorDeletingMessage) && (evt == kYes)) return kPeerReloadTable; else
	if ((mState == kShowErrorLoadingContacts) && (evt == kYes)) return kDidWeDownloadGroups; else
	if ((mState == kShowErrorLoadingGroups) && (evt == kYes)) return kSetWaitForListMessages; else
	if ((mState == kShowErrorLoadingInbox) && (evt == kYes)) return kPeerReloadTable; else
	if ((mState == kShowRetryListMessages) && (evt == kNo)) return kPeerReloadTable; else
	if ((mState == kShowRetryListMessages) && (evt == kYes)) return kDoWeHaveAToken; else
	if ((mState == kSortTableByDate) && (evt == kNext)) return kAreThereNewMessages; else
	if ((mState == kStart) && (evt == kNext)) return kDoWeHaveAToken; else
	if ((mState == kWasDeleteMessageValid) && (evt == kNo)) return kShowErrorDeletingMessage; else
	if ((mState == kWasDeleteMessageValid) && (evt == kYes)) return kDoWeHaveAToken; else
	if ((mState == kWasGetContactsValid) && (evt == kNo)) return kShowErrorLoadingContacts; else
	if ((mState == kWasGetContactsValid) && (evt == kYes)) return kDidWeDownloadGroups; else
	if ((mState == kWasGetGroupsValid) && (evt == kNo)) return kShowErrorLoadingGroups; else
	if ((mState == kWasGetGroupsValid) && (evt == kYes)) return kSetWaitForListMessages; else
	if ((mState == kWasListMessagesValid) && (evt == kNo)) return kShowErrorLoadingInbox; else
	if ((mState == kWasListMessagesValid) && (evt == kYes)) return kSortTableByDate;

	return kInvalidState;
}

bool InboxScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kClearInbox:
		case kPeerPushInboxMessage:
		case kPeerReloadTable:
		case kPlayNewMessageSound:
		case kSetWaitForDeleteMessage:
		case kSetWaitForGetContacts:
		case kSetWaitForGetGroups:
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

                    case kSendGetGroupsToServer:
                        mGetGroupsJSON = JSONUtil::extract(msg.mString);
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
        case kShowErrorLoadingContacts:
        case kShowErrorLoadingGroups:
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

void InboxScreen::update(const tTimerEvent& msg)
{
    switch (msg.mEvent)
    {
        case tTimer::kTimerTick:
            if (msg.mTimer == mRefreshTimer)
            {
                if (getState() == kIdle)
                {
                    refreshPressed();
                }
            }
            break;

        default:
            break;
    }
}

