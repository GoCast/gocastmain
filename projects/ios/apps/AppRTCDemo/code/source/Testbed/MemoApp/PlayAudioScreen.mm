#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
PlayAudioScreen::PlayAudioScreen(const std::string& newFile, bool newExistsOnServer)
:   mFilename(newFile),
    mExistsOnServer(newExistsOnServer)
{
	ConstructMachine();
}

PlayAudioScreen::~PlayAudioScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void PlayAudioScreen::startEntry()
{
    mSound = NULL;

    URLLoader::getInstance()->attach(this);
    MemoEventManager::getInstance()->attach(this);
    [gAppDelegateInstance setPlayAudioScreenVisible:true];
    [gAppDelegateInstance setNavigationBarTitle:"Playback Audio"];


    std::string from;

    std::string str = mFilename;

    if (str.find('-', 0) != std::string::npos)
    {
        from = str.substr(str.find('-', 0) + 1);
    }
    else
    {
        from = "Me";
    }

    //TODO: end hack
    [gAppDelegateInstance setPlayAudioFromLabel:from];
}

void PlayAudioScreen::endEntry()
{
    [gAppDelegateInstance setPlayAudioScreenVisible:false];

    if (mSound) { delete mSound; mSound = NULL; }
}

void PlayAudioScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling

void PlayAudioScreen::idleEntry()
{
}

void PlayAudioScreen::playingIdleEntry()
{
}

void PlayAudioScreen::pausedIdleEntry()
{
}

#pragma mark User Interface

void PlayAudioScreen::setWaitForGetTranscriptionEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void PlayAudioScreen::updateDurationLabelEntry()
{
    tUInt32 durationMS = mSound->getDurationMS();
    size_t sec = (durationMS / 1000) % 60;
    size_t min = ((durationMS / 1000) - sec) / 60;
    char buf[10];
    sprintf(buf, "%02d:%02d", (int)min, (int)sec);
    [gAppDelegateInstance setPlayAudioDurationLabel:buf];
}

void PlayAudioScreen::setStatusPausedEntry()
{
    [gAppDelegateInstance setPlayAudioButtonImage:false];
}

void PlayAudioScreen::setStatusPlayingEntry()
{
    [gAppDelegateInstance setPlayAudioButtonImage:true];
}

void PlayAudioScreen::setStatusResumingEntry()
{
    [gAppDelegateInstance setPlayAudioButtonImage:true];
}

void PlayAudioScreen::setStatusStoppedEntry()
{
    [gAppDelegateInstance setPlayAudioButtonImage:false];
}

void PlayAudioScreen::setStatusInitialEntry()
{
    [gAppDelegateInstance setTranscriptionText:"Transcription not available."];
    [gAppDelegateInstance setPlayAudioButtonImage:false];
}

void PlayAudioScreen::updateTranscriptionEntry()
{
    std::string result = "";
    if (mGetTranscriptJSON["ja2"].mType == JSONValue::kString)
    {
        result += "Nuance: ";
        result += mGetTranscriptJSON["ja2"].mString;
    }
    [gAppDelegateInstance setTranscriptionText:result];
}

#pragma mark Queries
void PlayAudioScreen::wasGetTranscriptionSuccessfulEntry()
{
    bool result = false;

    if (mGetTranscriptJSON["ja"].mType == JSONValue::kString ||
        mGetTranscriptJSON["ja2"].mType == JSONValue::kString)
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions

void PlayAudioScreen::pauseSoundEntry()
{
    if (mSound)
    {
        mSound->pause();
    }
}

void PlayAudioScreen::loadSoundEntry()
{
    if (mSound) { delete mSound; mSound = NULL; }

    mSound = new tSound(tFile(tFile::kDocumentsDirectory, mFilename));
    mSound->attach(this);
}

void PlayAudioScreen::playSoundEntry()
{
    mSound->play();
}

void PlayAudioScreen::resumeSoundEntry()
{
    if (mSound)
    {
        mSound->resume();
    }
}

void PlayAudioScreen::stopSoundEntry()
{
    if (mSound)
    {
        mSound->stop();
    }
}

void PlayAudioScreen::sendGetTranscriptionToServerEntry()
{
    char buf[512];

    sprintf(buf, "%sdatabase/transcriptions/%s",
            kMemoAppServerRealURL,
            (mFilename + ".json").c_str());

    URLLoader::getInstance()->loadString(buf);
}

#pragma mark Sending messages to other machines

void PlayAudioScreen::sendGoSendGroupToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoSendGroup, mFilename));
}

#pragma mark State wiring
void PlayAudioScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kLoadSound: loadSoundEntry(); break;
		case kPauseSound: pauseSoundEntry(); break;
		case kPausedIdle: pausedIdleEntry(); break;
		case kPlaySound: playSoundEntry(); break;
		case kPlayingIdle: playingIdleEntry(); break;
		case kResumeSound: resumeSoundEntry(); break;
		case kSendGetTranscriptionToServer: sendGetTranscriptionToServerEntry(); break;
		case kSendGoSendGroupToVC: sendGoSendGroupToVCEntry(); break;
		case kSetStatusInitial: setStatusInitialEntry(); break;
		case kSetStatusPaused: setStatusPausedEntry(); break;
		case kSetStatusPlaying: setStatusPlayingEntry(); break;
		case kSetStatusResuming: setStatusResumingEntry(); break;
		case kSetStatusStopped: setStatusStoppedEntry(); break;
		case kSetWaitForGetTranscription: setWaitForGetTranscriptionEntry(); break;
		case kStart: startEntry(); break;
		case kStopSound: stopSoundEntry(); break;
		case kUpdateDurationLabel: updateDurationLabelEntry(); break;
		case kUpdateTranscription: updateTranscriptionEntry(); break;
		case kWasGetTranscriptionSuccessful: wasGetTranscriptionSuccessfulEntry(); break;
		default: break;
	}
}

void PlayAudioScreen::CallExit()
{
}

int  PlayAudioScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kPlay)) return kSetStatusPlaying; else
	if ((mState == kIdle) && (evt == kSend)) return kSendGoSendGroupToVC; else
	if ((mState == kLoadSound) && (evt == kNext)) return kUpdateDurationLabel; else
	if ((mState == kPauseSound) && (evt == kNext)) return kSetStatusPaused; else
	if ((mState == kPausedIdle) && (evt == kPlay)) return kSetStatusResuming; else
	if ((mState == kPausedIdle) && (evt == kSend)) return kSendGoSendGroupToVC; else
	if ((mState == kPlaySound) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kPlayingIdle) && (evt == kFinishedPlaying)) return kStopSound; else
	if ((mState == kPlayingIdle) && (evt == kPlay)) return kPauseSound; else
	if ((mState == kPlayingIdle) && (evt == kSend)) return kSendGoSendGroupToVC; else
	if ((mState == kResumeSound) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kSendGetTranscriptionToServer) && (evt == kFail)) return kIdle; else
	if ((mState == kSendGetTranscriptionToServer) && (evt == kSuccess)) return kWasGetTranscriptionSuccessful; else
	if ((mState == kSetStatusInitial) && (evt == kNext)) return kSetWaitForGetTranscription; else
	if ((mState == kSetStatusPaused) && (evt == kNext)) return kPausedIdle; else
	if ((mState == kSetStatusPlaying) && (evt == kNext)) return kPlaySound; else
	if ((mState == kSetStatusResuming) && (evt == kNext)) return kResumeSound; else
	if ((mState == kSetStatusStopped) && (evt == kNext)) return kIdle; else
	if ((mState == kSetWaitForGetTranscription) && (evt == kNext)) return kSendGetTranscriptionToServer; else
	if ((mState == kStart) && (evt == kNext)) return kLoadSound; else
	if ((mState == kStopSound) && (evt == kNext)) return kSetStatusStopped; else
	if ((mState == kUpdateDurationLabel) && (evt == kNext)) return kSetStatusInitial; else
	if ((mState == kUpdateTranscription) && (evt == kNext)) return kIdle; else
	if ((mState == kWasGetTranscriptionSuccessful) && (evt == kNo)) return kIdle; else
	if ((mState == kWasGetTranscriptionSuccessful) && (evt == kYes)) return kUpdateTranscription;

	return kInvalidState;
}

bool PlayAudioScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kEnd:
		case kIdle:
		case kInvalidState:
		case kPausedIdle:
		case kPlayingIdle:
		case kSendGetTranscriptionToServer:
		case kSendGoSendGroupToVC:
		case kWasGetTranscriptionSuccessful:
			return false;
		default: break;
	}
	return true;
}

#pragma mark Messages

void PlayAudioScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kPlayAudioPressed:      process(kPlay); break;
        case MemoEvent::kSendAudioPressed:      process(kSend); break;

        default:
            break;
    }
}

void PlayAudioScreen::update(const tSoundEvent& msg)
{
    switch (msg.mEvent)
    {
        case tSoundEvent::kSoundPlayingComplete:    process(kFinishedPlaying); break;

        default:
            break;
    }
}

void PlayAudioScreen::update(const PlayAudioScreenMessage& msg)
{
	process(msg.mEvent);
}

void PlayAudioScreen::update(const URLLoaderEvent& msg)
{
    [gAppDelegateInstance setBlockingViewVisible:false];

    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendGetTranscriptionToServer:
                    mGetTranscriptJSON = JSONUtil::extract(msg.mString);
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

