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
    std::string mVersionRequiredJSON;
    std::string mLoginJSON;
    std::string mRegisterJSON;

public:
	StartScreen();
	~StartScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void doesLoginTokenExistEntry();
	void idleEntry();
	void inactiveIdleEntry();
	void isNameAndPasswordFormatCorrectEntry();
	void isThisClientCompatibleEntry();
	void sendGoInboxToVCEntry();
	void sendLoginRequestEntry();
	void sendRegisterRequestEntry();
	void sendVersionRequiredRequestEntry();
	void serverErrorIdleEntry();
	void showAppIsOutOfDateEntry();
	void showFormatProblemEntry();
	void showLoginFailedEntry();
	void showRegistrationFailedEntry();
	void showRegistrationSuccessfulEntry();
	void showRetryLoginEntry();
	void showRetryRegisterEntry();
	void showRetryVersionEntry();
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
		kInactiveIdle,
		kIsNameAndPasswordFormatCorrect,
		kIsThisClientCompatible,
		kSendGoInboxToVC,
		kSendLoginRequest,
		kSendRegisterRequest,
		kSendVersionRequiredRequest,
		kServerErrorIdle,
		kShowAppIsOutOfDate,
		kShowFormatProblem,
		kShowLoginFailed,
		kShowRegistrationFailed,
		kShowRegistrationSuccessful,
		kShowRetryLogin,
		kShowRetryRegister,
		kShowRetryVersion,
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


