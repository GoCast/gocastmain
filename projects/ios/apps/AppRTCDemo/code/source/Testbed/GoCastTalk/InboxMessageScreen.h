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
    public tObserver<const GCTEvent&>,
    public tObserver<const tTimerEvent&>
{
protected:
    InboxMessageVC* mPeer;
    JSONObject      mInitObject;
    JSONObject      mDeleteMessageJSON;
    tSound*         mSound;
    tTimer*         mSliderUpdateTimer;
    int32_t         mStartTimeMS;
    int32_t         mAlreadyPlayedTimeMS;
    bool            mWasPlaying;

public:
	InboxMessageScreen(InboxMessageVC* newVC, const JSONObject& initObject);
	~InboxMessageScreen();

    size_t getToCount();
    std::string getTo(const size_t& i);

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
	void fixRecipientListEntry();
	void idleEntry();
	void pauseSoundEntry();
	void pausedIdleEntry();
	void peerPopSelfEntry();
	void peerPushMessageHistoryEntry();
	void playSoundEntry();
	void playingIdleEntry();
	void resumeSoundEntry();
	void sendDeleteMessageToServerEntry();
	void sendDownloadRequestToServerEntry();
	void sendForceLogoutToVCEntry();
	void sendMarkReadToServerEntry();
	void sendNewMessageToGroupToVCEntry();
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
		kExpired,
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
		kFixRecipientList,
		kIdle,
		kPauseSound,
		kPausedIdle,
		kPeerPopSelf,
		kPeerPushMessageHistory,
		kPlaySound,
		kPlayingIdle,
		kResumeSound,
		kSendDeleteMessageToServer,
		kSendDownloadRequestToServer,
		kSendForceLogoutToVC,
		kSendMarkReadToServer,
		kSendNewMessageToGroupToVC,
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
    void update(const tTimerEvent& msg);
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


