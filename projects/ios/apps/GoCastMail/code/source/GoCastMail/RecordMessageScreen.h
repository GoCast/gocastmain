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
    tSound*             mNewMessage;
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

	void idleDoneEntry();
	void idleWaitForHeyGocastEntry();
	void idleWaitForOkayImFinishedEntry();
	void idleWaitForReadFiveEntry();
	void idleWaitForReadMeTheSecondEmailEntry();
	void idleWaitForReadMyNewMessagesEntry();
	void idleWaitForYesLetsReplyEntry();
	void idleWaitForYesLetsReviewEntry();
	void idleWaitForYesReadItBackEntry();
	void idleWaitForYesSendThisEmailEntry();
	void playSendingSoundEntry();
	void speakDemoEmailEntry();
	void speakFiveSubjectLinesEntry();
	void speakFourSubjectLinesEntry();
	void speakHeyHowCanIHelpYouEntry();
	void speakPleaseReplyToEmailEntry();
	void speakReadBackEmailEntry();
	void speakReviewOtherFourEntry();
	void speakWouldYouLikeReadBackEntry();
	void speakYouHave20NewMessagesEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kHeardFive,
		kHeardHey,
		kHeardOkay,
		kHeardReadMeSecond,
		kHeardReadNew,
		kHeardYes,
		kIndicatorFinished,
		kSpeakingDone,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdleDone,
		kIdleWaitForHeyGocast,
		kIdleWaitForOkayImFinished,
		kIdleWaitForReadFive,
		kIdleWaitForReadMeTheSecondEmail,
		kIdleWaitForReadMyNewMessages,
		kIdleWaitForYesLetsReply,
		kIdleWaitForYesLetsReview,
		kIdleWaitForYesReadItBack,
		kIdleWaitForYesSendThisEmail,
		kPlaySendingSound,
		kSpeakDemoEmail,
		kSpeakFiveSubjectLines,
		kSpeakFourSubjectLines,
		kSpeakHeyHowCanIHelpYou,
		kSpeakPleaseReplyToEmail,
		kSpeakReadBackEmail,
		kSpeakReviewOtherFour,
		kSpeakWouldYouLikeReadBack,
		kSpeakYouHave20NewMessages,
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


