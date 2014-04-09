#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "RecordMessageVC.h"

#pragma mark Constructor / Destructor
RecordMessageScreen::RecordMessageScreen(RecordMessageVC* newVC, const JSONObject& initObject)
:   mPeer(newVC),
    mInitObject(initObject),
    mGotTranscriptionEvent(false)
{
	ConstructMachine();
}

RecordMessageScreen::~RecordMessageScreen()
{
	DestructMachine();
}

#pragma mark Public methods
size_t RecordMessageScreen::getToCount()
{
    return mInitObject["to"].mArray.size();
}

std::string RecordMessageScreen::getTo(const size_t& i)
{
//    return mInitObject["from"].mString;
    return mInitObject["to"].mArray[i].mString;
}

void RecordMessageScreen::deleteTo(const size_t& i)
{
    mInitObject["to"].mArray.erase(mInitObject["to"].mArray.begin() + (const int)i);
}

void RecordMessageScreen::donePressed()
{
    update(kSendPressed);
}

void RecordMessageScreen::cancelPressed()
{
    update(kCancelPressed);
}

void RecordMessageScreen::pausePressed()
{
    update(kPausePressed);
}

void RecordMessageScreen::recordPressed()
{
    update(kRecordPressed);
}

void RecordMessageScreen::playPressed()
{
    update(kPlayPressed);
}

void RecordMessageScreen::stopPressed()
{
    update(kStopPressed);
}

#pragma mark Start / End / Invalid
void RecordMessageScreen::startEntry()
{
    mForceLogout    = false;

    mSound          = NULL;
    mTenMinuteTimer = NULL;
    mDidRecord      = false;

    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    mSliderUpdateTimer = new tTimer(30);
    mSliderUpdateTimer->attach(this);

    mRecordTimer = new tTimer(1000);
    mRecordTimer->attach(this);
}

void RecordMessageScreen::endEntry()
{
    if (mRecordTimer)       { delete mRecordTimer; mRecordTimer = NULL; }
    if (mSliderUpdateTimer) { delete mSliderUpdateTimer; mSliderUpdateTimer = NULL; }
    if (mTenMinuteTimer)    { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }
    if (mSound)             { delete mSound; mSound = NULL; }
}

void RecordMessageScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void RecordMessageScreen::waitToRecordIdleEntry()
{
    mGotTranscriptionEvent = false;
    [mPeer setWaitToRecordUI];
    [mPeer setTranscription:"(テキストはまだありません)\n\n無料サービス期間中は、自動テキスト化は１日あたり２０回までご利用いただけます。"]; //"Transcription pending"
    [mPeer setTranscriptionEnabled:false];
}

void RecordMessageScreen::waitToPlayIdleEntry()
{
    [mPeer setWaitToPlayUI];

    if (!mSound)
    {
        mSound = new tSound(tFile(tFile::kTemporaryDirectory, "scratch.caf"));
        mSound->attach(this);
    }

    if (mSound)
    {
        tUInt32 durationMS = mSound->getDurationMS();

        size_t sec = (durationMS / 1000) % 60;
        size_t min = ((durationMS / 1000) - sec) / 60;

        char buf[10];
        sprintf(buf, "%02d:%02d", (int)min, (int)sec);

        [mPeer setTimeLabel:buf];
    }

    if (mForceLogout)
    {
        process(kCancelPressed);
    }
}

void RecordMessageScreen::playingIdleEntry()
{
    [mPeer setPlayingUI];

    if (mForceLogout)
    {
        process(kCancelPressed);
    }
}

void RecordMessageScreen::pausedIdleEntry()
{
    [mPeer setPausedUI];

    if (mForceLogout)
    {
        process(kCancelPressed);
    }
}

void RecordMessageScreen::recordingIdleEntry()
{
    [mPeer setRecordingUI];
}

void RecordMessageScreen::recordingIdleExit()
{
    if (mTenMinuteTimer)    { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }
}

void RecordMessageScreen::waitForTranscriptionIdleEntry()
{
    [mPeer setWaitForTranscriptUI];
}

#pragma mark Peer communication

void RecordMessageScreen::peerPopAllInboxViewsEntry()
{
    [mPeer popAllInboxViews];
}

void RecordMessageScreen::peerStartEditingTranscriptionEntry()
{
    [mPeer startEditingTranscription];
}

void RecordMessageScreen::peerSwitchToInboxTabEntry()
{
    [mPeer switchToInboxTab];
}

void RecordMessageScreen::peerSwitchToNewMemoTabEntry()
{
    [mPeer switchToNewMemoTab];
}

#pragma mark Queries

void RecordMessageScreen::didWeRecordEntry()
{
    SetImmediateEvent(mDidRecord ? kYes : kNo);
}

void RecordMessageScreen::doWeHaveContactsToSendToEntry()
{
    SetImmediateEvent(!mInitObject["to"].mArray.empty() ? kYes : kNo);
}

void RecordMessageScreen::doWeHaveRecipientsOrARecordingEntry()
{
    SetImmediateEvent((mDidRecord || !mInitObject["to"].mArray.empty()) ? kYes : kNo);
}

void RecordMessageScreen::doWeNeedToWaitForTranscriptionEntry()
{
    SetImmediateEvent(mGotTranscriptionEvent ? kNo : kYes);
}

void RecordMessageScreen::isThisAForcedCancelEntry()
{
    SetImmediateEvent(mForceLogout ? kYes : kNo);
}

void RecordMessageScreen::wasPostAudioSuccessfulEntry()
{
    bool result = false;
    bool expired = false;

    if (mPostAudioJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    if (mPostAudioJSON["status"].mString == std::string("expired"))
    {
        expired = true;
    }

    SetImmediateEvent(expired ? kExpired : (result ? kYes : kNo));
}

void RecordMessageScreen::wasPostTranscriptSuccessfulEntry()
{
    bool result = false;
    bool expired = false;

    if (mPostTranscriptJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    if (mPostTranscriptJSON["status"].mString == std::string("expired"))
    {
        expired = true;
    }

    SetImmediateEvent(expired ? kExpired : (result ? kYes : kNo));
}

void RecordMessageScreen::wasPostMessageSuccessfulEntry()
{
    bool result = false;
    bool expired = false;

    if (mPostMessageJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    if (mPostMessageJSON["status"].mString == std::string("expired"))
    {
        expired = true;
    }

    SetImmediateEvent(expired ? kExpired : (result ? kYes : kNo));
}

#pragma mark Actions
void RecordMessageScreen::fixRecipientListEntry()
{
    JSONArray arr = mInitObject["to"].mArray;
    JSONArray arr2;

    for (size_t i = 0; i < arr.size(); i++)
    {
        if (!arr[i].mString.empty() && (arr[i].mString != InboxScreen::mEmailAddress))
        {
            arr2.push_back(arr[i]);
        }
    }

    mInitObject["to"].mArray = arr2;

    if (!mNewMessageRecipients.empty())
    {
        [mPeer refreshExpanded];
    }
}

void RecordMessageScreen::calculateMessageJSONEntry()
{
    std::map<std::string, int> calculated;
    std::string date;
    std::string audioName;

    //0. Clear results
    mMessageJSON.clear();

    //1. Calculate date and audio file name
    date = InboxScreen::getGmtString();
    audioName = date + "-" + InboxScreen::mEmailAddress;

    //2. Treat as "reply all", calculate the "to"
    //   based on the original "from" and all other recipients
    mMessageJSON["to"]          = JSONArray();

    if (mInitObject["from"].mType == JSONValue::kString && mInitObject["from"].mString != "")
    {
        calculated[mInitObject["from"].mString]++;
    }

    for (size_t i = 0; i < mInitObject["to"].mArray.size(); i++)
    {
        calculated[mInitObject["to"].mArray[i].mString]++;
    }

    for (std::map<std::string, int>::iterator iter = calculated.begin(); iter != calculated.end(); iter++)
    {
        mMessageJSON["to"].mArray.push_back(JSONValue(iter->first));
    }

    //3. Fill in results
    mMessageJSON["from"]        = std::string(InboxScreen::mEmailAddress);
    mMessageJSON["date"]        = date;
    mMessageJSON["audio"]       = audioName;
    mMessageJSON["in-reply-to"] = mInitObject["audio"];

    tFile(tFile::kTemporaryDirectory, "message.json").write(JSONValue(mMessageJSON).toString().c_str());
}

void RecordMessageScreen::clearDataAndReloadTableEntry()
{
    mForceLogout = false;

    mInitObject = JSONObject();
    mInitObject["to"] = JSONArray();

    if (mSound)
    {
        delete mSound; mSound = NULL;
    }

    [mPeer refreshExpanded];
}

void RecordMessageScreen::copyRecipientsAndReloadTableEntry()
{
    mInitObject = JSONObject();
    mInitObject["to"] = mNewMessageRecipients;

    if (mSound)
    {
        delete mSound; mSound = NULL;
    }

    [mPeer refreshExpanded];
}

void RecordMessageScreen::letDidRecordBeFalseEntry()
{
    mDidRecord = false;
}

void RecordMessageScreen::letDidRecordBeTrueEntry()
{
    mDidRecord = true;

    [mPeer setBlockingViewVisible:false];
}

void RecordMessageScreen::pauseAudioEntry()
{
    if (mSound)
    {
        mAlreadyPlayedTimeMS = tTimer::getTimeMS() - mStartTimeMS;

        mSound->pause();
    }
}

void RecordMessageScreen::playAudioEntry()
{
    if (mSound)
    {
        mStartTimeMS = tTimer::getTimeMS();
        mSliderUpdateTimer->start();

        mSound->play();
    }
}

void RecordMessageScreen::resumeAudioEntry()
{
    if (mSound)
    {
        mStartTimeMS = tTimer::getTimeMS() - mAlreadyPlayedTimeMS;

        mSound->resume();
    }
}

void RecordMessageScreen::startRecordingAudioEntry()
{
    if (mTenMinuteTimer)    { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }

    mTenMinuteTimer = new tTimer(10 * 60 * 1000, 1); // 10 minutes = 10 * 60 seconds = 10 * 60 * 1000 milliseconds
    mTenMinuteTimer->attach(this);
    mTenMinuteTimer->start();

    mRecrodSeconds = 0;
    mRecordTimer->start();

    [gAppDelegateInstance startRecorder];
}

void RecordMessageScreen::stopAudioEntry()
{
    if (mSound)
    {
        mSliderUpdateTimer->stop();
        mSound->stop();
    }
}

void RecordMessageScreen::stopPlayingBeforePopEntry()
{
    if (mSound)
    {
        mSliderUpdateTimer->stop();
        mSound->stop();
    }
}

void RecordMessageScreen::stopPlayingBeforeSendEntry()
{
    if (mSound)
    {
        mSliderUpdateTimer->stop();
        mSound->stop();
    }
}

void RecordMessageScreen::stopRecordingAudioEntry()
{
    mRecordTimer->stop();
    [gAppDelegateInstance stopRecorder];
}

#pragma mark Sending to server

void RecordMessageScreen::sendPostAudioToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "postAudio"));
    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress));
    params.push_back(std::pair<std::string, std::string>("audio", mMessageJSON["audio"].mString));
    params.push_back(std::pair<std::string, std::string>("authToken", InboxScreen::mToken));

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "10485760"));

    URLLoader::getInstance()->postFile(this, kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "scratch.caf"));
}

void RecordMessageScreen::sendPostTranscriptToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "postTranscription"));
    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress));
    params.push_back(std::pair<std::string, std::string>("audio", mMessageJSON["audio"].mString));
    params.push_back(std::pair<std::string, std::string>("authToken", InboxScreen::mToken));

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "10485760"));

    mTranscription["ja"] = [mPeer getTranscription];
    tFile(tFile::kTemporaryDirectory, "transcript.json").write(JSONValue(mTranscription).toString().c_str());

    URLLoader::getInstance()->postFile(this, kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "transcript.json"));
}

void RecordMessageScreen::sendPostMessageToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "postMessage"));
    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress));
    params.push_back(std::pair<std::string, std::string>("authToken", InboxScreen::mToken));

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "10485760"));

    URLLoader::getInstance()->postFile(this, kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "message.json"));
}


#pragma mark UI

void RecordMessageScreen::showComposeNewMessageEntry()
{
    //"Compose new message? Old message will be discarded."
    tConfirm("作成中のメッセージを破棄し、新しくメッセージを作成してよろしいですか？");
}

void RecordMessageScreen::showConfirmDeleteEntry()
{
    //"Delete this message?"
    tConfirm("削除してよろしいですか？");
}

void RecordMessageScreen::showConfirmSendEntry()
{
    //"Do you want to send this message?"
    tConfirm("このメッセージを送信してよろしいですか？");
}

void RecordMessageScreen::showNoAudioToSendEntry()
{
    //"Please add audio first."
    tAlert("送信前に録音してください。");
}

void RecordMessageScreen::showNoContactsToSendToEntry()
{
    //"Please add some recipients first."
    tAlert("先に宛先のメンバーを指定してください");
}

void RecordMessageScreen::showPostAudioFailedEntry()
{
    //"Could not send audio to server."
    tAlert("音声データをサーバに送信できませんでした");
}

#pragma mark Sending messages to other machines
void RecordMessageScreen::sendForceLogoutToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kForceLogout));
}

void RecordMessageScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void RecordMessageScreen::CallEntry()
{
	switch(mState)
	{
		case kCalculateMessageJSON: calculateMessageJSONEntry(); break;
		case kClearDataAndReloadTable: clearDataAndReloadTableEntry(); break;
		case kCopyRecipientsAndReloadTable: copyRecipientsAndReloadTableEntry(); break;
		case kDidWeRecord: didWeRecordEntry(); break;
		case kDoWeHaveContactsToSendTo: doWeHaveContactsToSendToEntry(); break;
		case kDoWeHaveRecipientsOrARecording: doWeHaveRecipientsOrARecordingEntry(); break;
		case kDoWeNeedToWaitForTranscription: doWeNeedToWaitForTranscriptionEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kFixRecipientList: fixRecipientListEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsThisAForcedCancel: isThisAForcedCancelEntry(); break;
		case kLetDidRecordBeFalse: letDidRecordBeFalseEntry(); break;
		case kLetDidRecordBeTrue: letDidRecordBeTrueEntry(); break;
		case kPauseAudio: pauseAudioEntry(); break;
		case kPausedIdle: pausedIdleEntry(); break;
		case kPeerPopAllInboxViews: peerPopAllInboxViewsEntry(); break;
		case kPeerStartEditingTranscription: peerStartEditingTranscriptionEntry(); break;
		case kPeerSwitchToInboxTab: peerSwitchToInboxTabEntry(); break;
		case kPeerSwitchToNewMemoTab: peerSwitchToNewMemoTabEntry(); break;
		case kPlayAudio: playAudioEntry(); break;
		case kPlayingIdle: playingIdleEntry(); break;
		case kRecordingIdle: recordingIdleEntry(); break;
		case kResumeAudio: resumeAudioEntry(); break;
		case kSendForceLogoutToVC: sendForceLogoutToVCEntry(); break;
		case kSendPostAudioToServer: sendPostAudioToServerEntry(); break;
		case kSendPostMessageToServer: sendPostMessageToServerEntry(); break;
		case kSendPostTranscriptToServer: sendPostTranscriptToServerEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kShowComposeNewMessage: showComposeNewMessageEntry(); break;
		case kShowConfirmDelete: showConfirmDeleteEntry(); break;
		case kShowConfirmSend: showConfirmSendEntry(); break;
		case kShowNoAudioToSend: showNoAudioToSendEntry(); break;
		case kShowNoContactsToSendTo: showNoContactsToSendToEntry(); break;
		case kShowPostAudioFailed: showPostAudioFailedEntry(); break;
		case kStart: startEntry(); break;
		case kStartRecordingAudio: startRecordingAudioEntry(); break;
		case kStopAudio: stopAudioEntry(); break;
		case kStopPlayingBeforePop: stopPlayingBeforePopEntry(); break;
		case kStopPlayingBeforeSend: stopPlayingBeforeSendEntry(); break;
		case kStopRecordingAudio: stopRecordingAudioEntry(); break;
		case kWaitForTranscriptionIdle: waitForTranscriptionIdleEntry(); break;
		case kWaitToPlayIdle: waitToPlayIdleEntry(); break;
		case kWaitToRecordIdle: waitToRecordIdleEntry(); break;
		case kWasPostAudioSuccessful: wasPostAudioSuccessfulEntry(); break;
		case kWasPostMessageSuccessful: wasPostMessageSuccessfulEntry(); break;
		case kWasPostTranscriptSuccessful: wasPostTranscriptSuccessfulEntry(); break;
		default: break;
	}
}

void RecordMessageScreen::CallExit()
{
	switch(mState)
	{
		case kRecordingIdle: recordingIdleExit(); break;
		default: break;
	}
}

int  RecordMessageScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kCalculateMessageJSON) && (evt == kNext)) return kSendPostAudioToServer; else
	if ((mState == kClearDataAndReloadTable) && (evt == kNext)) return kLetDidRecordBeFalse; else
	if ((mState == kCopyRecipientsAndReloadTable) && (evt == kNext)) return kFixRecipientList; else
	if ((mState == kDidWeRecord) && (evt == kNo)) return kWaitToRecordIdle; else
	if ((mState == kDidWeRecord) && (evt == kYes)) return kWaitToPlayIdle; else
	if ((mState == kDoWeHaveContactsToSendTo) && (evt == kNo)) return kShowNoContactsToSendTo; else
	if ((mState == kDoWeHaveContactsToSendTo) && (evt == kYes)) return kShowConfirmSend; else
	if ((mState == kDoWeHaveRecipientsOrARecording) && (evt == kNo)) return kCopyRecipientsAndReloadTable; else
	if ((mState == kDoWeHaveRecipientsOrARecording) && (evt == kYes)) return kShowComposeNewMessage; else
	if ((mState == kDoWeNeedToWaitForTranscription) && (evt == kNo)) return kLetDidRecordBeTrue; else
	if ((mState == kDoWeNeedToWaitForTranscription) && (evt == kYes)) return kWaitForTranscriptionIdle; else
	if ((mState == kFixRecipientList) && (evt == kNext)) return kLetDidRecordBeFalse; else
	if ((mState == kIsThisAForcedCancel) && (evt == kNo)) return kShowConfirmDelete; else
	if ((mState == kIsThisAForcedCancel) && (evt == kYes)) return kClearDataAndReloadTable; else
	if ((mState == kLetDidRecordBeFalse) && (evt == kNext)) return kDidWeRecord; else
	if ((mState == kLetDidRecordBeTrue) && (evt == kNext)) return kDidWeRecord; else
	if ((mState == kPauseAudio) && (evt == kNext)) return kPausedIdle; else
	if ((mState == kPausedIdle) && (evt == kCancelPressed)) return kStopPlayingBeforePop; else
	if ((mState == kPausedIdle) && (evt == kNewMessage)) return kPeerSwitchToNewMemoTab; else
	if ((mState == kPausedIdle) && (evt == kPlayPressed)) return kResumeAudio; else
	if ((mState == kPausedIdle) && (evt == kSendPressed)) return kStopPlayingBeforeSend; else
	if ((mState == kPeerPopAllInboxViews) && (evt == kNext)) return kPeerSwitchToInboxTab; else
	if ((mState == kPeerStartEditingTranscription) && (evt == kNext)) return kLetDidRecordBeTrue; else
	if ((mState == kPeerSwitchToInboxTab) && (evt == kNext)) return kClearDataAndReloadTable; else
	if ((mState == kPeerSwitchToNewMemoTab) && (evt == kNext)) return kDoWeHaveRecipientsOrARecording; else
	if ((mState == kPlayAudio) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kPlayingIdle) && (evt == kCancelPressed)) return kStopPlayingBeforePop; else
	if ((mState == kPlayingIdle) && (evt == kFinishedPlaying)) return kStopAudio; else
	if ((mState == kPlayingIdle) && (evt == kPausePressed)) return kPauseAudio; else
	if ((mState == kPlayingIdle) && (evt == kSendPressed)) return kStopPlayingBeforeSend; else
	if ((mState == kRecordingIdle) && (evt == kStopPressed)) return kStopRecordingAudio; else
	if ((mState == kResumeAudio) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kSendForceLogoutToVC) && (evt == kNext)) return kClearDataAndReloadTable; else
	if ((mState == kSendPostAudioToServer) && (evt == kFail)) return kShowPostAudioFailed; else
	if ((mState == kSendPostAudioToServer) && (evt == kSuccess)) return kWasPostAudioSuccessful; else
	if ((mState == kSendPostMessageToServer) && (evt == kFail)) return kShowPostAudioFailed; else
	if ((mState == kSendPostMessageToServer) && (evt == kSuccess)) return kWasPostMessageSuccessful; else
	if ((mState == kSendPostTranscriptToServer) && (evt == kFail)) return kShowPostAudioFailed; else
	if ((mState == kSendPostTranscriptToServer) && (evt == kSuccess)) return kWasPostTranscriptSuccessful; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerPopAllInboxViews; else
	if ((mState == kShowComposeNewMessage) && (evt == kNo)) return kDidWeRecord; else
	if ((mState == kShowComposeNewMessage) && (evt == kYes)) return kCopyRecipientsAndReloadTable; else
	if ((mState == kShowConfirmDelete) && (evt == kNo)) return kDidWeRecord; else
	if ((mState == kShowConfirmDelete) && (evt == kYes)) return kClearDataAndReloadTable; else
	if ((mState == kShowConfirmSend) && (evt == kNo)) return kWaitToPlayIdle; else
	if ((mState == kShowConfirmSend) && (evt == kYes)) return kCalculateMessageJSON; else
	if ((mState == kShowNoAudioToSend) && (evt == kYes)) return kWaitToRecordIdle; else
	if ((mState == kShowNoContactsToSendTo) && (evt == kYes)) return kWaitToPlayIdle; else
	if ((mState == kShowPostAudioFailed) && (evt == kYes)) return kSendReloadInboxToVC; else
	if ((mState == kStart) && (evt == kNext)) return kFixRecipientList; else
	if ((mState == kStartRecordingAudio) && (evt == kNext)) return kRecordingIdle; else
	if ((mState == kStopAudio) && (evt == kNext)) return kDidWeRecord; else
	if ((mState == kStopPlayingBeforePop) && (evt == kNext)) return kIsThisAForcedCancel; else
	if ((mState == kStopPlayingBeforeSend) && (evt == kNext)) return kDoWeHaveContactsToSendTo; else
	if ((mState == kStopRecordingAudio) && (evt == kNext)) return kDoWeNeedToWaitForTranscription; else
	if ((mState == kWaitForTranscriptionIdle) && (evt == kNewMessage)) return kPeerSwitchToNewMemoTab; else
	if ((mState == kWaitForTranscriptionIdle) && (evt == kTranscriptionReady)) return kPeerStartEditingTranscription; else
	if ((mState == kWaitToPlayIdle) && (evt == kCancelPressed)) return kIsThisAForcedCancel; else
	if ((mState == kWaitToPlayIdle) && (evt == kNewMessage)) return kPeerSwitchToNewMemoTab; else
	if ((mState == kWaitToPlayIdle) && (evt == kPlayPressed)) return kPlayAudio; else
	if ((mState == kWaitToPlayIdle) && (evt == kSendPressed)) return kDoWeHaveContactsToSendTo; else
	if ((mState == kWaitToRecordIdle) && (evt == kCancelPressed)) return kIsThisAForcedCancel; else
	if ((mState == kWaitToRecordIdle) && (evt == kNewMessage)) return kPeerSwitchToNewMemoTab; else
	if ((mState == kWaitToRecordIdle) && (evt == kRecordPressed)) return kStartRecordingAudio; else
	if ((mState == kWaitToRecordIdle) && (evt == kSendPressed)) return kShowNoAudioToSend; else
	if ((mState == kWasPostAudioSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasPostAudioSuccessful) && (evt == kNo)) return kShowPostAudioFailed; else
	if ((mState == kWasPostAudioSuccessful) && (evt == kYes)) return kSendPostTranscriptToServer; else
	if ((mState == kWasPostMessageSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasPostMessageSuccessful) && (evt == kNo)) return kShowPostAudioFailed; else
	if ((mState == kWasPostMessageSuccessful) && (evt == kYes)) return kSendReloadInboxToVC; else
	if ((mState == kWasPostTranscriptSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasPostTranscriptSuccessful) && (evt == kNo)) return kShowPostAudioFailed; else
	if ((mState == kWasPostTranscriptSuccessful) && (evt == kYes)) return kSendPostMessageToServer;

	return kInvalidState;
}

bool RecordMessageScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kCalculateMessageJSON:
		case kClearDataAndReloadTable:
		case kCopyRecipientsAndReloadTable:
		case kFixRecipientList:
		case kLetDidRecordBeFalse:
		case kLetDidRecordBeTrue:
		case kPauseAudio:
		case kPeerPopAllInboxViews:
		case kPeerStartEditingTranscription:
		case kPeerSwitchToInboxTab:
		case kPeerSwitchToNewMemoTab:
		case kPlayAudio:
		case kResumeAudio:
		case kSendForceLogoutToVC:
		case kSendReloadInboxToVC:
		case kStart:
		case kStartRecordingAudio:
		case kStopAudio:
		case kStopPlayingBeforePop:
		case kStopPlayingBeforeSend:
		case kStopRecordingAudio:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void RecordMessageScreen::update(const RecordMessageScreenMessage& msg)
{
	process(msg.mEvent);
}

void RecordMessageScreen::update(const tSoundEvent& msg)
{
    switch (msg.mEvent)
    {
        case tSoundEvent::kSoundPlayingComplete:    process(kFinishedPlaying); break;

        default:
            break;
    }
}

void RecordMessageScreen::update(const URLLoaderEvent& msg)
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
                    case kSendPostAudioToServer:
                        mPostAudioJSON = JSONUtil::extract(msg.mString);
                        break;

                    case kSendPostMessageToServer:
                        mPostMessageJSON = JSONUtil::extract(msg.mString);
                        break;

                    case kSendPostTranscriptToServer:
                        mPostTranscriptJSON = JSONUtil::extract(msg.mString);
                        break;

                    default:
                        break;
                }
            }
                process(kSuccess);
                break;

            case URLLoaderEvent::kLoadedFile: process(kSuccess); break;

            default:
                break;
        }
    }
}

void RecordMessageScreen::update(const GCTEvent& msg)
{
    switch(msg.mEvent)
    {
        case GCTEvent::kForceLogin:
            mForceLogout = false;
            break;

        case GCTEvent::kForceLogout:
            mForceLogout = true;
            break;

        case GCTEvent::kInboxTabPressed:
        case GCTEvent::kNewMemoTabPressed:
        case GCTEvent::kContactsTabPressed:
        case GCTEvent::kSettingsTabPressed:
            switch (getState())
            {
                case kPlayingIdle:   process(kPausePressed); break;
                case kRecordingIdle: process(kStopPressed); break;

                default:
                    break;
            }
            break;

        case GCTEvent::kNewMessageToGroup:
            mNewMessageRecipients = msg.mGroup;
            [mPeer setBlockingViewVisible:false];
            process(kNewMessage);
            break;

        case GCTEvent::kAppendNewContact:
            if (msg.mIdentifier == this)
            {
                bool found = false;

                for(size_t i = 0; i < mInitObject["to"].mArray.size(); i++)
                {
                    found |= (mInitObject["to"].mArray[i].mString == msg.mContact);
                }

                if (!found)
                {
                    mInitObject["to"].mArray.push_back(msg.mContact);
                    [mPeer refreshExpanded];
                }
            }
            break;

        case GCTEvent::kAppendNewGroup:
            if (msg.mIdentifier == this)
            {
                for(size_t j = 0; j < msg.mGroup.size(); j++)
                {
                    bool found = false;

                    for(size_t i = 0; i < mInitObject["to"].mArray.size(); i++)
                    {
                        found |= (mInitObject["to"].mArray[i].mString == msg.mGroup[j].mString);
                    }

                    if (!found)
                    {
                        mInitObject["to"].mArray.push_back(msg.mGroup[j].mString);
                    }
                }
                [mPeer refreshExpanded];
            }
            break;

        case GCTEvent::kTranscriptFinished:
            {
                mGotTranscriptionEvent = true;

                [mPeer setTranscription:msg.mTranscription];
                [mPeer setTranscriptionEnabled:true];

                mTranscription["ja"] = msg.mTranscription;
                tFile(tFile::kTemporaryDirectory, "transcript.json").write(JSONValue(mTranscription).toString().c_str());

                if (getState() == kWaitForTranscriptionIdle)
                {
                    process(kTranscriptionReady);
                }
            }
            break;

        default:
            switch (getState())
            {
                case kShowComposeNewMessage:
                case kShowConfirmDelete:
                case kShowConfirmSend:
                case kShowNoAudioToSend:
                case kShowNoContactsToSendTo:
                case kShowPostAudioFailed:
                    switch(msg.mEvent)
                    {
                        case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
                        case GCTEvent::kNoAlertPressed:     process(kNo); break;

                        default:
                            break;
                    }
                    break;

                default:
                    break;
            }
            break;
    }
}

void RecordMessageScreen::update(const tTimerEvent& msg)
{
    switch (msg.mEvent)
    {
        case tTimer::kTimerTick:
            if (msg.mTimer == mRecordTimer)
            {
                mRecrodSeconds++;
                char buf[80];
                sprintf(buf, "%02lu:%02lu", mRecrodSeconds / 60, mRecrodSeconds % 60);
                [mPeer setTimeLabel:buf];
            }
            else
            {
                if (getState() == kPlayingIdle)
                {
                    if (mSound)
                    {
                        [mPeer setSliderPercentage: float(tTimer::getTimeMS() - mStartTimeMS) / float(mSound->getDurationMS()) * 100.0f];
                    }
                }
            }
            break;
        case tTimer::kTimerCompleted:
            if (msg.mTimer == mTenMinuteTimer)
            {
                if (mTenMinuteTimer) { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }

                if (getState() == kRecordingIdle)
                {
                    process(kStopPressed);
                    //"Record limit is 10 minutes. Recording will now stop"
                    tAlert("録音時間は最大１０分です。録音を終了します。");
                }
            }
            break;

        default:
            break;
    }
}

