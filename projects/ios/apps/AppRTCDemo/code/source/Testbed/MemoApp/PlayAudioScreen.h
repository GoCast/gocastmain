#pragma once

#include <queue>

class PlayAudioScreenMessage;
class MemoEvent;

class tSound;
class tSoundEvent;

class PlayAudioScreen
:   public tMealy,
    public tObserver<const PlayAudioScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const tSoundEvent&>,
    public Screen
{
protected:
    JSONObject mGetTranscriptJSON;
    std::string mFilename;
    tSound* mSound;
    bool mExistsOnServer;

public:
	PlayAudioScreen(const std::string& newFile, bool newExistsOnServer);
	~PlayAudioScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void loadSoundEntry();
	void pauseSoundEntry();
	void pausedIdleEntry();
	void playSoundEntry();
	void playingIdleEntry();
	void resumeSoundEntry();
	void sendGetTranscriptionToServerEntry();
	void sendGoSendGroupToVCEntry();
	void setStatusInitialEntry();
	void setStatusPausedEntry();
	void setStatusPlayingEntry();
	void setStatusResumingEntry();
	void setStatusStoppedEntry();
	void setWaitForGetTranscriptionEntry();
	void stopSoundEntry();
	void updateDurationLabelEntry();
	void updateTranscriptionEntry();
	void wasGetTranscriptionSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kFinishedPlaying,
		kNo,
		kPlay,
		kSend,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kLoadSound,
		kPauseSound,
		kPausedIdle,
		kPlaySound,
		kPlayingIdle,
		kResumeSound,
		kSendGetTranscriptionToServer,
		kSendGoSendGroupToVC,
		kSetStatusInitial,
		kSetStatusPaused,
		kSetStatusPlaying,
		kSetStatusResuming,
		kSetStatusStopped,
		kSetWaitForGetTranscription,
		kStopSound,
		kUpdateDurationLabel,
		kUpdateTranscription,
		kWasGetTranscriptionSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const PlayAudioScreenMessage& msg);
	void update(const MemoEvent& msg);
	void update(const URLLoaderEvent& msg);
    void update(const tSoundEvent& msg);
};

class PlayAudioScreenMessage
{
public:
	PlayAudioScreen::EventType				mEvent;
	tSubject<const PlayAudioScreenMessage&>*	mSource;

public:
	PlayAudioScreenMessage(PlayAudioScreen::EventType newEvent, tSubject<const PlayAudioScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


