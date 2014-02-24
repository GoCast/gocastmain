#pragma once

@class LoginVC;

class LoginScreenMessage;

class LoginScreen
:   public tMealy,
    public tObserver<const LoginScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    LoginVC*    mPeer;
    JSONObject  mLoginJSON;
    JSONObject  mRegisterJSON;
    std::string mEmail;
    std::string mPassword;

public:
    static std::string mBaseURL;

protected:
    bool EnsureInfo(const std::string& newName, const std::string& newPassword);

public:
	LoginScreen(LoginVC* newPeer);
	~LoginScreen();

    std::string getLoginName();

    void signInPressed(const std::string& newName, const std::string& newPassword);
    void signUpPressed(const std::string& newName, const std::string& newPassword);
    void troublePressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void ensureSigninInfoEntry();
	void ensureSignupInfoEntry();
	void idleEntry();
	void loadLoginNameEntry();
	void peerPopSelfEntry();
	void peerSetLoginNameEntry();
	void saveLoginNameEntry();
	void sendLoginToServerEntry();
	void sendRegisterToServerEntry();
	void sendReloadInboxToVCEntry();
	void setWaitForLoginEntry();
	void setWaitForRegisterEntry();
	void showCouldNotLoginEntry();
	void showCouldNotRegisterEntry();
	void showIncorrectFormatEntry();
	void showNotYetImplementedEntry();
	void showRetryLoginEntry();
	void showRetryRegisterEntry();
	void showURLMissingSlashEntry();
	void storeTokenInformationEntry();
	void validateURLEntry();
	void wasLoginValidEntry();
	void wasRegisterValidEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kNo,
		kSignInPressed,
		kSignUpPressed,
		kSuccess,
		kTroublePressed,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kEnsureSigninInfo,
		kEnsureSignupInfo,
		kIdle,
		kLoadLoginName,
		kPeerPopSelf,
		kPeerSetLoginName,
		kSaveLoginName,
		kSendLoginToServer,
		kSendRegisterToServer,
		kSendReloadInboxToVC,
		kSetWaitForLogin,
		kSetWaitForRegister,
		kShowCouldNotLogin,
		kShowCouldNotRegister,
		kShowIncorrectFormat,
		kShowNotYetImplemented,
		kShowRetryLogin,
		kShowRetryRegister,
		kShowURLMissingSlash,
		kStoreTokenInformation,
		kValidateURL,
		kWasLoginValid,
		kWasRegisterValid,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const LoginScreenMessage& msg);
	void update(const URLLoaderEvent& msg);
	void update(const GCTEvent& msg);
};

class LoginScreenMessage
{
public:
	LoginScreen::EventType				mEvent;
	tSubject<const LoginScreenMessage&>*	mSource;

public:
	LoginScreenMessage(LoginScreen::EventType newEvent, tSubject<const LoginScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


