#pragma once

#include <queue>

class RecordAudioScreenMessage;
class MemoEvent;

class RecordAudioScreen
:   public tMealy,
    public tObserver<const RecordAudioScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public Screen
{
protected:

public:
	RecordAudioScreen();
	~RecordAudioScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void recordingIdleEntry();
	void sendGoInboxToVCEntry();
	void sendGoPlayToVCEntry();
	void sendGoRecordingsToVCEntry();
	void setStatusIdleEntry();
	void setStatusRecordingEntry();
	void setStatusStoppingEntry();
	void showCouldntSaveEntry();
	void startRecordingAudioEntry();
	void stopRecordingAudioEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kCancel,
		kFail,
		kStartRecording,
		kStopRecording,
		kSuccess,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kRecordingIdle,
		kSendGoInboxToVC,
		kSendGoPlayToVC,
		kSendGoRecordingsToVC,
		kSetStatusIdle,
		kSetStatusRecording,
		kSetStatusStopping,
		kShowCouldntSave,
		kStartRecordingAudio,
		kStopRecordingAudio,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const MemoEvent& msg);
	void update(const RecordAudioScreenMessage& msg);
};

class RecordAudioScreenMessage
{
public:
	RecordAudioScreen::EventType				mEvent;
	tSubject<const RecordAudioScreenMessage&>*	mSource;

public:
	RecordAudioScreenMessage(RecordAudioScreen::EventType newEvent, tSubject<const RecordAudioScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


