#pragma once

@class InboxMessageVC;

class InboxMessageScreenMessage;

class tSound;
class tSoundEvent;

class InboxMessageScreen
:   public tMealy,
    public tObserver<const InboxMessageScreenMessage&>,
    public tObserver<const tSoundEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    InboxMessageVC* mPeer;
    JSONObject      mInitObject;
    tSound*         mSound;
    bool            mWasPlaying;

public:
	InboxMessageScreen(InboxMessageVC* newVC, const JSONObject& initObject);
	~InboxMessageScreen();

    void playPressed();
    void pastPressed();
    void replyPressed();
    void deletePressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void copyDownloadToLocalFilesEntry();
	void doesAudioExistLocallyEntry();
	void idleEntry();
	void pauseSoundEntry();
	void pausedIdleEntry();
	void peerPushRecordMessageEntry();
	void playSoundEntry();
	void playingIdleEntry();
	void resumeSoundEntry();
	void sendDownloadRequestToServerEntry();
	void setWaitForDownloadEntry();
	void setWasPlayingToFalseEntry();
	void setWasPlayingToTrueEntry();
	void showNotImplementedYetEntry();
	void showRetryDownloadEntry();
	void stopSoundEntry();
	void updateTimeLabelEntry();
	void wereWeGoingToPlayEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kDeleteSelected,
		kFail,
		kFinishedPlaying,
		kNo,
		kPastSelected,
		kPlayPressed,
		kReplySelected,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kCopyDownloadToLocalFiles,
		kDoesAudioExistLocally,
		kEnd,
		kIdle,
		kPauseSound,
		kPausedIdle,
		kPeerPushRecordMessage,
		kPlaySound,
		kPlayingIdle,
		kResumeSound,
		kSendDownloadRequestToServer,
		kSetWaitForDownload,
		kSetWasPlayingToFalse,
		kSetWasPlayingToTrue,
		kShowNotImplementedYet,
		kShowRetryDownload,
		kStopSound,
		kUpdateTimeLabel,
		kWereWeGoingToPlay,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const InboxMessageScreenMessage& msg);
    void update(const tSoundEvent& msg);
    void update(const URLLoaderEvent& msg);
    void update(const GCTEvent& msg);
};

class InboxMessageScreenMessage
{
public:
	InboxMessageScreen::EventType				mEvent;
	tSubject<const InboxMessageScreenMessage&>*	mSource;

public:
	InboxMessageScreenMessage(InboxMessageScreen::EventType newEvent, tSubject<const InboxMessageScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


