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
    if (mSound)                     { delete mSound; mSound = NULL; }
}

void RecordMessageScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void RecordMessageScreen::idleEntry()
{
    [gAppDelegateInstance openEars];
}

void RecordMessageScreen::idleExit()
{
    [gAppDelegateInstance closeEars];
}

void RecordMessageScreen::idleListeningEntry() { }
void RecordMessageScreen::idleListeningExit() { }
void RecordMessageScreen::idleRecordingEntry() { }
void RecordMessageScreen::idleRecordingExit() { }

void RecordMessageScreen::idleWaitForListeningTranscriptionEntry() { }
void RecordMessageScreen::idleWaitForRecordingTranscriptionEntry() { }

#pragma mark Queries

void RecordMessageScreen::doWeNeedToWaitForTranscriptionEntry()
{
    SetImmediateEvent(mGotTranscriptionEvent ? kNo : kYes);
}

void RecordMessageScreen::doWeNeedToWaitForRecordingTranscriptionEntry()
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

void RecordMessageScreen::playBeginRecordingIndicatorEntry()
{
    if (mBeginRecordingIndicator)
    {
        mBeginRecordingIndicator->play();
    }
}

void RecordMessageScreen::playEndRecordingIndicatorEntry()
{
    if (mEndRecordingIndicator)
    {
        mEndRecordingIndicator->play();
    }
}

void RecordMessageScreen::startListeningForCommandsEntry()
{
    mRecordingCommand = true;

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

void RecordMessageScreen::startRecordingMessageEntry()
{
    mRecordingCommand = false;

    mRecrodSeconds = 0;
    mRecordTimer->start();

    mGotTranscriptionEvent = false;
    [gAppDelegateInstance startRecorder];
}

void RecordMessageScreen::stopRecordingMessageEntry()
{
    mRecordTimer->stop();
    [gAppDelegateInstance stopRecorder];
}

void RecordMessageScreen::startSpeakingMessageEntry()
{
    [gAppDelegateInstance startSpeaking:mMessage];
}

#pragma mark UI

void RecordMessageScreen::speakWhatCanIDoEntry()
{
    [gAppDelegateInstance startSpeaking:"Hey there. What can I do for you?"];
}

void RecordMessageScreen::speakOkayBeginRecordingANewMessageAfterTheToneEntry()
{
    [gAppDelegateInstance startSpeaking:"Okay, begin recording a new message after the tone."];
}

void RecordMessageScreen::speakOkayLetMeReadThatMessageForYouEntry()
{
    [gAppDelegateInstance startSpeaking:"Okay, let me read that message for you."];
}

#pragma mark Sending messages to other machines

#pragma mark State wiring

void RecordMessageScreen::CallEntry()
{
	switch(mState)
	{
		case kDoWeNeedToWaitForRecordingTranscription: doWeNeedToWaitForRecordingTranscriptionEntry(); break;
		case kDoWeNeedToWaitForTranscription: doWeNeedToWaitForTranscriptionEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kIdleListening: idleListeningEntry(); break;
		case kIdleRecording: idleRecordingEntry(); break;
		case kIdleWaitForListeningTranscription: idleWaitForListeningTranscriptionEntry(); break;
		case kIdleWaitForRecordingTranscription: idleWaitForRecordingTranscriptionEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPlayBeginListeningIndicator: playBeginListeningIndicatorEntry(); break;
		case kPlayBeginRecordingIndicator: playBeginRecordingIndicatorEntry(); break;
		case kPlayEndListeningIndicator: playEndListeningIndicatorEntry(); break;
		case kPlayEndRecordingIndicator: playEndRecordingIndicatorEntry(); break;
		case kSpeakOkayBeginRecordingANewMessageAfterTheTone: speakOkayBeginRecordingANewMessageAfterTheToneEntry(); break;
		case kSpeakOkayLetMeReadThatMessageForYou: speakOkayLetMeReadThatMessageForYouEntry(); break;
		case kSpeakWhatCanIDo: speakWhatCanIDoEntry(); break;
		case kStart: startEntry(); break;
		case kStartListeningForCommands: startListeningForCommandsEntry(); break;
		case kStartRecordingMessage: startRecordingMessageEntry(); break;
		case kStartSpeakingMessage: startSpeakingMessageEntry(); break;
		case kStopListeningForCommands: stopListeningForCommandsEntry(); break;
		case kStopRecordingMessage: stopRecordingMessageEntry(); break;
		case kWhatDoesTranscriptionSay: whatDoesTranscriptionSayEntry(); break;
		default: break;
	}
}

void RecordMessageScreen::CallExit()
{
	switch(mState)
	{
		case kIdle: idleExit(); break;
		case kIdleListening: idleListeningExit(); break;
		case kIdleRecording: idleRecordingExit(); break;
		default: break;
	}
}

int  RecordMessageScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDoWeNeedToWaitForRecordingTranscription) && (evt == kNo)) return kIdle; else
	if ((mState == kDoWeNeedToWaitForRecordingTranscription) && (evt == kYes)) return kIdleWaitForRecordingTranscription; else
	if ((mState == kDoWeNeedToWaitForTranscription) && (evt == kNo)) return kWhatDoesTranscriptionSay; else
	if ((mState == kDoWeNeedToWaitForTranscription) && (evt == kYes)) return kIdleWaitForListeningTranscription; else
	if ((mState == kIdle) && (evt == kComposeButtonPressed)) return kPlayBeginRecordingIndicator; else
	if ((mState == kIdle) && (evt == kReadButtonPressed)) return kStartSpeakingMessage; else
	if ((mState == kIdle) && (evt == kRecordButtonPressed)) return kPlayBeginListeningIndicator; else
	if ((mState == kIdle) && (evt == kVoiceCommandHeard)) return kSpeakWhatCanIDo; else
	if ((mState == kIdleListening) && (evt == kStopPressed)) return kStopListeningForCommands; else
	if ((mState == kIdleListening) && (evt == kTranscriptionReady)) return kStopListeningForCommands; else
	if ((mState == kIdleRecording) && (evt == kStopPressed)) return kStopRecordingMessage; else
	if ((mState == kIdleRecording) && (evt == kTranscriptionReady)) return kStopRecordingMessage; else
	if ((mState == kIdleWaitForListeningTranscription) && (evt == kTranscriptionReady)) return kWhatDoesTranscriptionSay; else
	if ((mState == kIdleWaitForRecordingTranscription) && (evt == kTranscriptionReady)) return kIdle; else
	if ((mState == kPlayBeginListeningIndicator) && (evt == kIndicatorFinished)) return kStartListeningForCommands; else
	if ((mState == kPlayBeginRecordingIndicator) && (evt == kIndicatorFinished)) return kStartRecordingMessage; else
	if ((mState == kPlayEndListeningIndicator) && (evt == kNext)) return kDoWeNeedToWaitForTranscription; else
	if ((mState == kPlayEndRecordingIndicator) && (evt == kNext)) return kDoWeNeedToWaitForRecordingTranscription; else
	if ((mState == kSpeakOkayBeginRecordingANewMessageAfterTheTone) && (evt == kSpeakingDone)) return kPlayBeginRecordingIndicator; else
	if ((mState == kSpeakOkayLetMeReadThatMessageForYou) && (evt == kSpeakingDone)) return kStartSpeakingMessage; else
	if ((mState == kSpeakWhatCanIDo) && (evt == kSpeakingDone)) return kPlayBeginListeningIndicator; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kStartListeningForCommands) && (evt == kNext)) return kIdleListening; else
	if ((mState == kStartRecordingMessage) && (evt == kNext)) return kIdleRecording; else
	if ((mState == kStartSpeakingMessage) && (evt == kSpeakingDone)) return kIdle; else
	if ((mState == kStopListeningForCommands) && (evt == kNext)) return kPlayEndListeningIndicator; else
	if ((mState == kStopRecordingMessage) && (evt == kNext)) return kPlayEndRecordingIndicator; else
	if ((mState == kWhatDoesTranscriptionSay) && (evt == kComposeButtonPressed)) return kSpeakOkayBeginRecordingANewMessageAfterTheTone; else
	if ((mState == kWhatDoesTranscriptionSay) && (evt == kNoneOfTheAbove)) return kIdle; else
	if ((mState == kWhatDoesTranscriptionSay) && (evt == kReadButtonPressed)) return kSpeakOkayLetMeReadThatMessageForYou;

	return kInvalidState;
}

bool RecordMessageScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPlayEndListeningIndicator:
		case kPlayEndRecordingIndicator:
		case kStart:
		case kStartListeningForCommands:
		case kStartRecordingMessage:
		case kStopListeningForCommands:
		case kStopRecordingMessage:
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
                if ((getState() == kPlayBeginListeningIndicator) ||
                    (getState() == kPlayBeginRecordingIndicator))
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

        case GCTEvent::kHeyGoCastWasSaid:
            if (getState() == kIdle)
            {
                update(kVoiceCommandHeard);
            }
            break;

        case GCTEvent::kSpeakingFinished:
            switch (getState())
            {
                case kStartSpeakingMessage:
                case kSpeakWhatCanIDo:
                case kSpeakOkayBeginRecordingANewMessageAfterTheTone:
                case kSpeakOkayLetMeReadThatMessageForYou:
                    update(kSpeakingDone);
                    break;

                default:
                    break;
            }
            break;

        case GCTEvent::kTranscriptFinished:
            mGotTranscriptionEvent = true;

            if (mRecordingCommand)
            {
                mTranscription = msg.mTranscription;

                [mPeer setTranscription:msg.mTranscription];
            }
            else
            {
                mMessage = msg.mTranscription;

                [mPeer setMessage:msg.mTranscription];
            }

            if ((getState() == kIdleWaitForListeningTranscription) ||
                (getState() == kIdleListening) ||
                (getState() == kIdleWaitForRecordingTranscription) ||
                (getState() == kIdleRecording))
            {
                update(kTranscriptionReady);
            }
            break;

        default:
            switch (getState())
            {
//                case kShowComposeMessage:
//                    switch(msg.mEvent)
//                    {
//                        case GCTEvent::kOKYesAlertPressed:  update(kYes); break;
//                        case GCTEvent::kNoAlertPressed:     update(kNo); break;
//
//                        default:
//                            break;
//                    }
//                    break;
//
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
        default:
            break;
    }
}

