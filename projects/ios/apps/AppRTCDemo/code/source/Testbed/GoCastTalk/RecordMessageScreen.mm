#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "RecordMessageVC.h"

#pragma mark Constructor / Destructor
RecordMessageScreen::RecordMessageScreen(RecordMessageVC* newVC, const JSONObject& initObject)
:   mPeer(newVC),
    mInitObject(initObject)
{
	ConstructMachine();
}

RecordMessageScreen::~RecordMessageScreen()
{
	DestructMachine();
}

#pragma mark Public methods
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

#pragma mark Start / End / Invalid
void RecordMessageScreen::startEntry()
{
    mSound = NULL;
    mDidRecord = false;

    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);
}

void RecordMessageScreen::endEntry()
{
    if (mSound) { delete mSound; mSound = NULL; }
}

void RecordMessageScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling

void RecordMessageScreen::waitToRecordIdleEntry()
{
    [mPeer setWaitToRecordUI];
    printf("%s\n", "wait to record");
}

void RecordMessageScreen::waitToPlayIdleEntry()
{
    [mPeer setWaitToPlayUI];
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

void RecordMessageScreen::waitForTranscriptionEntry()
{
    [mPeer setWaitForTranscriptUI];
    printf("%s\n", "waiting for transcript");
}

#pragma mark Peer communication
void RecordMessageScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

#pragma mark Queries

void RecordMessageScreen::didWeRecordEntry()
{
    SetImmediateEvent(mDidRecord ? kYes : kNo);
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

#pragma mark Actions
void RecordMessageScreen::letDidRecordBeFalseEntry()
{
    mDidRecord = false;
}

void RecordMessageScreen::letDidRecordBeTrueEntry()
{
    mDidRecord = true;
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
    if (!mSound)
    {
        mSound = new tSound(tFile(tFile::kTemporaryDirectory, "scratch.wav"));
        mSound->attach(this);
    }

    mSound->play();
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

void RecordMessageScreen::stopRecordingBeforePopEntry()
{
    [gAppDelegateInstance stopRecorder];
}

void RecordMessageScreen::stopRecordingBeforeSendEntry()
{
    [gAppDelegateInstance stopRecorder];
}

#pragma mark Sending to server

void RecordMessageScreen::sendPostAudioToServerEntry()
{
    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "postAudio"));
    params.push_back(std::pair<std::string, std::string>("from", "tjgrant@tatewake.com"));

//    for (size_t i = 0; i < mSelectedGroup.size(); i++)
//    {
//        params.push_back(std::pair<std::string, std::string>("group[]", mSelectedGroup[i].mString));
//    }

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "10485760"));

    URLLoader::getInstance()->postFile(3, kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "scratch.wav"));
}

void RecordMessageScreen::sendPostTranscriptToServerEntry()
{
    //TODO: Implement
    //    std::vector<std::pair<std::string, std::string> > params;
    //
    //    params.push_back(std::pair<std::string, std::string>("action", "postTranscript"));
    //    params.push_back(std::pair<std::string, std::string>("from", "tjgrant@tatewake.com"));
    //
    //    for (size_t i = 0; i < mSelectedGroup.size(); i++)
    //    {
    //        params.push_back(std::pair<std::string, std::string>("group[]", mSelectedGroup[i].mString));
    //    }
    //
    //    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "10485760"));
    //
    //    URLLoader::getInstance()->postFile(kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "transcript.json"));

    //TODO: Hack
    update(kSuccess);
}

#pragma mark UI

void RecordMessageScreen::setWaitForPostAudioEntry()
{
    //TODO
}

void RecordMessageScreen::showNoAudioToSendEntry()
{
    tAlert("Please record audio first.");
}

void RecordMessageScreen::showPostAudioFailedEntry()
{
    tAlert("Could not send audio to server.");
}

#pragma mark State wiring
void RecordMessageScreen::CallEntry()
{
	switch(mState)
	{
		case kDidWeRecord: didWeRecordEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kLetDidRecordBeFalse: letDidRecordBeFalseEntry(); break;
		case kLetDidRecordBeTrue: letDidRecordBeTrueEntry(); break;
		case kPauseAudio: pauseAudioEntry(); break;
		case kPausedIdle: pausedIdleEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kPlayAudio: playAudioEntry(); break;
		case kPlayingIdle: playingIdleEntry(); break;
		case kRecordingIdle: recordingIdleEntry(); break;
		case kResumeAudio: resumeAudioEntry(); break;
		case kSendPostAudioToServer: sendPostAudioToServerEntry(); break;
		case kSendPostTranscriptToServer: sendPostTranscriptToServerEntry(); break;
		case kSetWaitForPostAudio: setWaitForPostAudioEntry(); break;
		case kShowNoAudioToSend: showNoAudioToSendEntry(); break;
		case kShowPostAudioFailed: showPostAudioFailedEntry(); break;
		case kStart: startEntry(); break;
		case kStartRecordingAudio: startRecordingAudioEntry(); break;
		case kStopAudio: stopAudioEntry(); break;
		case kStopPlayingBeforePop: stopPlayingBeforePopEntry(); break;
		case kStopPlayingBeforeSend: stopPlayingBeforeSendEntry(); break;
		case kStopRecordingAudio: stopRecordingAudioEntry(); break;
		case kStopRecordingBeforePop: stopRecordingBeforePopEntry(); break;
		case kStopRecordingBeforeSend: stopRecordingBeforeSendEntry(); break;
		case kWaitForTranscription: waitForTranscriptionEntry(); break;
		case kWaitToPlayIdle: waitToPlayIdleEntry(); break;
		case kWaitToRecordIdle: waitToRecordIdleEntry(); break;
		case kWasPostAudioSuccessful: wasPostAudioSuccessfulEntry(); break;
		case kWasPostTranscriptSuccessful: wasPostTranscriptSuccessfulEntry(); break;
		default: break;
	}
}

void RecordMessageScreen::CallExit()
{
}

int  RecordMessageScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDidWeRecord) && (evt == kNo)) return kWaitToRecordIdle; else
	if ((mState == kDidWeRecord) && (evt == kYes)) return kWaitToPlayIdle; else
	if ((mState == kLetDidRecordBeFalse) && (evt == kNext)) return kDidWeRecord; else
	if ((mState == kLetDidRecordBeTrue) && (evt == kNext)) return kDidWeRecord; else
	if ((mState == kPauseAudio) && (evt == kNext)) return kPausedIdle; else
	if ((mState == kPausedIdle) && (evt == kCancelPressed)) return kStopPlayingBeforePop; else
	if ((mState == kPausedIdle) && (evt == kPlayPressed)) return kResumeAudio; else
	if ((mState == kPausedIdle) && (evt == kSendPressed)) return kStopPlayingBeforeSend; else
	if ((mState == kPlayAudio) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kPlayingIdle) && (evt == kCancelPressed)) return kStopPlayingBeforePop; else
	if ((mState == kPlayingIdle) && (evt == kFinishedPlaying)) return kStopAudio; else
	if ((mState == kPlayingIdle) && (evt == kPausePressed)) return kPauseAudio; else
	if ((mState == kPlayingIdle) && (evt == kSendPressed)) return kStopPlayingBeforeSend; else
	if ((mState == kRecordingIdle) && (evt == kCancelPressed)) return kStopRecordingBeforePop; else
	if ((mState == kRecordingIdle) && (evt == kRecordPressed)) return kStopRecordingAudio; else
	if ((mState == kRecordingIdle) && (evt == kSendPressed)) return kStopRecordingBeforeSend; else
	if ((mState == kResumeAudio) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kSendPostAudioToServer) && (evt == kFail)) return kShowPostAudioFailed; else
	if ((mState == kSendPostAudioToServer) && (evt == kSuccess)) return kWasPostAudioSuccessful; else
	if ((mState == kSendPostTranscriptToServer) && (evt == kFail)) return kShowPostAudioFailed; else
	if ((mState == kSendPostTranscriptToServer) && (evt == kSuccess)) return kWasPostTranscriptSuccessful; else
	if ((mState == kSetWaitForPostAudio) && (evt == kNext)) return kSendPostAudioToServer; else
	if ((mState == kShowNoAudioToSend) && (evt == kYes)) return kWaitToRecordIdle; else
	if ((mState == kShowPostAudioFailed) && (evt == kYes)) return kPeerPopSelf; else
	if ((mState == kStart) && (evt == kNext)) return kLetDidRecordBeFalse; else
	if ((mState == kStartRecordingAudio) && (evt == kNext)) return kRecordingIdle; else
	if ((mState == kStopAudio) && (evt == kNext)) return kDidWeRecord; else
	if ((mState == kStopPlayingBeforePop) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kStopPlayingBeforeSend) && (evt == kNext)) return kSetWaitForPostAudio; else
	if ((mState == kStopRecordingAudio) && (evt == kNext)) return kWaitForTranscription; else
	if ((mState == kStopRecordingBeforePop) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kStopRecordingBeforeSend) && (evt == kNext)) return kSetWaitForPostAudio; else
	if ((mState == kWaitForTranscription) && (evt == kCancelPressed)) return kWaitForTranscription; else
	if ((mState == kWaitForTranscription) && (evt == kSendPressed)) return kWaitForTranscription; else
	if ((mState == kWaitForTranscription) && (evt == kTranscriptionReady)) return kLetDidRecordBeTrue; else
	if ((mState == kWaitToPlayIdle) && (evt == kCancelPressed)) return kPeerPopSelf; else
	if ((mState == kWaitToPlayIdle) && (evt == kPlayPressed)) return kPlayAudio; else
	if ((mState == kWaitToPlayIdle) && (evt == kSendPressed)) return kSetWaitForPostAudio; else
	if ((mState == kWaitToRecordIdle) && (evt == kCancelPressed)) return kPeerPopSelf; else
	if ((mState == kWaitToRecordIdle) && (evt == kRecordPressed)) return kStartRecordingAudio; else
	if ((mState == kWaitToRecordIdle) && (evt == kSendPressed)) return kShowNoAudioToSend; else
	if ((mState == kWasPostAudioSuccessful) && (evt == kNo)) return kShowPostAudioFailed; else
	if ((mState == kWasPostAudioSuccessful) && (evt == kYes)) return kSendPostTranscriptToServer; else
	if ((mState == kWasPostTranscriptSuccessful) && (evt == kNo)) return kShowPostAudioFailed; else
	if ((mState == kWasPostTranscriptSuccessful) && (evt == kYes)) return kPeerPopSelf;

	return kInvalidState;
}

bool RecordMessageScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kLetDidRecordBeFalse:
		case kLetDidRecordBeTrue:
		case kPauseAudio:
		case kPlayAudio:
		case kResumeAudio:
		case kSetWaitForPostAudio:
		case kStart:
		case kStartRecordingAudio:
		case kStopAudio:
		case kStopPlayingBeforePop:
		case kStopPlayingBeforeSend:
		case kStopRecordingAudio:
		case kStopRecordingBeforePop:
		case kStopRecordingBeforeSend:
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
    if (msg.mId == 3)
    {
        [gAppDelegateInstance setBlockingViewVisible:false];

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
#pragma unused(msg)
    switch (getState())
    {
        case kShowNoAudioToSend:
        case kShowPostAudioFailed:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
                case GCTEvent::kNoAlertPressed:     process(kNo); break;

                default:
                    break;
            }
            break;

        case kWaitForTranscription:
            switch (msg.mEvent)
            {
                case GCTEvent::kTranscriptFinished:
                    mTranscription = msg.mTranscription;
                    printf("*** Got transcription: %s\n", mTranscription.c_str());
                    process(kTranscriptionReady);
                    break;

                default:
                    break;
            }
            break;

        default:
            break;
    }
}

