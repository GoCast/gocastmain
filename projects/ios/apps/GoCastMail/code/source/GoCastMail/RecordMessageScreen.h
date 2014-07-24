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
    std::string         mTranscription;
    std::string         mMessage;
    JSONObject          mInitObject;
    JSONObject          mMessageJSON;
    JSONObject          mPostAudioJSON;
    JSONObject          mPostTranscriptJSON;
    JSONObject          mPostMessageJSON;
    JSONObject          mValidUsersJSON;
    JSONArray           mNewMessageRecipients;
    tSound*             mSound;
    tSound*             mBeginRecordingIndicator;
    tSound*             mEndRecordingIndicator;
    tTimer*             mSliderUpdateTimer;
    tTimer*             mRecordTimer;
    size_t              mRecrodSeconds;
    int32_t             mStartTimeMS;
    int32_t             mAlreadyPlayedTimeMS;
    bool                mDidRecord;
    bool                mGotTranscriptionEvent;
    bool                mRecordingCommand;

public:
    RecordMessageScreen(RecordMessageVC* newVC, const JSONObject& initObject);
	~RecordMessageScreen();

    void recordPressed();
    void readPressed();
    void composePressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void doWeNeedToWaitForRecordingTranscriptionEntry();
	void doWeNeedToWaitForTranscriptionEntry();
	void idleEntry();
	void idleListeningEntry();
	void idleRecordingEntry();
	void idleSpeakingEntry();
	void idleWaitForListeningTranscriptionEntry();
	void idleWaitForRecordingTranscriptionEntry();
	void playBeginListeningIndicatorEntry();
	void playBeginRecordingIndicatorEntry();
	void playEndListeningIndicatorEntry();
	void playEndRecordingIndicatorEntry();
	void speakOkayBeginRecordingANewMessageAfterTheToneEntry();
	void speakOkayLetMeReadThatMessageForYouEntry();
	void speakWhatCanIDoEntry();
	void startListeningForCommandsEntry();
	void startRecordingMessageEntry();
	void startSpeakingMessageEntry();
	void stopListeningForCommandsEntry();
	void stopRecordingMessageEntry();
	void whatDoesTranscriptionSayEntry();

	void idleListeningExit();
	void idleRecordingExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kComposeButtonPressed,
		kIndicatorFinished,
		kNo,
		kNoneOfTheAbove,
		kReadButtonPressed,
		kRecordButtonPressed,
		kSpeakingDone,
		kStopPressed,
		kTranscriptionReady,
		kVoiceCommandHeard,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kDoWeNeedToWaitForRecordingTranscription,
		kDoWeNeedToWaitForTranscription,
		kEnd,
		kIdle,
		kIdleListening,
		kIdleRecording,
		kIdleSpeaking,
		kIdleWaitForListeningTranscription,
		kIdleWaitForRecordingTranscription,
		kPlayBeginListeningIndicator,
		kPlayBeginRecordingIndicator,
		kPlayEndListeningIndicator,
		kPlayEndRecordingIndicator,
		kSpeakOkayBeginRecordingANewMessageAfterTheTone,
		kSpeakOkayLetMeReadThatMessageForYou,
		kSpeakWhatCanIDo,
		kStartListeningForCommands,
		kStartRecordingMessage,
		kStartSpeakingMessage,
		kStopListeningForCommands,
		kStopRecordingMessage,
		kWhatDoesTranscriptionSay,
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


