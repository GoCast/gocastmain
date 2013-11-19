#import <AVFoundation/AVFoundation.h>

#include "Base/package.h"
#include "Io/package.h"

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
    [gAppDelegateInstance setNavigationBarTitle:"New Memo"];
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

void RecordAudioScreen::recordedIdleEntry()
{
}

#pragma mark Setting status
void RecordAudioScreen::setStatusIdleEntry()
{
    [gAppDelegateInstance setStartRecordingButtonEnabled:true];
    [gAppDelegateInstance setStopRecordingButtonEnabled:false];
    [gAppDelegateInstance setCancelRecordingButtonVisible:true];
    [gAppDelegateInstance setSaveRecordingButtonVisible:false];
    [gAppDelegateInstance setSendRecordingButtonEnabled:false];
    [gAppDelegateInstance setRecordingStatusLabel:"Idle"];
}

void RecordAudioScreen::setStatusRecordedEntry()
{
    [gAppDelegateInstance setStartRecordingButtonEnabled:true];
    [gAppDelegateInstance setStopRecordingButtonEnabled:false];
    [gAppDelegateInstance setCancelRecordingButtonVisible:false];
    [gAppDelegateInstance setSaveRecordingButtonVisible:true];
    [gAppDelegateInstance setSendRecordingButtonEnabled:true];
    [gAppDelegateInstance setRecordingStatusLabel:"Recorded"];
}

void RecordAudioScreen::setStatusRecordingEntry()
{
    [gAppDelegateInstance setStartRecordingButtonEnabled:false];
    [gAppDelegateInstance setStopRecordingButtonEnabled:true];
    [gAppDelegateInstance setCancelRecordingButtonVisible:true];
    [gAppDelegateInstance setSaveRecordingButtonVisible:false];
    [gAppDelegateInstance setSendRecordingButtonEnabled:false];
    [gAppDelegateInstance setRecordingStatusLabel:"Recording"];
}

void RecordAudioScreen::setStatusStoppingEntry()
{
    [gAppDelegateInstance setStartRecordingButtonEnabled:false];
    [gAppDelegateInstance setStopRecordingButtonEnabled:false];
    [gAppDelegateInstance setCancelRecordingButtonVisible:true];
    [gAppDelegateInstance setSaveRecordingButtonVisible:false];
    [gAppDelegateInstance setSendRecordingButtonEnabled:false];
    [gAppDelegateInstance setRecordingStatusLabel:"Stopping"];
}

void RecordAudioScreen::showCouldntSaveEntry()
{
    tAlert("Error saving audio file");
}

#pragma mark Actions
void RecordAudioScreen::startRecordingAudioEntry()
{
    [gAppDelegateInstance startRecorder];
}

void RecordAudioScreen::stopRecordingAudioEntry()
{
    char buf[80];
    time_t curTime;
    tm*    timeStruct;
    bool result;

    [gAppDelegateInstance stopRecorder];

    curTime=time(NULL);
    timeStruct = localtime(&curTime);

    sprintf(buf, "%04d%02d%02d%02d%02d%02d%02d",
            timeStruct->tm_year+1900,   timeStruct->tm_mon+1,   timeStruct->tm_mday,
            timeStruct->tm_hour,        timeStruct->tm_min,     timeStruct->tm_sec,
            tTimer::getSystemTimeMS() % 100);

    tFile scratch(tFile::kTemporaryDirectory, "scratch.wav");

    result = scratch.rename(tFile::kDocumentsDirectory, buf);

    mResultFilename = buf;

    SetImmediateEvent(result ? kSuccess : kFail);
}

#pragma mark Sending messages to other machines

void RecordAudioScreen::sendGoInboxToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoInbox));
}

void RecordAudioScreen::sendGoPlayToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoPlay, mResultFilename));
}

void RecordAudioScreen::sendGoSendGroupToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoSendGroup, mResultFilename));
}

#pragma mark State wiring
void RecordAudioScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kRecordedIdle: recordedIdleEntry(); break;
		case kRecordingIdle: recordingIdleEntry(); break;
		case kSendGoInboxToVC: sendGoInboxToVCEntry(); break;
		case kSendGoPlayToVC: sendGoPlayToVCEntry(); break;
		case kSendGoSendGroupToVC: sendGoSendGroupToVCEntry(); break;
		case kSetStatusIdle: setStatusIdleEntry(); break;
		case kSetStatusRecorded: setStatusRecordedEntry(); break;
		case kSetStatusRecording: setStatusRecordingEntry(); break;
		case kSetStatusStopping: setStatusStoppingEntry(); break;
		case kShowCouldntSave: showCouldntSaveEntry(); break;
		case kStart: startEntry(); break;
		case kStartRecordingAudio: startRecordingAudioEntry(); break;
		case kStopRecordingAudio: stopRecordingAudioEntry(); break;
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
	if ((mState == kRecordedIdle) && (evt == kSave)) return kSendGoInboxToVC; else
	if ((mState == kRecordedIdle) && (evt == kSend)) return kSendGoSendGroupToVC; else
	if ((mState == kRecordedIdle) && (evt == kStartRecording)) return kSetStatusRecording; else
	if ((mState == kRecordingIdle) && (evt == kCancel)) return kSendGoInboxToVC; else
	if ((mState == kRecordingIdle) && (evt == kStopRecording)) return kSetStatusStopping; else
	if ((mState == kSetStatusIdle) && (evt == kNext)) return kIdle; else
	if ((mState == kSetStatusRecorded) && (evt == kNext)) return kRecordedIdle; else
	if ((mState == kSetStatusRecording) && (evt == kNext)) return kStartRecordingAudio; else
	if ((mState == kSetStatusStopping) && (evt == kNext)) return kStopRecordingAudio; else
	if ((mState == kShowCouldntSave) && (evt == kNext)) return kSetStatusIdle; else
	if ((mState == kStart) && (evt == kNext)) return kSetStatusIdle; else
	if ((mState == kStartRecordingAudio) && (evt == kNext)) return kRecordingIdle; else
	if ((mState == kStopRecordingAudio) && (evt == kFail)) return kShowCouldntSave; else
	if ((mState == kStopRecordingAudio) && (evt == kSuccess)) return kSetStatusRecorded;

	return kInvalidState;
}

bool RecordAudioScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kSetStatusIdle:
		case kSetStatusRecorded:
		case kSetStatusRecording:
		case kSetStatusStopping:
		case kShowCouldntSave:
		case kStart:
		case kStartRecordingAudio:
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
        case MemoEvent::kSaveRecordingPressed:      process(kSave); break;
        case MemoEvent::kSendRecordingPressed:      process(kSend); break;

        default:
            break;
    }
}

void RecordAudioScreen::update(const RecordAudioScreenMessage& msg)
{
	process(msg.mEvent);
}

