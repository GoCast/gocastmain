#pragma once

class StartScreenMessage;
class MemoEvent;

class StartScreen
:   public tMealy,
    public tObserver<const StartScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public Screen
{
protected:
    JSONObject mLoginJSON;
    JSONObject mRegisterJSON;

public:
	StartScreen();
	~StartScreen();

    void ready();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void doesLoginTokenExistEntry();
	void idleEntry();
	void isNameAndPasswordFormatCorrectEntry();
	void sendGoInboxToVCEntry();
	void sendLoginRequestEntry();
	void sendRegisterRequestEntry();
	void serverErrorIdleEntry();
	void showFormatProblemEntry();
	void showLoginFailedEntry();
	void showRegistrationFailedEntry();
	void showRegistrationSuccessfulEntry();
	void showRetryLoginEntry();
	void showRetryRegisterEntry();
	void showServerErrorEntry();
	void wasLoginSuccessfulEntry();
	void wasRegisterSuccessfulEntry();
	void writeLoginTokenToDiskEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kLogin,
		kNewAccount,
		kNo,
		kReady,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kDoesLoginTokenExist,
		kEnd,
		kIdle,
		kIsNameAndPasswordFormatCorrect,
		kSendGoInboxToVC,
		kSendLoginRequest,
		kSendRegisterRequest,
		kServerErrorIdle,
		kShowFormatProblem,
		kShowLoginFailed,
		kShowRegistrationFailed,
		kShowRegistrationSuccessful,
		kShowRetryLogin,
		kShowRetryRegister,
		kShowServerError,
		kWasLoginSuccessful,
		kWasRegisterSuccessful,
		kWriteLoginTokenToDisk,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const StartScreenMessage& msg);
	void update(const MemoEvent& msg);
	void update(const URLLoaderEvent& msg);
};

class StartScreenMessage
{
public:
	StartScreen::EventType				mEvent;
	tSubject<const StartScreenMessage&>*	mSource;

public:
	StartScreenMessage(StartScreen::EventType newEvent, tSubject<const StartScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


