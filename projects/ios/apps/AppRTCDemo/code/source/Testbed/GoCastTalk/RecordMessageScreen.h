#pragma once

@class RecordMessageVC;

class RecordMessageScreenMessage;

class RecordMessageScreen
:   public tMealy,
    public tObserver<const RecordMessageScreenMessage&>,
    public tObserver<const tSoundEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    RecordMessageVC*    mPeer;
    JSONObject          mInitObject;
    JSONObject          mMessageJSON;
    JSONObject          mPostAudioJSON;
    JSONObject          mPostTranscriptJSON;
    JSONObject          mPostMessageJSON;
    JSONObject          mTranscription;
    tSound*             mSound;
    bool                mDidRecord;

public:
    RecordMessageScreen(RecordMessageVC* newVC, const JSONObject& initObject);
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
	void didWeRecordEntry();
	void letDidRecordBeFalseEntry();
	void letDidRecordBeTrueEntry();
	void pauseAudioEntry();
	void pausedIdleEntry();
	void peerPopSelfEntry();
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
	void showNoAudioToSendEntry();
	void showPostAudioFailedEntry();
	void startRecordingAudioEntry();
	void stopAudioEntry();
	void stopPlayingBeforePopEntry();
	void stopPlayingBeforeSendEntry();
	void stopRecordingAudioEntry();
	void stopRecordingBeforePopEntry();
	void stopRecordingBeforeSendEntry();
	void waitForTranscriptionEntry();
	void waitToPlayIdleEntry();
	void waitToRecordIdleEntry();
	void wasPostAudioSuccessfulEntry();
	void wasPostMessageSuccessfulEntry();
	void wasPostTranscriptSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kCancelPressed,
		kFail,
		kFinishedPlaying,
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
		kDidWeRecord,
		kEnd,
		kLetDidRecordBeFalse,
		kLetDidRecordBeTrue,
		kPauseAudio,
		kPausedIdle,
		kPeerPopSelf,
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
		kShowNoAudioToSend,
		kShowPostAudioFailed,
		kStartRecordingAudio,
		kStopAudio,
		kStopPlayingBeforePop,
		kStopPlayingBeforeSend,
		kStopRecordingAudio,
		kStopRecordingBeforePop,
		kStopRecordingBeforeSend,
		kWaitForTranscription,
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


