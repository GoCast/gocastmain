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
    JSONObject  mVerifyPinJSON;
    JSONObject  mChangePasswordJSON;
    JSONObject  mResetEmailJSON;

    std::string mEmail;
    std::string mPassword;
    std::string mPin;
    std::string mNewPassword;

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
    void troublePressed(const std::string& newName);

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void didAppRelaunchToPinStateEntry();
	void ensureSigninInfoEntry();
	void ensureSignupInfoEntry();
	void idleEntry();
	void isEmailBlankEntry();
	void loadLoginNameEntry();
	void peerPopSelfEntry();
	void peerSetLoginNameEntry();
	void saveLoginNameEntry();
	void sendChangePasswordToServerEntry();
	void sendLoginSucceededToVCEntry();
	void sendLoginToServerEntry();
	void sendRegisterToServerEntry();
	void sendResetEmailToServerEntry();
	void sendVerifyPinToServerEntry();
	void showAResetEmailHasBeenSentEntry();
	void showChangePasswordLockedEntry();
	void showCouldNotLoginEntry();
	void showCouldNotRegisterEntry();
	void showCouldNotResetPasswordEntry();
	void showEnterEmailFirstEntry();
	void showEnterNewPasswordEntry();
	void showEnterResetCodeEntry();
	void showIncorrectFormatEntry();
	void showLoginLockedEntry();
	void showResetEmailLockedEntry();
	void showRetryChangePasswordEntry();
	void showRetryLoginEntry();
	void showRetryRegisterEntry();
	void showRetryResetEmailEntry();
	void showRetryVerifyPinEntry();
	void showSendResetEmailEntry();
	void showSuccessChangedPasswordEntry();
	void showURLMissingSlashEntry();
	void showUserRegistraionSuccessfulEntry();
	void storeTokenInformationEntry();
	void validateURLEntry();
	void wasChangePasswordSuccessfulEntry();
	void wasLoginValidEntry();
	void wasRegisterValidEntry();
	void wasResetEmailValidEntry();
	void wasVerifyPinValidEntry();

	void showEnterResetCodeExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kLocked,
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
		kDidAppRelaunchToPinState,
		kEnd,
		kEnsureSigninInfo,
		kEnsureSignupInfo,
		kIdle,
		kIsEmailBlank,
		kLoadLoginName,
		kPeerPopSelf,
		kPeerSetLoginName,
		kSaveLoginName,
		kSendChangePasswordToServer,
		kSendLoginSucceededToVC,
		kSendLoginToServer,
		kSendRegisterToServer,
		kSendResetEmailToServer,
		kSendVerifyPinToServer,
		kShowAResetEmailHasBeenSent,
		kShowChangePasswordLocked,
		kShowCouldNotLogin,
		kShowCouldNotRegister,
		kShowCouldNotResetPassword,
		kShowEnterEmailFirst,
		kShowEnterNewPassword,
		kShowEnterResetCode,
		kShowIncorrectFormat,
		kShowLoginLocked,
		kShowResetEmailLocked,
		kShowRetryChangePassword,
		kShowRetryLogin,
		kShowRetryRegister,
		kShowRetryResetEmail,
		kShowRetryVerifyPin,
		kShowSendResetEmail,
		kShowSuccessChangedPassword,
		kShowURLMissingSlash,
		kShowUserRegistraionSuccessful,
		kStoreTokenInformation,
		kValidateURL,
		kWasChangePasswordSuccessful,
		kWasLoginValid,
		kWasRegisterValid,
		kWasResetEmailValid,
		kWasVerifyPinValid,
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


