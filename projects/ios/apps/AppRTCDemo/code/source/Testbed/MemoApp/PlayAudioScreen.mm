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

#pragma mark User Interface
void PlayAudioScreen::setWaitForDeleteEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void PlayAudioScreen::showRetryDeleteEntry()
{
    tConfirm("Couldn't contact server, retry delete from inbox?");
}

void PlayAudioScreen::showDeleteFailedEntry()
{
    tAlert("Could not delete file from server inbox");
}

void PlayAudioScreen::setStatusHasAudioEntry()
{
    [gAppDelegateInstance setPlayAudioButtonEnabled:true];
    [gAppDelegateInstance setStopAudioButtonEnabled:false];
    [gAppDelegateInstance setDeleteAudioButtonEnabled:true];
    [gAppDelegateInstance setSendAudioButtonEnabled:true];
}

void PlayAudioScreen::setStatusNoAudioEntry()
{
    [gAppDelegateInstance setPlayAudioButtonEnabled:false];
    [gAppDelegateInstance setStopAudioButtonEnabled:false];
    [gAppDelegateInstance setDeleteAudioButtonEnabled:false];
    [gAppDelegateInstance setSendAudioButtonEnabled:false];
}

void PlayAudioScreen::setStatusPlayingEntry()
{
    [gAppDelegateInstance setPlayAudioButtonEnabled:false];
    [gAppDelegateInstance setStopAudioButtonEnabled:true];
    [gAppDelegateInstance setDeleteAudioButtonEnabled:false];
    [gAppDelegateInstance setSendAudioButtonEnabled:false];
}

#pragma mark Queries
void PlayAudioScreen::doesFileExistOnServerEntry()
{
    SetImmediateEvent(mExistsOnServer ? kYes : kNo);
}

void PlayAudioScreen::doesScratchExistEntry()
{
    tFile scratch(tFile::kDocumentsDirectory, mFilename);

    SetImmediateEvent(scratch.exists() ? kYes : kNo);
}

void PlayAudioScreen::wasDeleteSuccessfulEntry()
{
    bool result = false;

    if (JSONUtil::extract(mDeleteFileJSON)["status"] == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions

void PlayAudioScreen::deleteScratchFileEntry()
{
    tFile scratch(tFile::kDocumentsDirectory, mFilename);

    if (scratch.exists())
    {
        scratch.remove();
    }

    SetImmediateEvent(scratch.exists() ? kFail : kSuccess);
}

void PlayAudioScreen::playScratchFileEntry()
{
    if (mSound) { delete mSound; mSound = NULL; }

    mSound = new tSound(tFile(tFile::kDocumentsDirectory, mFilename));
    mSound->attach(this);
    mSound->play();
}

void PlayAudioScreen::stopScratchFileEntry()
{
    if (mSound)
    {
        mSound->stop();
    }
}

void PlayAudioScreen::showConfirmDeleteEntry()
{
    tConfirm("Delete this recording?");
}

void PlayAudioScreen::showCouldntDeleteEntry()
{
    tAlert("Couldn't delete audio file.");
}

void PlayAudioScreen::sendDeleteRequestToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=deleteFile&name=%s&file=%s",
            kMemoAppServerURL,
            std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt")).c_str(),
            mFilename.c_str());

    URLLoader::getInstance()->loadString(buf);
}

#pragma mark Sending messages to other machines

void PlayAudioScreen::sendGoInboxToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoInbox));
}

void PlayAudioScreen::sendGoSendGroupToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoSendGroup, mFilename));
}

#pragma mark State wiring
void PlayAudioScreen::CallEntry()
{
	switch(mState)
	{
		case kDeleteScratchFile: deleteScratchFileEntry(); break;
		case kDoesFileExistOnServer: doesFileExistOnServerEntry(); break;
		case kDoesScratchExist: doesScratchExistEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPlayScratchFile: playScratchFileEntry(); break;
		case kPlayingIdle: playingIdleEntry(); break;
		case kSendDeleteRequestToServer: sendDeleteRequestToServerEntry(); break;
		case kSendGoInboxToVC: sendGoInboxToVCEntry(); break;
		case kSendGoSendGroupToVC: sendGoSendGroupToVCEntry(); break;
		case kSetStatusHasAudio: setStatusHasAudioEntry(); break;
		case kSetStatusNoAudio: setStatusNoAudioEntry(); break;
		case kSetStatusPlaying: setStatusPlayingEntry(); break;
		case kSetWaitForDelete: setWaitForDeleteEntry(); break;
		case kShowConfirmDelete: showConfirmDeleteEntry(); break;
		case kShowCouldntDelete: showCouldntDeleteEntry(); break;
		case kShowDeleteFailed: showDeleteFailedEntry(); break;
		case kShowRetryDelete: showRetryDeleteEntry(); break;
		case kStart: startEntry(); break;
		case kStopScratchFile: stopScratchFileEntry(); break;
		case kWasDeleteSuccessful: wasDeleteSuccessfulEntry(); break;
		default: break;
	}
}

void PlayAudioScreen::CallExit()
{
}

int  PlayAudioScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDeleteScratchFile) && (evt == kFail)) return kShowCouldntDelete; else
	if ((mState == kDeleteScratchFile) && (evt == kSuccess)) return kDoesFileExistOnServer; else
	if ((mState == kDoesFileExistOnServer) && (evt == kNo)) return kSendGoInboxToVC; else
	if ((mState == kDoesFileExistOnServer) && (evt == kYes)) return kSetWaitForDelete; else
	if ((mState == kDoesScratchExist) && (evt == kNo)) return kSetStatusNoAudio; else
	if ((mState == kDoesScratchExist) && (evt == kYes)) return kSetStatusHasAudio; else
	if ((mState == kIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kIdle) && (evt == kDelete)) return kShowConfirmDelete; else
	if ((mState == kIdle) && (evt == kPlay)) return kPlayScratchFile; else
	if ((mState == kIdle) && (evt == kSend)) return kSendGoSendGroupToVC; else
	if ((mState == kPlayScratchFile) && (evt == kNext)) return kSetStatusPlaying; else
	if ((mState == kPlayingIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kPlayingIdle) && (evt == kFinishedPlaying)) return kStopScratchFile; else
	if ((mState == kPlayingIdle) && (evt == kStop)) return kStopScratchFile; else
	if ((mState == kSendDeleteRequestToServer) && (evt == kFail)) return kShowRetryDelete; else
	if ((mState == kSendDeleteRequestToServer) && (evt == kSuccess)) return kWasDeleteSuccessful; else
	if ((mState == kSetStatusHasAudio) && (evt == kNext)) return kIdle; else
	if ((mState == kSetStatusNoAudio) && (evt == kNext)) return kIdle; else
	if ((mState == kSetStatusPlaying) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kSetWaitForDelete) && (evt == kNext)) return kSendDeleteRequestToServer; else
	if ((mState == kShowConfirmDelete) && (evt == kNo)) return kDoesScratchExist; else
	if ((mState == kShowConfirmDelete) && (evt == kYes)) return kDeleteScratchFile; else
	if ((mState == kShowCouldntDelete) && (evt == kYes)) return kDoesScratchExist; else
	if ((mState == kShowDeleteFailed) && (evt == kYes)) return kSendGoInboxToVC; else
	if ((mState == kShowRetryDelete) && (evt == kNo)) return kSendGoInboxToVC; else
	if ((mState == kShowRetryDelete) && (evt == kYes)) return kSendDeleteRequestToServer; else
	if ((mState == kStart) && (evt == kNext)) return kDoesScratchExist; else
	if ((mState == kStopScratchFile) && (evt == kNext)) return kDoesScratchExist; else
	if ((mState == kWasDeleteSuccessful) && (evt == kNo)) return kShowDeleteFailed; else
	if ((mState == kWasDeleteSuccessful) && (evt == kYes)) return kSendGoInboxToVC;

	return kInvalidState;
}

bool PlayAudioScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPlayScratchFile:
		case kSetStatusHasAudio:
		case kSetStatusNoAudio:
		case kSetStatusPlaying:
		case kSetWaitForDelete:
		case kStart:
		case kStopScratchFile:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages

void PlayAudioScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kPlayAudioPressed:      process(kPlay); break;
        case MemoEvent::kStopAudioPressed:      process(kStop); break;
        case MemoEvent::kDeleteAudioPressed:    process(kDelete); break;
        case MemoEvent::kSendAudioPressed:      process(kSend); break;
        case MemoEvent::kCancelAudioPressed:    process(kCancel); break;

        case MemoEvent::kOKYesAlertPressed:     process(kYes); break;
        case MemoEvent::kNoAlertPressed:        process(kNo); break;

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
                case kSendDeleteRequestToServer:
                    mDeleteFileJSON = msg.mString;
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

