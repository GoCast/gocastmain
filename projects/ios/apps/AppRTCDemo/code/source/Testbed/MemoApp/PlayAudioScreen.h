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
    public  tObserver<const tSoundEvent&>,
    public Screen
{
protected:
    tSound* mScratchSound;

public:
	PlayAudioScreen();
	~PlayAudioScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void deleteScratchFileEntry();
	void doesScratchExistEntry();
	void idleEntry();
	void playScratchFileEntry();
	void playingIdleEntry();
	void sendGoInboxToVCEntry();
	void sendGoSendGroupToVCEntry();
	void setStatusHasAudioEntry();
	void setStatusNoAudioEntry();
	void setStatusPlayingEntry();
	void showConfirmDeleteEntry();
	void showCouldntDeleteEntry();
	void stopScratchFileEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kCancel,
		kDelete,
		kFail,
		kFinishedPlaying,
		kNo,
		kPlay,
		kSend,
		kStop,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kDeleteScratchFile,
		kDoesScratchExist,
		kEnd,
		kIdle,
		kPlayScratchFile,
		kPlayingIdle,
		kSendGoInboxToVC,
		kSendGoSendGroupToVC,
		kSetStatusHasAudio,
		kSetStatusNoAudio,
		kSetStatusPlaying,
		kShowConfirmDelete,
		kShowCouldntDelete,
		kStopScratchFile,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const PlayAudioScreenMessage& msg);
	void update(const MemoEvent& msg);
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


