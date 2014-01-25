#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "InboxMessageVC.h"

#pragma mark Constructor / Destructor
InboxMessageScreen::InboxMessageScreen(InboxMessageVC* newVC, const JSONObject& initObject)
:   mPeer(newVC),
    mInitObject(initObject)
{
	ConstructMachine();
}

InboxMessageScreen::~InboxMessageScreen()
{
	DestructMachine();
}

#pragma mark Public methods
void InboxMessageScreen::playPressed()
{
    update(kPlayPressed);
}

void InboxMessageScreen::pastPressed()
{
    update(kPastSelected);
}

void InboxMessageScreen::replyPressed()
{
    update(kReplySelected);
}

void InboxMessageScreen::deletePressed()
{
    update(kDeleteSelected);
}

#pragma mark Start / End / Invalid
void InboxMessageScreen::startEntry()
{
    mWasPlaying = false;
    mSound = NULL;

    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);
}

void InboxMessageScreen::endEntry()
{
    if (mSound) { delete mSound; mSound = NULL; }
}

void InboxMessageScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void InboxMessageScreen::idleEntry()
{
}

void InboxMessageScreen::pausedIdleEntry()
{
}

void InboxMessageScreen::playingIdleEntry()
{
}

#pragma mark Peer Communication

void InboxMessageScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

void InboxMessageScreen::peerPushRecordMessageEntry()
{
    [mPeer pushRecordMessage:mInitObject];
}

void InboxMessageScreen::peerPushMessageHistoryEntry()
{
    [mPeer pushMessageHistory:mInitObject];
}

#pragma mark Queries
void InboxMessageScreen::doesAudioExistLocallyEntry()
{
    SetImmediateEvent(tFile(tFile::kDocumentsDirectory, mInitObject["audio"].mString).exists() ? kYes : kNo);
}

void InboxMessageScreen::wasDeleteMessageValidEntry()
{
    bool result = false;

    if (mDeleteMessageJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}


void InboxMessageScreen::wereWeGoingToPlayEntry()
{
    SetImmediateEvent(mWasPlaying ? kYes : kNo);
}

#pragma mark Actions
void InboxMessageScreen::sendDeleteMessageToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=deleteMessage&name=%s&audio=%s",
            kMemoAppServerURL,
            "tjgrant@tatewake.com",
            mInitObject["audio"].mString.c_str());

    URLLoader::getInstance()->loadString(2, buf);
}


void InboxMessageScreen::sendDownloadRequestToServerEntry()
{
    char buf[512];

    sprintf(buf, "%sdatabase/global/audio/%s",
            kMemoAppServerURL,
            mInitObject["audio"].mString.c_str());

    URLLoader::getInstance()->loadFile(2, buf, tFile(tFile::kTemporaryDirectory, mInitObject["audio"].mString.c_str()));
}

void InboxMessageScreen::setWasPlayingToFalseEntry()
{
    mWasPlaying = false;
}

void InboxMessageScreen::setWasPlayingToTrueEntry()
{
    mWasPlaying = true;
}

void InboxMessageScreen::pauseSoundEntry()
{
    [mPeer setButtonImagePlay];

    if (mSound)
    {
        mSound->pause();
    }
}

void InboxMessageScreen::resumeSoundEntry()
{
    [mPeer setButtonImagePause];

    if (mSound)
    {
        mSound->resume();
    }
}

void InboxMessageScreen::playSoundEntry()
{
    [mPeer setButtonImagePause];

    if (!mSound)
    {
        mSound = new tSound(tFile(tFile::kDocumentsDirectory, mInitObject["audio"].mString));
        mSound->attach(this);
    }

    mSound->play();
}

void InboxMessageScreen::stopSoundEntry()
{
    [mPeer setButtonImagePlay];

    if (mSound)
    {
        mSound->stop();
    }
}

void InboxMessageScreen::copyDownloadToLocalFilesEntry()
{
    tFile(tFile::kTemporaryDirectory, mInitObject["audio"].mString).rename(tFile::kDocumentsDirectory, mInitObject["audio"].mString);
}

#pragma mark User Interface
void InboxMessageScreen::updateTimeLabelEntry()
{
    if (!mSound)
    {
        mSound = new tSound(tFile(tFile::kDocumentsDirectory, mInitObject["audio"].mString));
        mSound->attach(this);
    }

    tUInt32 durationMS = mSound->getDurationMS();

    size_t sec = (durationMS / 1000) % 60;
    size_t min = ((durationMS / 1000) - sec) / 60;

    char buf[10];
    sprintf(buf, "%02d:%02d", (int)min, (int)sec);

    [mPeer setTimeLabel:buf];
}

void InboxMessageScreen::setWaitForDeleteMessageEntry()
{
    //TODO
}

void InboxMessageScreen::setWaitForDownloadEntry()
{
    //TODO
}

void InboxMessageScreen::showErrorDeletingMessageEntry()
{
    tAlert("There was an error deleting a message from the server");
}

void InboxMessageScreen::showRetryDownloadEntry()
{
    tConfirm("Couldn't contact server, retry download?");
}

#pragma mark Sending messages to other machines
void InboxMessageScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void InboxMessageScreen::CallEntry()
{
	switch(mState)
	{
		case kCopyDownloadToLocalFiles: copyDownloadToLocalFilesEntry(); break;
		case kDoesAudioExistLocally: doesAudioExistLocallyEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPauseSound: pauseSoundEntry(); break;
		case kPausedIdle: pausedIdleEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kPeerPushMessageHistory: peerPushMessageHistoryEntry(); break;
		case kPeerPushRecordMessage: peerPushRecordMessageEntry(); break;
		case kPlaySound: playSoundEntry(); break;
		case kPlayingIdle: playingIdleEntry(); break;
		case kResumeSound: resumeSoundEntry(); break;
		case kSendDeleteMessageToServer: sendDeleteMessageToServerEntry(); break;
		case kSendDownloadRequestToServer: sendDownloadRequestToServerEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSetWaitForDeleteMessage: setWaitForDeleteMessageEntry(); break;
		case kSetWaitForDownload: setWaitForDownloadEntry(); break;
		case kSetWasPlayingToFalse: setWasPlayingToFalseEntry(); break;
		case kSetWasPlayingToTrue: setWasPlayingToTrueEntry(); break;
		case kShowErrorDeletingMessage: showErrorDeletingMessageEntry(); break;
		case kShowRetryDownload: showRetryDownloadEntry(); break;
		case kStart: startEntry(); break;
		case kStopSound: stopSoundEntry(); break;
		case kUpdateTimeLabel: updateTimeLabelEntry(); break;
		case kWasDeleteMessageValid: wasDeleteMessageValidEntry(); break;
		case kWereWeGoingToPlay: wereWeGoingToPlayEntry(); break;
		default: break;
	}
}

void InboxMessageScreen::CallExit()
{
}

int  InboxMessageScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kCopyDownloadToLocalFiles) && (evt == kNext)) return kUpdateTimeLabel; else
	if ((mState == kDoesAudioExistLocally) && (evt == kNo)) return kSetWaitForDownload; else
	if ((mState == kDoesAudioExistLocally) && (evt == kYes)) return kUpdateTimeLabel; else
	if ((mState == kIdle) && (evt == kDeleteSelected)) return kSetWaitForDeleteMessage; else
	if ((mState == kIdle) && (evt == kPastSelected)) return kPeerPushMessageHistory; else
	if ((mState == kIdle) && (evt == kPlayPressed)) return kSetWasPlayingToTrue; else
	if ((mState == kIdle) && (evt == kReplySelected)) return kPeerPushRecordMessage; else
	if ((mState == kPauseSound) && (evt == kNext)) return kPausedIdle; else
	if ((mState == kPausedIdle) && (evt == kPlayPressed)) return kResumeSound; else
	if ((mState == kPeerPushMessageHistory) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerPushRecordMessage) && (evt == kNext)) return kIdle; else
	if ((mState == kPlaySound) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kPlayingIdle) && (evt == kFinishedPlaying)) return kStopSound; else
	if ((mState == kPlayingIdle) && (evt == kPlayPressed)) return kPauseSound; else
	if ((mState == kResumeSound) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kSendDeleteMessageToServer) && (evt == kFail)) return kShowErrorDeletingMessage; else
	if ((mState == kSendDeleteMessageToServer) && (evt == kSuccess)) return kWasDeleteMessageValid; else
	if ((mState == kSendDownloadRequestToServer) && (evt == kFail)) return kShowRetryDownload; else
	if ((mState == kSendDownloadRequestToServer) && (evt == kSuccess)) return kCopyDownloadToLocalFiles; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSetWaitForDeleteMessage) && (evt == kNext)) return kSendDeleteMessageToServer; else
	if ((mState == kSetWaitForDownload) && (evt == kNext)) return kSendDownloadRequestToServer; else
	if ((mState == kSetWasPlayingToFalse) && (evt == kNext)) return kDoesAudioExistLocally; else
	if ((mState == kSetWasPlayingToTrue) && (evt == kNext)) return kDoesAudioExistLocally; else
	if ((mState == kShowErrorDeletingMessage) && (evt == kYes)) return kIdle; else
	if ((mState == kShowRetryDownload) && (evt == kNo)) return kIdle; else
	if ((mState == kShowRetryDownload) && (evt == kYes)) return kSetWaitForDownload; else
	if ((mState == kStart) && (evt == kNext)) return kSetWasPlayingToFalse; else
	if ((mState == kStopSound) && (evt == kNext)) return kSetWasPlayingToFalse; else
	if ((mState == kUpdateTimeLabel) && (evt == kNext)) return kWereWeGoingToPlay; else
	if ((mState == kWasDeleteMessageValid) && (evt == kNo)) return kShowErrorDeletingMessage; else
	if ((mState == kWasDeleteMessageValid) && (evt == kYes)) return kSendReloadInboxToVC; else
	if ((mState == kWereWeGoingToPlay) && (evt == kNo)) return kIdle; else
	if ((mState == kWereWeGoingToPlay) && (evt == kYes)) return kPlaySound;

	return kInvalidState;
}

bool InboxMessageScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kDoesAudioExistLocally:
		case kEnd:
		case kIdle:
		case kInvalidState:
		case kPausedIdle:
		case kPeerPopSelf:
		case kPlayingIdle:
		case kSendDeleteMessageToServer:
		case kSendDownloadRequestToServer:
		case kShowErrorDeletingMessage:
		case kShowRetryDownload:
		case kWasDeleteMessageValid:
		case kWereWeGoingToPlay:
			return false;
		default: break;
	}
	return true;
}

#pragma mark Messages
void InboxMessageScreen::update(const InboxMessageScreenMessage& msg)
{
	process(msg.mEvent);
}

void InboxMessageScreen::update(const tSoundEvent& msg)
{
    switch (msg.mEvent)
    {
        case tSoundEvent::kSoundPlayingComplete:    process(kFinishedPlaying); break;

        default:
            break;
    }
}

void InboxMessageScreen::update(const URLLoaderEvent& msg)
{
    if (msg.mId == 2)
    {
        [gAppDelegateInstance setBlockingViewVisible:false];

        switch (msg.mEvent)
        {
            case URLLoaderEvent::kLoadFail: process(kFail); break;
            case URLLoaderEvent::kLoadedString:
            {
                switch (getState())
                {
                    case kSendDeleteMessageToServer:
                        mDeleteMessageJSON = JSONUtil::extract(msg.mString);
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

void InboxMessageScreen::update(const GCTEvent& msg)
{
    switch (getState())
    {
        case kShowErrorDeletingMessage:
        case kShowRetryDownload:
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
}

