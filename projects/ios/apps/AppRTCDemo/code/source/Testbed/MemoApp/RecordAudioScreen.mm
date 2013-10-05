#include "Base/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
RecordAudioScreen::RecordAudioScreen()
{
	ConstructMachine();
}

RecordAudioScreen::~RecordAudioScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void RecordAudioScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);

    [gAppDelegateInstance setRecordAudioScreenVisible:true];
}

void RecordAudioScreen::endEntry()
{
    [gAppDelegateInstance setRecordAudioScreenVisible:false];
}

void RecordAudioScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void RecordAudioScreen::idleEntry()
{

}

void RecordAudioScreen::recordingIdleEntry()
{

}

#pragma mark Setting status
void RecordAudioScreen::setStatusIdleEntry()
{
    [gAppDelegateInstance setStartRecordingButtonEnabled:true];
    [gAppDelegateInstance setStopRecordingButtonEnabled:false];
    [gAppDelegateInstance setRecordingStatusLabel:"Idle"];
}

void RecordAudioScreen::setStatusRecordingEntry()
{
    [gAppDelegateInstance setStartRecordingButtonEnabled:false];
    [gAppDelegateInstance setStopRecordingButtonEnabled:true];
    [gAppDelegateInstance setRecordingStatusLabel:"Recording"];
}

void RecordAudioScreen::setStatusSavingEntry()
{
    [gAppDelegateInstance setStartRecordingButtonEnabled:false];
    [gAppDelegateInstance setStopRecordingButtonEnabled:false];
    [gAppDelegateInstance setRecordingStatusLabel:"Saving"];
}

#pragma mark Sending messages to other machines
void RecordAudioScreen::sendGoInboxToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoInbox));
}

void RecordAudioScreen::sendGoRecordingsToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoRecordings));
}

#pragma mark State wiring
void RecordAudioScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kRecordingIdle: recordingIdleEntry(); break;
		case kSendGoInboxToVC: sendGoInboxToVCEntry(); break;
		case kSendGoRecordingsToVC: sendGoRecordingsToVCEntry(); break;
		case kSetStatusIdle: setStatusIdleEntry(); break;
		case kSetStatusRecording: setStatusRecordingEntry(); break;
		case kSetStatusSaving: setStatusSavingEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void RecordAudioScreen::CallExit()
{
}

int  RecordAudioScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kIdle) && (evt == kStartRecording)) return kSetStatusRecording; else
	if ((mState == kRecordingIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kRecordingIdle) && (evt == kStopRecording)) return kSetStatusSaving; else
	if ((mState == kSetStatusIdle) && (evt == kNext)) return kIdle; else
	if ((mState == kSetStatusRecording) && (evt == kNext)) return kRecordingIdle; else
	if ((mState == kSetStatusSaving) && (evt == kNext)) return kSendGoRecordingsToVC; else
	if ((mState == kStart) && (evt == kNext)) return kSetStatusIdle;

	return kInvalidState;
}

bool RecordAudioScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kSetStatusIdle:
		case kSetStatusRecording:
		case kSetStatusSaving:
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void RecordAudioScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kStartRecordingPressed:     process(kStartRecording); break;
        case MemoEvent::kStopRecordingPressed:      process(kStopRecording); break;
        case MemoEvent::kCancelRecordingPressed:    process(kCancel); break;

        default:
            break;
    }
}

void RecordAudioScreen::update(const RecordAudioScreenMessage& msg)
{
	process(msg.mEvent);
}

