#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "RecordMessageVC.h"

#define kScreenName "RecordMessage"

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
void RecordMessageScreen::recordPressed()
{
    if (getState() == kIdle)
    {
        update(kRecordButtonPressed);
    }
    else if (getState() == kIdleListening)
    {
        update(kStopPressed);
    }
}

void RecordMessageScreen::composePressed()
{
    if (getState() == kIdle)
    {
        update(kComposeButtonPressed);
    }
}

void RecordMessageScreen::readPressed()
{
    if (getState() == kIdle)
    {
        update(kReadButtonPressed);
    }
}

#pragma mark Start / End / Invalid
void RecordMessageScreen::startEntry()
{
    mMessage        = [mPeer getMessage];

    mSound          = NULL;
    mBeginRecordingIndicator    = NULL;
    mEndRecordingIndicator      = NULL;
    mTenMinuteTimer = NULL;
    mDidRecord      = false;

    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    mSliderUpdateTimer = new tTimer(30);
    mSliderUpdateTimer->attach(this);

    mRecordTimer = new tTimer(1000);
    mRecordTimer->attach(this);

    mBeginRecordingIndicator    = new tSound(tFile(tFile::kBundleDirectory, "begin_record.caf"));
    mEndRecordingIndicator      = new tSound(tFile(tFile::kBundleDirectory, "end_record.caf"));

    mBeginRecordingIndicator->attach(this);
}

void RecordMessageScreen::endEntry()
{
    if (mEndRecordingIndicator)     { delete mEndRecordingIndicator; mEndRecordingIndicator = NULL; }
    if (mBeginRecordingIndicator)   { delete mBeginRecordingIndicator; mBeginRecordingIndicator = NULL; }
    if (mRecordTimer)               { delete mRecordTimer; mRecordTimer = NULL; }
    if (mSliderUpdateTimer)         { delete mSliderUpdateTimer; mSliderUpdateTimer = NULL; }
    if (mTenMinuteTimer)            { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }
    if (mSound)                     { delete mSound; mSound = NULL; }
}

void RecordMessageScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void RecordMessageScreen::idleEntry() { }
void RecordMessageScreen::idleListeningEntry() { }
void RecordMessageScreen::idleListeningExit()
{
    if (mTenMinuteTimer)    { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }
}
void RecordMessageScreen::idleSpeakingEntry() { }
void RecordMessageScreen::idleWaitForListeningTranscriptionEntry() { }

#pragma mark Queries

void RecordMessageScreen::doWeNeedToWaitForTranscriptionEntry()
{
    SetImmediateEvent(mGotTranscriptionEvent ? kNo : kYes);
}

void RecordMessageScreen::whatDoesTranscriptionSayEntry()
{
    static std::string readCandidates[] =
    {
        "read",
        "read mail",
        "read memo",
        "read message",
        "say",
        "say mail",
        "say memo",
        "say message",
        "speak",
        "speak mail",
        "speak memo",
        "speak message",
    };

    static std::string composeCandidates[] =
    {
        "compose",
        "compose mail",
        "compose memo",
        "compose message",
        "new",
        "new mail",
        "new memo",
        "new message",
        "reply",
        "reply mail",
        "reply memo",
        "reply message",
    };

    bool readMessage = false;
    bool composeMessage = false;

    std::transform(mTranscription.begin(), mTranscription.end(), mTranscription.begin(), ::tolower);

    for (size_t i = 0; i < sizeof(readCandidates) / sizeof(std::string); i++)
    {
        readMessage |= (mTranscription == readCandidates[i]);
    }

    for (size_t i = 0; i < sizeof(composeCandidates) / sizeof(std::string); i++)
    {
        composeMessage |= (mTranscription == composeCandidates[i]);
    }

    SetImmediateEvent(readMessage ? kReadButtonPressed : (composeMessage ? kComposeButtonPressed : kNoneOfTheAbove));
}

#pragma mark Actions

void RecordMessageScreen::playBeginListeningIndicatorEntry()
{
    if (mBeginRecordingIndicator)
    {
        mBeginRecordingIndicator->play();
    }
}

void RecordMessageScreen::playEndListeningIndicatorEntry()
{
    if (mEndRecordingIndicator)
    {
        mEndRecordingIndicator->play();
    }
}

void RecordMessageScreen::startListeningForCommandsEntry()
{
    if (mTenMinuteTimer)    { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }

    mTenMinuteTimer = new tTimer(10 * 60 * 1000, 1); // 10 minutes = 10 * 60 seconds = 10 * 60 * 1000 milliseconds
    mTenMinuteTimer->attach(this);
    mTenMinuteTimer->start();

    mRecrodSeconds = 0;
    mRecordTimer->start();

    mGotTranscriptionEvent = false;
    [gAppDelegateInstance startListening];
}

void RecordMessageScreen::stopListeningForCommandsEntry()
{
    mRecordTimer->stop();
    [gAppDelegateInstance stopRecorder];
}

void RecordMessageScreen::startSpeakingMessageEntry()
{
    [gAppDelegateInstance startSpeaking:mMessage];
}

#pragma mark UI

void RecordMessageScreen::showComposeMessageEntry()
{
    tAlert("Compose Message");
}

#pragma mark Sending messages to other machines

#pragma mark State wiring

void RecordMessageScreen::CallEntry()
{
	switch(mState)
	{
		case kDoWeNeedToWaitForTranscription: doWeNeedToWaitForTranscriptionEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kIdleListening: idleListeningEntry(); break;
		case kIdleSpeaking: idleSpeakingEntry(); break;
		case kIdleWaitForListeningTranscription: idleWaitForListeningTranscriptionEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPlayBeginListeningIndicator: playBeginListeningIndicatorEntry(); break;
		case kPlayEndListeningIndicator: playEndListeningIndicatorEntry(); break;
		case kShowComposeMessage: showComposeMessageEntry(); break;
		case kStart: startEntry(); break;
		case kStartListeningForCommands: startListeningForCommandsEntry(); break;
		case kStartSpeakingMessage: startSpeakingMessageEntry(); break;
		case kStopListeningForCommands: stopListeningForCommandsEntry(); break;
		case kWhatDoesTranscriptionSay: whatDoesTranscriptionSayEntry(); break;
		default: break;
	}
}

void RecordMessageScreen::CallExit()
{
	switch(mState)
	{
		case kIdleListening: idleListeningExit(); break;
		default: break;
	}
}

int  RecordMessageScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDoWeNeedToWaitForTranscription) && (evt == kNo)) return kWhatDoesTranscriptionSay; else
	if ((mState == kDoWeNeedToWaitForTranscription) && (evt == kYes)) return kIdleWaitForListeningTranscription; else
	if ((mState == kIdle) && (evt == kComposeButtonPressed)) return kShowComposeMessage; else
	if ((mState == kIdle) && (evt == kReadButtonPressed)) return kStartSpeakingMessage; else
	if ((mState == kIdle) && (evt == kRecordButtonPressed)) return kPlayBeginListeningIndicator; else
	if ((mState == kIdleListening) && (evt == kStopPressed)) return kStopListeningForCommands; else
	if ((mState == kIdleListening) && (evt == kTranscriptionReady)) return kStopListeningForCommands; else
	if ((mState == kIdleSpeaking) && (evt == kSpeakingDone)) return kIdle; else
	if ((mState == kIdleWaitForListeningTranscription) && (evt == kTranscriptionReady)) return kWhatDoesTranscriptionSay; else
	if ((mState == kPlayBeginListeningIndicator) && (evt == kIndicatorFinished)) return kStartListeningForCommands; else
	if ((mState == kPlayEndListeningIndicator) && (evt == kNext)) return kDoWeNeedToWaitForTranscription; else
	if ((mState == kShowComposeMessage) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kStartListeningForCommands) && (evt == kNext)) return kIdleListening; else
	if ((mState == kStartSpeakingMessage) && (evt == kNext)) return kIdleSpeaking; else
	if ((mState == kStopListeningForCommands) && (evt == kNext)) return kPlayEndListeningIndicator; else
	if ((mState == kWhatDoesTranscriptionSay) && (evt == kComposeButtonPressed)) return kShowComposeMessage; else
	if ((mState == kWhatDoesTranscriptionSay) && (evt == kNoneOfTheAbove)) return kIdle; else
	if ((mState == kWhatDoesTranscriptionSay) && (evt == kReadButtonPressed)) return kStartSpeakingMessage;

	return kInvalidState;
}

bool RecordMessageScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPlayEndListeningIndicator:
		case kStart:
		case kStartListeningForCommands:
		case kStartSpeakingMessage:
		case kStopListeningForCommands:
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
        case tSoundEvent::kSoundPlayingComplete:
            if (msg.mSource == mBeginRecordingIndicator)
            {
                if (getState() == kPlayBeginListeningIndicator)
                {
                    update(kIndicatorFinished);
                }
            }
            break;

        default:
            break;
    }
}

void RecordMessageScreen::update(const URLLoaderEvent& msg)
{
#pragma unused(msg)
//    if (msg.mId == this)
//    {
//        [mPeer setBlockingViewVisible:false];
//
//        switch (msg.mEvent)
//        {
//            case URLLoaderEvent::kLoadFail: update(kFail); break;
//            case URLLoaderEvent::kLoadedString:
//                switch (getState())
//                {
//                    case kSendPostAudioToServer:
//                        mPostAudioJSON = JSONUtil::extract(msg.mString);
//                        break;
//
//                    default:
//                        break;
//                }
//                update(kSuccess);
//                break;
//
//            case URLLoaderEvent::kLoadedFile: update(kSuccess); break;
//
//            default:
//                break;
//        }
//    }
}

void RecordMessageScreen::update(const GCTEvent& msg)
{
    switch(msg.mEvent)
    {
        case GCTEvent::kInboxTabPressed:
        case GCTEvent::kNewMemoTabPressed:
        case GCTEvent::kContactsTabPressed:
        case GCTEvent::kSettingsTabPressed:
            switch (getState())
            {
//                case kPlayingIdle:   update(kPausePressed); break;
                case kIdleListening: update(kStopPressed); break;

                default:
                    break;
            }
            break;

        case GCTEvent::kSpeakingFinished:
            if (getState() == kIdleSpeaking)
            {
                update(kSpeakingDone);
            }
            break;

        case GCTEvent::kTranscriptFinished:
            {
                mGotTranscriptionEvent = true;
                mTranscription = msg.mTranscription;

                [mPeer setTranscription:msg.mTranscription];

                if ((getState() == kIdleWaitForListeningTranscription) ||
                    (getState() == kIdleListening))
                {
                    update(kTranscriptionReady);
                }
            }
            break;

        default:
            switch (getState())
            {
                case kShowComposeMessage:
                    switch(msg.mEvent)
                    {
                        case GCTEvent::kOKYesAlertPressed:  update(kYes); break;
                        case GCTEvent::kNoAlertPressed:     update(kNo); break;

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
            if (msg.mTimer == mTenMinuteTimer)
            {
                if (mTenMinuteTimer) { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }

//                if (getState() == kRecordingIdle)
//                {
//                    update(kStopPressed);
//                    tAlert("Record limit is 10 minutes. Recording will now stop");
//                }
            }
            break;

        default:
            break;
    }
}

