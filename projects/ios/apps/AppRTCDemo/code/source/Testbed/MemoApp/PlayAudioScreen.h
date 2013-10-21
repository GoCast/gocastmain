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
	void sendGoInboxToVCEntry();
	void sendGoSendGroupToVCEntry();
	void setStatusPausedEntry();
	void setStatusPlayingEntry();
	void setStatusResumingEntry();
	void setStatusStoppedEntry();
	void stopSoundEntry();
	void updateDurationLabelEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFinishedPlaying,
		kPlay,
		kSend,
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
		kSendGoInboxToVC,
		kSendGoSendGroupToVC,
		kSetStatusPaused,
		kSetStatusPlaying,
		kSetStatusResuming,
		kSetStatusStopped,
		kStopSound,
		kUpdateDurationLabel,
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


