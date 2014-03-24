#pragma once

@class RecordMessageVC;

class RecordMessageScreenMessage;

class RecordMessageScreen
:   public tMealy,
    public tObserver<const RecordMessageScreenMessage&>,
    public tObserver<const tSoundEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>,
    public tObserver<const tTimerEvent&>
{
protected:
    RecordMessageVC*    mPeer;
    JSONObject          mInitObject;
    JSONObject          mMessageJSON;
    JSONObject          mPostAudioJSON;
    JSONObject          mPostTranscriptJSON;
    JSONObject          mPostMessageJSON;
    JSONObject          mTranscription;
    JSONArray           mNewMessageRecipients;
    tSound*             mSound;
    tTimer*             mTenMinuteTimer;
    tTimer*             mSliderUpdateTimer;
    tTimer*             mRecordTimer;
    size_t              mRecrodSeconds;
    int32_t             mStartTimeMS;
    int32_t             mAlreadyPlayedTimeMS;
    bool                mDidRecord;
    bool                mIsForwarded;
    bool                mIsChild;
    bool                mGotTranscriptionEvent;

public:
    RecordMessageScreen(RecordMessageVC* newVC, const JSONObject& initObject, bool newIsForwarded, bool newIsChild);
	~RecordMessageScreen();

    size_t getToCount();
    std::string getTo(const size_t& i);
    void deleteTo(const size_t& i);

    void donePressed();
    void cancelPressed();

    void pausePressed();
    void recordPressed();
    void playPressed();
    void stopPressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void calculateMessageJSONEntry();
	void clearDataAndReloadTableEntry();
	void copyRecipientsAndReloadTableEntry();
	void didWeRecordEntry();
	void doWeHaveContactsToSendToEntry();
	void doWeHaveRecipientsOrARecordingEntry();
	void doWeNeedToWaitForTranscriptionEntry();
	void fixRecipientListEntry();
	void isForwardingMessageEntry();
	void letDidRecordBeIsForwardedValueEntry();
	void letDidRecordBeTrueEntry();
	void pauseAudioEntry();
	void pausedIdleEntry();
	void peerPopAllInboxViewsEntry();
	void peerSwitchToInboxTabEntry();
	void peerSwitchToNewMemoTabEntry();
	void playAudioEntry();
	void playingIdleEntry();
	void recordingIdleEntry();
	void resumeAudioEntry();
	void sendPostAudioToServerEntry();
	void sendPostMessageToServerEntry();
	void sendPostTranscriptToServerEntry();
	void sendReloadInboxToVCEntry();
	void setWaitForPostAudioEntry();
	void setWaitForTranscriptionEntry();
	void showComposeNewMessageEntry();
	void showConfirmDeleteEntry();
	void showConfirmSendEntry();
	void showNoContactsToSendToEntry();
	void showPostAudioFailedEntry();
	void startRecordingAudioEntry();
	void stopAudioEntry();
	void stopPlayingBeforePopEntry();
	void stopPlayingBeforeSendEntry();
	void stopRecordingAudioEntry();
	void waitForTranscriptionIdleEntry();
	void waitToPlayIdleEntry();
	void waitToRecordIdleEntry();
	void wasPostAudioSuccessfulEntry();
	void wasPostMessageSuccessfulEntry();
	void wasPostTranscriptSuccessfulEntry();

	void recordingIdleExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kCancelPressed,
		kFail,
		kFinishedPlaying,
		kNewMessage,
		kNo,
		kPausePressed,
		kPlayPressed,
		kRecordPressed,
		kSendPressed,
		kStopPressed,
		kSuccess,
		kTranscriptionReady,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kCalculateMessageJSON,
		kClearDataAndReloadTable,
		kCopyRecipientsAndReloadTable,
		kDidWeRecord,
		kDoWeHaveContactsToSendTo,
		kDoWeHaveRecipientsOrARecording,
		kDoWeNeedToWaitForTranscription,
		kEnd,
		kFixRecipientList,
		kIsForwardingMessage,
		kLetDidRecordBeIsForwardedValue,
		kLetDidRecordBeTrue,
		kPauseAudio,
		kPausedIdle,
		kPeerPopAllInboxViews,
		kPeerSwitchToInboxTab,
		kPeerSwitchToNewMemoTab,
		kPlayAudio,
		kPlayingIdle,
		kRecordingIdle,
		kResumeAudio,
		kSendPostAudioToServer,
		kSendPostMessageToServer,
		kSendPostTranscriptToServer,
		kSendReloadInboxToVC,
		kSetWaitForPostAudio,
		kSetWaitForTranscription,
		kShowComposeNewMessage,
		kShowConfirmDelete,
		kShowConfirmSend,
		kShowNoContactsToSendTo,
		kShowPostAudioFailed,
		kStartRecordingAudio,
		kStopAudio,
		kStopPlayingBeforePop,
		kStopPlayingBeforeSend,
		kStopRecordingAudio,
		kWaitForTranscriptionIdle,
		kWaitToPlayIdle,
		kWaitToRecordIdle,
		kWasPostAudioSuccessful,
		kWasPostMessageSuccessful,
		kWasPostTranscriptSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const RecordMessageScreenMessage& msg);
	void update(const tSoundEvent& msg);
	void update(const URLLoaderEvent& msg);
	void update(const GCTEvent& msg);
	void update(const tTimerEvent& msg);
};

class RecordMessageScreenMessage
{
public:
	RecordMessageScreen::EventType				mEvent;
	tSubject<const RecordMessageScreenMessage&>*	mSource;

public:
	RecordMessageScreenMessage(RecordMessageScreen::EventType newEvent, tSubject<const RecordMessageScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


