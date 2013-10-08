#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

bool PlayAudioScreen::mFirstTime = true;

#pragma mark Constructor / Destructor
PlayAudioScreen::PlayAudioScreen()
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
    mScratchSound = NULL;

    MemoEventManager::getInstance()->attach(this);
    [gAppDelegateInstance setPlayAudioScreenVisible:true];
}

void PlayAudioScreen::endEntry()
{
    [gAppDelegateInstance setPlayAudioScreenVisible:false];

    if (mScratchSound) { delete mScratchSound; mScratchSound = NULL; }
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

#pragma mark Setting status
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
void PlayAudioScreen::doesScratchExistEntry()
{
    tFile scratch(tFile::kDocumentsDirectory, "scratch.m4a");

    SetImmediateEvent(scratch.exists() ? kYes : kNo);
}

void PlayAudioScreen::firstTimeOnScreenEntry()
{
    SetImmediateEvent(mFirstTime ? kYes : kNo);

    mFirstTime = false;
}

#pragma mark Actions

void PlayAudioScreen::copyExampleToScratchEntry()
{
    tFile example("example.m4a");
    tFile destination(tFile::kDocumentsDirectory, "scratch.m4a");

    if (destination.exists())
    {
        destination.remove();
    }

    if (!destination.exists())
    {
        destination.write((std::vector<tUInt8>)example);
        SetImmediateEvent(destination.exists() ? kSuccess : kFail);
    }
    else
    {
        SetImmediateEvent(kFail);
    }
}

void PlayAudioScreen::deleteScratchFileEntry()
{
    tFile scratch(tFile::kDocumentsDirectory, "scratch.m4a");

    if (scratch.exists())
    {
        scratch.remove();
    }

    SetImmediateEvent(scratch.exists() ? kFail : kSuccess);
}

void PlayAudioScreen::playScratchFileEntry()
{
    if (mScratchSound) { delete mScratchSound; mScratchSound = NULL; }

    mScratchSound = new tSound(tFile(tFile::kDocumentsDirectory, "scratch.m4a"));
    mScratchSound->attach(this);
    mScratchSound->play();
}

void PlayAudioScreen::stopScratchFileEntry()
{
    if (mScratchSound)
    {
        mScratchSound->stop();
    }
}

void PlayAudioScreen::showConfirmDeleteEntry()
{
    tConfirm("Delete this recording?");
}

void PlayAudioScreen::showCouldntCopyEntry()
{
    tAlert("Couldn't copy example to scratch.");
}

void PlayAudioScreen::showCouldntDeleteEntry()
{
    tAlert("Couldn't delete audio file.");
}

#pragma mark Sending messages to other machines

void PlayAudioScreen::sendGoInboxToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoInbox));
}

void PlayAudioScreen::sendGoSendGroupToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoSendGroup));
}

#pragma mark State wiring
void PlayAudioScreen::CallEntry()
{
	switch(mState)
	{
		case kCopyExampleToScratch: copyExampleToScratchEntry(); break;
		case kDeleteScratchFile: deleteScratchFileEntry(); break;
		case kDoesScratchExist: doesScratchExistEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kFirstTimeOnScreen: firstTimeOnScreenEntry(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPlayScratchFile: playScratchFileEntry(); break;
		case kPlayingIdle: playingIdleEntry(); break;
		case kSendGoInboxToVC: sendGoInboxToVCEntry(); break;
		case kSendGoSendGroupToVC: sendGoSendGroupToVCEntry(); break;
		case kSetStatusHasAudio: setStatusHasAudioEntry(); break;
		case kSetStatusNoAudio: setStatusNoAudioEntry(); break;
		case kSetStatusPlaying: setStatusPlayingEntry(); break;
		case kShowConfirmDelete: showConfirmDeleteEntry(); break;
		case kShowCouldntCopy: showCouldntCopyEntry(); break;
		case kShowCouldntDelete: showCouldntDeleteEntry(); break;
		case kStart: startEntry(); break;
		case kStopScratchFile: stopScratchFileEntry(); break;
		default: break;
	}
}

void PlayAudioScreen::CallExit()
{
}

int  PlayAudioScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kCopyExampleToScratch) && (evt == kFail)) return kShowCouldntCopy; else
	if ((mState == kCopyExampleToScratch) && (evt == kSuccess)) return kDoesScratchExist; else
	if ((mState == kDeleteScratchFile) && (evt == kFail)) return kShowCouldntDelete; else
	if ((mState == kDeleteScratchFile) && (evt == kSuccess)) return kDoesScratchExist; else
	if ((mState == kDoesScratchExist) && (evt == kNo)) return kSetStatusNoAudio; else
	if ((mState == kDoesScratchExist) && (evt == kYes)) return kSetStatusHasAudio; else
	if ((mState == kFirstTimeOnScreen) && (evt == kNo)) return kDoesScratchExist; else
	if ((mState == kFirstTimeOnScreen) && (evt == kYes)) return kCopyExampleToScratch; else
	if ((mState == kIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kIdle) && (evt == kDelete)) return kShowConfirmDelete; else
	if ((mState == kIdle) && (evt == kPlay)) return kPlayScratchFile; else
	if ((mState == kIdle) && (evt == kSend)) return kSendGoSendGroupToVC; else
	if ((mState == kPlayScratchFile) && (evt == kNext)) return kSetStatusPlaying; else
	if ((mState == kPlayingIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kPlayingIdle) && (evt == kFinishedPlaying)) return kStopScratchFile; else
	if ((mState == kPlayingIdle) && (evt == kStop)) return kStopScratchFile; else
	if ((mState == kSetStatusHasAudio) && (evt == kNext)) return kIdle; else
	if ((mState == kSetStatusNoAudio) && (evt == kNext)) return kIdle; else
	if ((mState == kSetStatusPlaying) && (evt == kNext)) return kPlayingIdle; else
	if ((mState == kShowConfirmDelete) && (evt == kNo)) return kDoesScratchExist; else
	if ((mState == kShowConfirmDelete) && (evt == kYes)) return kDeleteScratchFile; else
	if ((mState == kShowCouldntCopy) && (evt == kNext)) return kDoesScratchExist; else
	if ((mState == kShowCouldntDelete) && (evt == kNext)) return kDoesScratchExist; else
	if ((mState == kStart) && (evt == kNext)) return kFirstTimeOnScreen; else
	if ((mState == kStopScratchFile) && (evt == kNext)) return kDoesScratchExist;

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
		case kShowCouldntCopy:
		case kShowCouldntDelete:
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

