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
    JSONObject      mDeleteMessageJSON;
    tSound*         mSound;
    bool            mWasPlaying;

public:
	InboxMessageScreen(InboxMessageVC* newVC, const JSONObject& initObject);
	~InboxMessageScreen();

    void playPressed();
    void pastPressed();
    void replyPressed();
    void forwardPressed();
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
	void peerPopSelfEntry();
	void peerPushForwardMessageEntry();
	void peerPushMessageHistoryEntry();
	void peerPushRecordMessageEntry();
	void playSoundEntry();
	void playingIdleEntry();
	void resumeSoundEntry();
	void sendDeleteMessageToServerEntry();
	void sendDownloadRequestToServerEntry();
	void sendMarkReadToServerEntry();
	void sendReloadInboxToVCEntry();
	void sendReloadInboxToVCForMarkReadEntry();
	void setWaitForDeleteMessageEntry();
	void setWaitForDownloadEntry();
	void setWaitForMarkReadEntry();
	void setWasPlayingToFalseEntry();
	void setWasPlayingToTrueEntry();
	void showErrorDeletingMessageEntry();
	void showRetryDownloadEntry();
	void stopSoundEntry();
	void updateTimeLabelEntry();
	void wasDeleteMessageValidEntry();
	void wereWeGoingToPlayEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kDeleteSelected,
		kFail,
		kFinishedPlaying,
		kForwardSelected,
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
		kPeerPopSelf,
		kPeerPushForwardMessage,
		kPeerPushMessageHistory,
		kPeerPushRecordMessage,
		kPlaySound,
		kPlayingIdle,
		kResumeSound,
		kSendDeleteMessageToServer,
		kSendDownloadRequestToServer,
		kSendMarkReadToServer,
		kSendReloadInboxToVC,
		kSendReloadInboxToVCForMarkRead,
		kSetWaitForDeleteMessage,
		kSetWaitForDownload,
		kSetWaitForMarkRead,
		kSetWasPlayingToFalse,
		kSetWasPlayingToTrue,
		kShowErrorDeletingMessage,
		kShowRetryDownload,
		kStopSound,
		kUpdateTimeLabel,
		kWasDeleteMessageValid,
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


