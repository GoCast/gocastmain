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
    std::string mDeleteFileJSON;
    tSound* mSound;
    bool mExistsOnServer;

public:
	PlayAudioScreen(const std::string& newFile, bool newExistsOnServer);
	~PlayAudioScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void deleteScratchFileEntry();
	void doesFileExistOnServerEntry();
	void doesScratchExistEntry();
	void idleEntry();
	void playScratchFileEntry();
	void playingIdleEntry();
	void sendDeleteRequestToServerEntry();
	void sendGoInboxToVCEntry();
	void sendGoSendGroupToVCEntry();
	void setStatusHasAudioEntry();
	void setStatusNoAudioEntry();
	void setStatusPlayingEntry();
	void setWaitForDeleteEntry();
	void showConfirmDeleteEntry();
	void showCouldntDeleteEntry();
	void showDeleteFailedEntry();
	void showRetryDeleteEntry();
	void stopScratchFileEntry();
	void wasDeleteSuccessfulEntry();

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
		kDoesFileExistOnServer,
		kDoesScratchExist,
		kEnd,
		kIdle,
		kPlayScratchFile,
		kPlayingIdle,
		kSendDeleteRequestToServer,
		kSendGoInboxToVC,
		kSendGoSendGroupToVC,
		kSetStatusHasAudio,
		kSetStatusNoAudio,
		kSetStatusPlaying,
		kSetWaitForDelete,
		kShowConfirmDelete,
		kShowCouldntDelete,
		kShowDeleteFailed,
		kShowRetryDelete,
		kStopScratchFile,
		kWasDeleteSuccessful,
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


