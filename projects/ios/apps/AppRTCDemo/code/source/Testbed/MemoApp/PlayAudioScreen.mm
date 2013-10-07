#include "Base/package.h"

#include "package.h"

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
    MemoEventManager::getInstance()->attach(this);
    [gAppDelegateInstance setPlayAudioScreenVisible:true];
}

void PlayAudioScreen::endEntry()
{
    [gAppDelegateInstance setPlayAudioScreenVisible:false];
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

#pragma mark Actions

void PlayAudioScreen::showConfirmDeleteEntry()
{
    tConfirm("Delete this recording?");
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
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPlayingIdle: playingIdleEntry(); break;
		case kSendGoInboxToVC: sendGoInboxToVCEntry(); break;
		case kSendGoSendGroupToVC: sendGoSendGroupToVCEntry(); break;
		case kShowConfirmDelete: showConfirmDeleteEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void PlayAudioScreen::CallExit()
{
}

int  PlayAudioScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kIdle) && (evt == kDelete)) return kShowConfirmDelete; else
	if ((mState == kIdle) && (evt == kPlay)) return kPlayingIdle; else
	if ((mState == kIdle) && (evt == kSend)) return kSendGoSendGroupToVC; else
	if ((mState == kPlayingIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kPlayingIdle) && (evt == kDelete)) return kShowConfirmDelete; else
	if ((mState == kPlayingIdle) && (evt == kSend)) return kSendGoSendGroupToVC; else
	if ((mState == kPlayingIdle) && (evt == kStop)) return kIdle; else
	if ((mState == kShowConfirmDelete) && (evt == kNo)) return kIdle; else
	if ((mState == kShowConfirmDelete) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool PlayAudioScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kStart:
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
        case MemoEvent::kDeleteAudioPressed:    process(kDelete); break;
        case MemoEvent::kSendAudioPressed:      process(kSend); break;
        case MemoEvent::kCancelAudioPressed:    process(kCancel); break;

        default:
            break;
    }
}

void PlayAudioScreen::update(const PlayAudioScreenMessage& msg)
{
	process(msg.mEvent);
}

