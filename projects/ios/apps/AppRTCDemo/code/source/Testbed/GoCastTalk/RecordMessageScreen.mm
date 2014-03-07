#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "RecordMessageVC.h"

#pragma mark Constructor / Destructor
RecordMessageScreen::RecordMessageScreen(RecordMessageVC* newVC, const JSONObject& initObject, bool newIsForwarded, bool newIsChild)
:   mPeer(newVC),
    mInitObject(initObject),
    mIsForwarded(newIsForwarded),
    mIsChild(newIsChild),
    mDidPost(false),
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
    mSound = NULL;
    mTenMinuteTimer = NULL;
    mDidRecord = false;

    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);
}

void RecordMessageScreen::endEntry()
{
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
    [mPeer setTranscription:"Transcription pending"];
    [mPeer setTranscriptionEnabled:false];

    printf("%s\n", "wait to record");
}

void RecordMessageScreen::waitToPlayIdleEntry()
{
    [mPeer setWaitToPlayUI];

    if (!mSound)
    {
        if (mIsForwarded)
        {
            mSound = new tSound(tFile(tFile::kDocumentsDirectory, mInitObject["audio"].mString));
        }
        else
        {
            mSound = new tSound(tFile(tFile::kTemporaryDirectory, "scratch.caf"));
        }
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

    printf("%s\n", "wait to play");
}

void RecordMessageScreen::playingIdleEntry()
{
    [mPeer setPlayingUI];
    printf("%s\n", "playing");
}

void RecordMessageScreen::pausedIdleEntry()
{
    [mPeer setPausedUI];
    printf("%s\n", "paused");
}

void RecordMessageScreen::recordingIdleEntry()
{
    [mPeer setRecordingUI];
    printf("%s\n", "recording");
}

void RecordMessageScreen::recordingIdleExit()
{
    if (mTenMinuteTimer)    { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }
}

void RecordMessageScreen::waitForTranscriptionIdleEntry()
{
    [mPeer setWaitForTranscriptUI];
    printf("%s\n", "waiting for transcript");
}

#pragma mark Peer communication
void RecordMessageScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

void RecordMessageScreen::peerPushMessageSentEntry()
{
    [mPeer pushMessageSent];
}

#pragma mark Queries

void RecordMessageScreen::areWeTheNewMemoTabEntry()
{
    SetImmediateEvent(!mIsChild ? kYes : kNo);
}

void RecordMessageScreen::didWeRecordEntry()
{
    SetImmediateEvent(mDidRecord ? kYes : kNo);
}

void RecordMessageScreen::doWeHaveContactsToSendToEntry()
{
    SetImmediateEvent(!mInitObject["to"].mArray.empty() ? kYes : kNo);
}

void RecordMessageScreen::doWeNeedToWaitForTranscriptionEntry()
{
    SetImmediateEvent(mGotTranscriptionEvent ? kNo : kYes);
}

void RecordMessageScreen::isDidPostTrueEntry()
{
    SetImmediateEvent(mDidPost ? kYes : kNo);
}

void RecordMessageScreen::isForwardingMessageEntry()
{
    SetImmediateEvent(mIsForwarded ? kYes : kNo);
}

void RecordMessageScreen::wasPostAudioSuccessfulEntry()
{
    bool result = false;

    if (mPostAudioJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void RecordMessageScreen::wasPostTranscriptSuccessfulEntry()
{
    bool result = false;

    if (mPostTranscriptJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void RecordMessageScreen::wasPostMessageSuccessfulEntry()
{
    bool result = false;

    if (mPostMessageJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void RecordMessageScreen::calculateMessageJSONEntry()
{
    std::map<std::string, int> calculated;
    std::string date;
    std::string audioName;

    //0. Clear results
    mMessageJSON.clear();

    //1. Calculate date and audio file name
    date = InboxScreen::getGmtString();

    if (mIsForwarded)
    {
        audioName = mInitObject["audio"].mString;
    }
    else
    {
        audioName = date + "-" + InboxScreen::mEmailAddress;
    }

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
    mInitObject = JSONObject();
    mInitObject["to"] = JSONArray();

    if (mSound)
    {
        delete mSound; mSound = NULL;
    }

    [mPeer refreshExpanded];
}

void RecordMessageScreen::letDidPostBeFalseEntry()
{
    mDidPost = false;
}

void RecordMessageScreen::letDidPostBeTrueEntry()
{
    mDidPost = true;
}

void RecordMessageScreen::letDidRecordBeIsForwardedValueEntry()
{
    mDidRecord = mIsForwarded;
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
        mSound->pause();
    }
}

void RecordMessageScreen::playAudioEntry()
{
    if (mSound)
    {
        mSound->play();
    }
}

void RecordMessageScreen::resumeAudioEntry()
{
    if (mSound)
    {
        mSound->resume();
    }
}

void RecordMessageScreen::startRecordingAudioEntry()
{
    if (mTenMinuteTimer)    { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }

    mTenMinuteTimer = new tTimer(10 * 60 * 1000, 1); // 10 minutes = 10 * 60 seconds = 10 * 60 * 1000 milliseconds
    mTenMinuteTimer->attach(this);
    mTenMinuteTimer->start();

    [gAppDelegateInstance startRecorder];
}

void RecordMessageScreen::stopAudioEntry()
{
    if (mSound)
    {
        mSound->stop();
    }
}

void RecordMessageScreen::stopPlayingBeforePopEntry()
{
    if (mSound)
    {
        mSound->stop();
    }
}

void RecordMessageScreen::stopPlayingBeforeSendEntry()
{
    if (mSound)
    {
        mSound->stop();
    }
}

void RecordMessageScreen::stopRecordingAudioEntry()
{
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

void RecordMessageScreen::setWaitForPostAudioEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void RecordMessageScreen::setWaitForTranscriptionEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void RecordMessageScreen::showNoContactsToSendToEntry()
{
    tAlert("Please add some recipients first.");
}

void RecordMessageScreen::showPostAudioFailedEntry()
{
    tAlert("Could not send audio to server.");
}

#pragma mark Sending messages to other machines
void RecordMessageScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void RecordMessageScreen::CallEntry()
{
	switch(mState)
	{
		case kAreWeTheNewMemoTab: areWeTheNewMemoTabEntry(); break;
		case kCalculateMessageJSON: calculateMessageJSONEntry(); break;
		case kClearDataAndReloadTable: clearDataAndReloadTableEntry(); break;
		case kDidWeRecord: didWeRecordEntry(); break;
		case kDoWeHaveContactsToSendTo: doWeHaveContactsToSendToEntry(); break;
		case kDoWeNeedToWaitForTranscription: doWeNeedToWaitForTranscriptionEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsDidPostTrue: isDidPostTrueEntry(); break;
		case kIsForwardingMessage: isForwardingMessageEntry(); break;
		case kLetDidPostBeFalse: letDidPostBeFalseEntry(); break;
		case kLetDidPostBeTrue: letDidPostBeTrueEntry(); break;
		case kLetDidRecordBeIsForwardedValue: letDidRecordBeIsForwardedValueEntry(); break;
		case kLetDidRecordBeTrue: letDidRecordBeTrueEntry(); break;
		case kPauseAudio: pauseAudioEntry(); break;
		case kPausedIdle: pausedIdleEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kPeerPushMessageSent: peerPushMessageSentEntry(); break;
		case kPlayAudio: playAudioEntry(); break;
		case kPlayingIdle: playingIdleEntry(); break;
		case kRecordingIdle: recordingIdleEntry(); break;
		case kResumeAudio: resumeAudioEntry(); break;
		case kSendPostAudioToServer: sendPostAudioToServerEntry(); break;
		case kSendPostMessageToServer: sendPostMessageToServerEntry(); break;
		case kSendPostTranscriptToServer: sendPostTranscriptToServerEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSetWaitForPostAudio: setWaitForPostAudioEntry(); break;
		case kSetWaitForTranscription: setWaitForTranscriptionEntry(); break;
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
	if ((mState == kAreWeTheNewMemoTab) && (evt == kNo)) return kPeerPopSelf; else
	if ((mState == kAreWeTheNewMemoTab) && (evt == kYes)) return kClearDataAndReloadTable; else
	if ((mState == kCalculateMessageJSON) && (evt == kNext)) return kIsForwardingMessage; else
	if ((mState == kClearDataAndReloadTable) && (evt == kNext)) return kLetDidRecordBeIsForwardedValue; else
	if ((mState == kDidWeRecord) && (evt == kNo)) return kWaitToRecordIdle; else
	if ((mState == kDidWeRecord) && (evt == kYes)) return kWaitToPlayIdle; else
	if ((mState == kDoWeHaveContactsToSendTo) && (evt == kNo)) return kShowNoContactsToSendTo; else
	if ((mState == kDoWeHaveContactsToSendTo) && (evt == kYes)) return kSetWaitForPostAudio; else
	if ((mState == kDoWeNeedToWaitForTranscription) && (evt == kNo)) return kLetDidRecordBeTrue; else
	if ((mState == kDoWeNeedToWaitForTranscription) && (evt == kYes)) return kSetWaitForTranscription; else
	if ((mState == kIsDidPostTrue) && (evt == kNo)) return kAreWeTheNewMemoTab; else
	if ((mState == kIsDidPostTrue) && (evt == kYes)) return kPeerPushMessageSent; else
	if ((mState == kIsForwardingMessage) && (evt == kNo)) return kSendPostAudioToServer; else
	if ((mState == kIsForwardingMessage) && (evt == kYes)) return kSendPostMessageToServer; else
	if ((mState == kLetDidPostBeFalse) && (evt == kNext)) return kDidWeRecord; else
	if ((mState == kLetDidPostBeTrue) && (evt == kNext)) return kSendReloadInboxToVC; else
	if ((mState == kLetDidRecordBeIsForwardedValue) && (evt == kNext)) return kLetDidPostBeFalse; else
	if ((mState == kLetDidRecordBeTrue) && (evt == kNext)) return kDidWeRecord; else
	if ((mState == kPauseAudio) && (evt == kNext)) return kPausedIdle; else
	if ((mState == kPausedIdle) && (evt == kCancelPressed)) return kStopPlayingBeforePop; else
	if ((mState == kPausedIdle) && (evt == kPlayPressed)) return kResumeAudio; else
	if ((mState == kPausedIdle) && (evt == kSendPressed)) return kStopPlayingBeforeSend; else
	if ((mState == kPeerPushMessageSent) && (evt == kNext)) return kAreWeTheNewMemoTab; else
	if ((mState == kPlayAudio) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kPlayingIdle) && (evt == kCancelPressed)) return kStopPlayingBeforePop; else
	if ((mState == kPlayingIdle) && (evt == kFinishedPlaying)) return kStopAudio; else
	if ((mState == kPlayingIdle) && (evt == kPausePressed)) return kPauseAudio; else
	if ((mState == kPlayingIdle) && (evt == kSendPressed)) return kStopPlayingBeforeSend; else
	if ((mState == kRecordingIdle) && (evt == kStopPressed)) return kStopRecordingAudio; else
	if ((mState == kResumeAudio) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kSendPostAudioToServer) && (evt == kFail)) return kShowPostAudioFailed; else
	if ((mState == kSendPostAudioToServer) && (evt == kSuccess)) return kWasPostAudioSuccessful; else
	if ((mState == kSendPostMessageToServer) && (evt == kFail)) return kShowPostAudioFailed; else
	if ((mState == kSendPostMessageToServer) && (evt == kSuccess)) return kWasPostMessageSuccessful; else
	if ((mState == kSendPostTranscriptToServer) && (evt == kFail)) return kShowPostAudioFailed; else
	if ((mState == kSendPostTranscriptToServer) && (evt == kSuccess)) return kWasPostTranscriptSuccessful; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kIsDidPostTrue; else
	if ((mState == kSetWaitForPostAudio) && (evt == kNext)) return kCalculateMessageJSON; else
	if ((mState == kSetWaitForTranscription) && (evt == kNext)) return kWaitForTranscriptionIdle; else
	if ((mState == kShowNoContactsToSendTo) && (evt == kYes)) return kWaitToPlayIdle; else
	if ((mState == kShowPostAudioFailed) && (evt == kYes)) return kSendReloadInboxToVC; else
	if ((mState == kStart) && (evt == kNext)) return kLetDidRecordBeIsForwardedValue; else
	if ((mState == kStartRecordingAudio) && (evt == kNext)) return kRecordingIdle; else
	if ((mState == kStopAudio) && (evt == kNext)) return kDidWeRecord; else
	if ((mState == kStopPlayingBeforePop) && (evt == kNext)) return kSendReloadInboxToVC; else
	if ((mState == kStopPlayingBeforeSend) && (evt == kNext)) return kDoWeHaveContactsToSendTo; else
	if ((mState == kStopRecordingAudio) && (evt == kNext)) return kDoWeNeedToWaitForTranscription; else
	if ((mState == kWaitForTranscriptionIdle) && (evt == kTranscriptionReady)) return kLetDidRecordBeTrue; else
	if ((mState == kWaitToPlayIdle) && (evt == kCancelPressed)) return kSendReloadInboxToVC; else
	if ((mState == kWaitToPlayIdle) && (evt == kPlayPressed)) return kPlayAudio; else
	if ((mState == kWaitToPlayIdle) && (evt == kSendPressed)) return kDoWeHaveContactsToSendTo; else
	if ((mState == kWaitToRecordIdle) && (evt == kRecordPressed)) return kStartRecordingAudio; else
	if ((mState == kWasPostAudioSuccessful) && (evt == kNo)) return kShowPostAudioFailed; else
	if ((mState == kWasPostAudioSuccessful) && (evt == kYes)) return kSendPostTranscriptToServer; else
	if ((mState == kWasPostMessageSuccessful) && (evt == kNo)) return kShowPostAudioFailed; else
	if ((mState == kWasPostMessageSuccessful) && (evt == kYes)) return kLetDidPostBeTrue; else
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
		case kLetDidPostBeFalse:
		case kLetDidPostBeTrue:
		case kLetDidRecordBeIsForwardedValue:
		case kLetDidRecordBeTrue:
		case kPauseAudio:
		case kPeerPushMessageSent:
		case kPlayAudio:
		case kResumeAudio:
		case kSendReloadInboxToVC:
		case kSetWaitForPostAudio:
		case kSetWaitForTranscription:
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
                case kShowPostAudioFailed:
                case kShowNoContactsToSendTo:
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
        case tTimer::kTimerCompleted:
            if (mTenMinuteTimer) { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }

            if (getState() == kRecordingIdle)
            {
                process(kStopPressed);
                tAlert("Record limit is 10 minutes. Recording will now stop");
            }
            break;

        default:
            break;
    }
}

