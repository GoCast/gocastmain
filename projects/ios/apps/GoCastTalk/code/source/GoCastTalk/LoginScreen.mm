#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#include "LoginVC.h"

#define kScreenName "Login"

#ifdef ADHOC
std::string kBaseURL("https://chat.gocast.it/memoappserver/");
#else
std::string kBaseURL("http://127.0.0.1:8888/");
#endif

std::string LoginScreen::mBaseURL(kBaseURL);

bool LoginScreen::EnsureInfo(const std::string& newName, const std::string& newPassword)
{
    bool result = !newName.empty();

    NSString *emailRegex = @".+@([A-Za-z0-9]+\\.)+[A-Za-z]{2}[A-Za-z]*";
    NSPredicate *emailTest = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", emailRegex];
    result &= ([emailTest evaluateWithObject:[NSString stringWithUTF8String:newName.c_str()]] == YES) ? true : false;

    result &= !newPassword.empty();

    for (size_t i = 0; i < newPassword.size(); i++)
    {
        result &=   (newPassword[i] >= '0' && newPassword[i] <= '9') ||
                    (newPassword[i] >= 'a' && newPassword[i] <= 'z') ||
                    (newPassword[i] >= 'A' && newPassword[i] <= 'Z');
    }

    return result;
}

#pragma mark Constructor / Destructor
LoginScreen::LoginScreen(LoginVC* newPeer)
: mPeer(newPeer)
{
	ConstructMachine();
}

LoginScreen::~LoginScreen()
{
	DestructMachine();
}

#pragma mark Public methods
std::string LoginScreen::getLoginName()
{
    return mEmail;
}

void LoginScreen::signInPressed(const std::string& newName, const std::string& newPassword)
{
    mEmail      = newName;
    mPassword   = newPassword;

    update(LoginScreenMessage(LoginScreen::kSignInPressed));
}

void LoginScreen::signUpPressed(const std::string& newName, const std::string& newPassword)
{
    mEmail      = newName;
    mPassword   = newPassword;

    update(LoginScreenMessage(LoginScreen::kSignUpPressed));
}

void LoginScreen::troublePressed(const std::string& newName)
{
    mEmail      = newName;

    update(LoginScreenMessage(LoginScreen::kTroublePressed));
}

#pragma mark Start / End / Invalid
void LoginScreen::startEntry()
{
    GoogleAnalytics::getInstance()->trackScreenEntry(kScreenName);

    URLLoader::getInstance()->attach(this);
    GCTEventManager::getInstance()->attach(this);
}

void LoginScreen::endEntry()
{
}

void LoginScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void LoginScreen::idleEntry()
{
}

#pragma mark Peer Communication

void LoginScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

void LoginScreen::peerSetLoginNameEntry()
{
    [mPeer setLoginName:mEmail];
}

#pragma mark Queries
void LoginScreen::didAppRelaunchToPinStateEntry()
{
    SetImmediateEvent(tFile(tFile::kPreferencesDirectory, "pin.txt").exists() ? kYes : kNo);
}

void LoginScreen::isEmailBlankEntry()
{
    bool result = false;

    result = EnsureInfo(mEmail, "abc123");

    SetImmediateEvent(result ? kNo : kYes);
}

void LoginScreen::wasChangePasswordSuccessfulEntry()
{
    bool result = false;

    if (mChangePasswordJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void LoginScreen::wasLoginValidEntry()
{
    bool result = false;
    bool locked = false;

    if (mLoginJSON["status"].mString == std::string("success"))
    {
        result = true;
    }
    else if (mLoginJSON["status"].mString == std::string("locked"))
    {
        locked = true;
    }

    SetImmediateEvent(locked ? kLocked : (result ? kYes : kNo));
}

void LoginScreen::wasRegisterValidEntry()
{
    bool result = false;

    if (mRegisterJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    //TODO: Remove this hack once we can show "registration successful" dialog properly
    if (result)
    {
        GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showUserRegistraionSuccessfulEntry");
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void LoginScreen::wasResetEmailValidEntry()
{
    bool result = false;
    bool locked = false;

    if (mResetEmailJSON["status"].mString == std::string("success"))
    {
        result = true;
    }
    else if (mResetEmailJSON["status"].mString == std::string("locked"))
    {
        locked = true;
    }

    SetImmediateEvent(locked ? kLocked : (result ? kYes : kNo));
}

void LoginScreen::wasVerifyPinValidEntry()
{
    bool result = false;

    if (mVerifyPinJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void LoginScreen::loadLoginNameEntry()
{
    bool result = false;

    tFile loginInfo(tFile::kPreferencesDirectory, "login.txt");

    if (loginInfo.exists())
    {
        mEmail = loginInfo;

        result = !mEmail.empty();
    }

    loginInfo = tFile(tFile::kPreferencesDirectory, "baseURL.txt");

    if (loginInfo.exists())
    {
        mBaseURL = loginInfo;
    }
    else
    {
        mBaseURL = "https://chat.gocast.it/memoappserver/";
    }

    SetImmediateEvent(result ? kSuccess : kFail);
}

void LoginScreen::saveLoginNameEntry()
{
    tFile (tFile::kPreferencesDirectory, "login.txt").write(mEmail);
    tFile (tFile::kPreferencesDirectory, "baseURL.txt").write(mBaseURL);
}

void LoginScreen::ensureSigninInfoEntry()
{
    SetImmediateEvent(EnsureInfo(mEmail, mPassword) ? kSuccess : kFail);
}

void LoginScreen::ensureSignupInfoEntry()
{
    SetImmediateEvent(EnsureInfo(mEmail, mPassword) ? kSuccess : kFail);
}

void LoginScreen::sendLoginToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    char buf[512];

    sprintf(buf, "%s?action=login&name=%s&password=%s",
            kMemoAppServerURL,
            mEmail.c_str(),
            mPassword.c_str());

    if (!InboxScreen::mDeviceToken.empty())
    {
        sprintf(buf, "%s?action=login&name=%s&password=%s&device=%s",
                kMemoAppServerURL,
                mEmail.c_str(),
                mPassword.c_str(),
                InboxScreen::mDeviceToken.c_str());
    }

    URLLoader::getInstance()->loadString(this, buf);
}

void LoginScreen::sendRegisterToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    char buf[512];

    sprintf(buf, "%s?action=register&name=%s&password=%s",
            kMemoAppServerURL,
            mEmail.c_str(),
            mPassword.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void LoginScreen::sendVerifyPinToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    char buf[512];

    sprintf(buf, "%s?action=verifyPin&name=%s&pin=%s",
            kMemoAppServerURL,
            mEmail.c_str(),
            mPin.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void LoginScreen::sendChangePasswordToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=changePassword&name=%s&oldpassword=pin%s&newpassword=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str(),
            mPin.c_str(),
            mNewPassword.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void LoginScreen::sendResetEmailToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=resetEmail&name=%s&lang=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str(),
            I18N::getInstance()->getLocale().c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void LoginScreen::storeTokenInformationEntry()
{
    InboxScreen::mEmailAddress = mEmail;

    InboxScreen::mToken = "";

    if (mLoginJSON["user"].mType == JSONValue::kJSONObject)
    {
        InboxScreen::mToken = mLoginJSON["user"].mObject["authToken"].mString;
    }
    else if (mRegisterJSON["user"].mType == JSONValue::kJSONObject)
    {
        InboxScreen::mToken = mRegisterJSON["user"].mObject["authToken"].mString;
    }

    tFile (tFile::kPreferencesDirectory, "token.txt").write(InboxScreen::mToken);
}

void LoginScreen::validateURLEntry()
{
    if (!mBaseURL.empty())
    {
        SetImmediateEvent(mBaseURL[mBaseURL.size() - 1] == '/' ? kSuccess : kFail);
    }
    else
    {
        SetImmediateEvent(kFail);
    }
}

#pragma mark UI
void LoginScreen::showLoginLockedEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showLoginLockedEntry");
    tAlert("Five unsuccessful login attempts occurred. Your account will be locked for a half hour.");
}

void LoginScreen::showResetEmailLockedEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showResetEmailLockedEntry");
    tAlert("Five unsuccessful password reset attempts occurred. Your account will be locked for a half hour.");
}

void LoginScreen::showUserRegistraionSuccessfulEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showUserRegistraionSuccessfulEntry");
    tAlert("New account registered successfully");
}

void LoginScreen::showAResetEmailHasBeenSentEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showAResetEmailHasBeenSentEntry");
    tAlert("A reset email has been sent to the email provided.");
}

void LoginScreen::showEnterNewPasswordEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showEnterNewPasswordEntry");
    tPrompt("Please enter a new password:");
}

void LoginScreen::showEnterResetCodeEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showEnterResetCodeEntry");
    tFile(tFile::kPreferencesDirectory, "pin.txt").write("yes");
    tPrompt("Please enter the 6-digit reset code:");
}

void LoginScreen::showEnterResetCodeExit()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showEnterResetCodeExit");
    tFile(tFile::kPreferencesDirectory, "pin.txt").remove();
}

void LoginScreen::showSendResetEmailEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showSendResetEmailEntry");
    tConfirm("Send a reset code to the provided email address?");
}

void LoginScreen::showEnterEmailFirstEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showEnterEmailFirstEntry");
    tAlert("Please enter an email address first.");
}

void LoginScreen::showCouldNotLoginEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showCouldNotLoginEntry");
    tAlert("Could not sign in");
}

void LoginScreen::showCouldNotRegisterEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showCouldNotRegisterEntry");
    tAlert("Could not sign up");
}

void LoginScreen::showCouldNotResetPasswordEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showCouldNotResetPasswordEntry");
    tAlert("Could not reset password");
}

void LoginScreen::showIncorrectFormatEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showIncorrectFormatEntry");
    tAlert("User name must be email address format, and password must be letters and numbers only.");
}

void LoginScreen::showURLMissingSlashEntry()
{
    GoogleAnalytics::getInstance()->trackConfirm(kScreenName, "showURLMissingSlashEntry");
    tConfirm("URL missing trailing slash. Continue?");
}

void LoginScreen::showRetryChangePasswordEntry()
{
    GoogleAnalytics::getInstance()->trackConfirm(kScreenName, "showRetryChangePasswordEntry");
    tConfirm("Error contacting server. Retry change password?");
}

void LoginScreen::showRetryResetEmailEntry()
{
    GoogleAnalytics::getInstance()->trackConfirm(kScreenName, "showRetryResetEmailEntry");
    tConfirm("Error contacting server. Retry send email?");
}

void LoginScreen::showRetryVerifyPinEntry()
{
    GoogleAnalytics::getInstance()->trackConfirm(kScreenName, "showRetryVerifyPinEntry");
    tConfirm("Error contacting server. Retry verify pin?");
}

void LoginScreen::showRetryLoginEntry()
{
    GoogleAnalytics::getInstance()->trackConfirm(kScreenName, "showRetryLoginEntry");
    tConfirm("Error contacting server. Retry sign in?");
}

void LoginScreen::showRetryRegisterEntry()
{
    GoogleAnalytics::getInstance()->trackConfirm(kScreenName, "showRetryRegisterEntry");
    tConfirm("Error contacting server. Retry sign up?");
}

void LoginScreen::showSuccessChangedPasswordEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showSuccessChangedPasswordEntry");
    tAlert("Changed password successfully.");
}


#pragma mark Sending messages to other machines
void LoginScreen::sendLoginSucceededToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kLoginSucceeded));
}

#pragma mark State wiring
void LoginScreen::CallEntry()
{
	switch(mState)
	{
		case kDidAppRelaunchToPinState: didAppRelaunchToPinStateEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kEnsureSigninInfo: ensureSigninInfoEntry(); break;
		case kEnsureSignupInfo: ensureSignupInfoEntry(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsEmailBlank: isEmailBlankEntry(); break;
		case kLoadLoginName: loadLoginNameEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kPeerSetLoginName: peerSetLoginNameEntry(); break;
		case kSaveLoginName: saveLoginNameEntry(); break;
		case kSendChangePasswordToServer: sendChangePasswordToServerEntry(); break;
		case kSendLoginSucceededToVC: sendLoginSucceededToVCEntry(); break;
		case kSendLoginToServer: sendLoginToServerEntry(); break;
		case kSendRegisterToServer: sendRegisterToServerEntry(); break;
		case kSendResetEmailToServer: sendResetEmailToServerEntry(); break;
		case kSendVerifyPinToServer: sendVerifyPinToServerEntry(); break;
		case kShowAResetEmailHasBeenSent: showAResetEmailHasBeenSentEntry(); break;
		case kShowCouldNotLogin: showCouldNotLoginEntry(); break;
		case kShowCouldNotRegister: showCouldNotRegisterEntry(); break;
		case kShowCouldNotResetPassword: showCouldNotResetPasswordEntry(); break;
		case kShowEnterEmailFirst: showEnterEmailFirstEntry(); break;
		case kShowEnterNewPassword: showEnterNewPasswordEntry(); break;
		case kShowEnterResetCode: showEnterResetCodeEntry(); break;
		case kShowIncorrectFormat: showIncorrectFormatEntry(); break;
		case kShowLoginLocked: showLoginLockedEntry(); break;
		case kShowResetEmailLocked: showResetEmailLockedEntry(); break;
		case kShowRetryChangePassword: showRetryChangePasswordEntry(); break;
		case kShowRetryLogin: showRetryLoginEntry(); break;
		case kShowRetryRegister: showRetryRegisterEntry(); break;
		case kShowRetryResetEmail: showRetryResetEmailEntry(); break;
		case kShowRetryVerifyPin: showRetryVerifyPinEntry(); break;
		case kShowSendResetEmail: showSendResetEmailEntry(); break;
		case kShowSuccessChangedPassword: showSuccessChangedPasswordEntry(); break;
		case kShowURLMissingSlash: showURLMissingSlashEntry(); break;
		case kShowUserRegistraionSuccessful: showUserRegistraionSuccessfulEntry(); break;
		case kStart: startEntry(); break;
		case kStoreTokenInformation: storeTokenInformationEntry(); break;
		case kValidateURL: validateURLEntry(); break;
		case kWasChangePasswordSuccessful: wasChangePasswordSuccessfulEntry(); break;
		case kWasLoginValid: wasLoginValidEntry(); break;
		case kWasRegisterValid: wasRegisterValidEntry(); break;
		case kWasResetEmailValid: wasResetEmailValidEntry(); break;
		case kWasVerifyPinValid: wasVerifyPinValidEntry(); break;
		default: break;
	}
}

void LoginScreen::CallExit()
{
	switch(mState)
	{
		case kShowEnterResetCode: showEnterResetCodeExit(); break;
		default: break;
	}
}

int  LoginScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDidAppRelaunchToPinState) && (evt == kNo)) return kIdle; else
	if ((mState == kDidAppRelaunchToPinState) && (evt == kYes)) return kShowEnterResetCode; else
	if ((mState == kEnsureSigninInfo) && (evt == kFail)) return kShowIncorrectFormat; else
	if ((mState == kEnsureSigninInfo) && (evt == kSuccess)) return kSendLoginToServer; else
	if ((mState == kEnsureSignupInfo) && (evt == kFail)) return kShowIncorrectFormat; else
	if ((mState == kEnsureSignupInfo) && (evt == kSuccess)) return kSendRegisterToServer; else
	if ((mState == kIdle) && (evt == kSignInPressed)) return kValidateURL; else
	if ((mState == kIdle) && (evt == kSignUpPressed)) return kEnsureSignupInfo; else
	if ((mState == kIdle) && (evt == kTroublePressed)) return kIsEmailBlank; else
	if ((mState == kIsEmailBlank) && (evt == kNo)) return kShowSendResetEmail; else
	if ((mState == kIsEmailBlank) && (evt == kYes)) return kShowEnterEmailFirst; else
	if ((mState == kLoadLoginName) && (evt == kFail)) return kDidAppRelaunchToPinState; else
	if ((mState == kLoadLoginName) && (evt == kSuccess)) return kPeerSetLoginName; else
	if ((mState == kPeerSetLoginName) && (evt == kNext)) return kDidAppRelaunchToPinState; else
	if ((mState == kSaveLoginName) && (evt == kNext)) return kSendLoginSucceededToVC; else
	if ((mState == kSendChangePasswordToServer) && (evt == kFail)) return kShowRetryChangePassword; else
	if ((mState == kSendChangePasswordToServer) && (evt == kSuccess)) return kWasChangePasswordSuccessful; else
	if ((mState == kSendLoginSucceededToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSendLoginToServer) && (evt == kFail)) return kShowRetryLogin; else
	if ((mState == kSendLoginToServer) && (evt == kSuccess)) return kWasLoginValid; else
	if ((mState == kSendRegisterToServer) && (evt == kFail)) return kShowRetryRegister; else
	if ((mState == kSendRegisterToServer) && (evt == kSuccess)) return kWasRegisterValid; else
	if ((mState == kSendResetEmailToServer) && (evt == kFail)) return kShowRetryResetEmail; else
	if ((mState == kSendResetEmailToServer) && (evt == kSuccess)) return kWasResetEmailValid; else
	if ((mState == kSendVerifyPinToServer) && (evt == kFail)) return kShowRetryVerifyPin; else
	if ((mState == kSendVerifyPinToServer) && (evt == kSuccess)) return kWasVerifyPinValid; else
	if ((mState == kShowAResetEmailHasBeenSent) && (evt == kYes)) return kShowEnterResetCode; else
	if ((mState == kShowCouldNotLogin) && (evt == kYes)) return kIdle; else
	if ((mState == kShowCouldNotRegister) && (evt == kYes)) return kIdle; else
	if ((mState == kShowCouldNotResetPassword) && (evt == kYes)) return kIdle; else
	if ((mState == kShowEnterEmailFirst) && (evt == kYes)) return kIdle; else
	if ((mState == kShowEnterNewPassword) && (evt == kNo)) return kShowCouldNotResetPassword; else
	if ((mState == kShowEnterNewPassword) && (evt == kYes)) return kSendChangePasswordToServer; else
	if ((mState == kShowEnterResetCode) && (evt == kNo)) return kShowCouldNotResetPassword; else
	if ((mState == kShowEnterResetCode) && (evt == kYes)) return kSendVerifyPinToServer; else
	if ((mState == kShowIncorrectFormat) && (evt == kYes)) return kIdle; else
	if ((mState == kShowLoginLocked) && (evt == kYes)) return kShowCouldNotLogin; else
	if ((mState == kShowResetEmailLocked) && (evt == kYes)) return kShowCouldNotResetPassword; else
	if ((mState == kShowRetryChangePassword) && (evt == kNo)) return kShowCouldNotResetPassword; else
	if ((mState == kShowRetryChangePassword) && (evt == kYes)) return kSendChangePasswordToServer; else
	if ((mState == kShowRetryLogin) && (evt == kNo)) return kShowCouldNotLogin; else
	if ((mState == kShowRetryLogin) && (evt == kYes)) return kSendLoginToServer; else
	if ((mState == kShowRetryRegister) && (evt == kNo)) return kShowCouldNotRegister; else
	if ((mState == kShowRetryRegister) && (evt == kYes)) return kSendRegisterToServer; else
	if ((mState == kShowRetryResetEmail) && (evt == kNo)) return kShowCouldNotResetPassword; else
	if ((mState == kShowRetryResetEmail) && (evt == kYes)) return kSendResetEmailToServer; else
	if ((mState == kShowRetryVerifyPin) && (evt == kNo)) return kShowCouldNotResetPassword; else
	if ((mState == kShowRetryVerifyPin) && (evt == kYes)) return kSendVerifyPinToServer; else
	if ((mState == kShowSendResetEmail) && (evt == kNo)) return kIdle; else
	if ((mState == kShowSendResetEmail) && (evt == kYes)) return kSendResetEmailToServer; else
	if ((mState == kShowSuccessChangedPassword) && (evt == kYes)) return kIdle; else
	if ((mState == kShowURLMissingSlash) && (evt == kNo)) return kIdle; else
	if ((mState == kShowURLMissingSlash) && (evt == kYes)) return kEnsureSigninInfo; else
	if ((mState == kStart) && (evt == kNext)) return kLoadLoginName; else
	if ((mState == kStoreTokenInformation) && (evt == kNext)) return kSaveLoginName; else
	if ((mState == kValidateURL) && (evt == kFail)) return kShowURLMissingSlash; else
	if ((mState == kValidateURL) && (evt == kSuccess)) return kEnsureSigninInfo; else
	if ((mState == kWasChangePasswordSuccessful) && (evt == kNo)) return kShowCouldNotResetPassword; else
	if ((mState == kWasChangePasswordSuccessful) && (evt == kYes)) return kShowSuccessChangedPassword; else
	if ((mState == kWasLoginValid) && (evt == kLocked)) return kShowLoginLocked; else
	if ((mState == kWasLoginValid) && (evt == kNo)) return kShowCouldNotLogin; else
	if ((mState == kWasLoginValid) && (evt == kYes)) return kStoreTokenInformation; else
	if ((mState == kWasRegisterValid) && (evt == kNo)) return kShowCouldNotRegister; else
	if ((mState == kWasRegisterValid) && (evt == kYes)) return kStoreTokenInformation; else
	if ((mState == kWasResetEmailValid) && (evt == kLocked)) return kShowResetEmailLocked; else
	if ((mState == kWasResetEmailValid) && (evt == kNo)) return kShowCouldNotResetPassword; else
	if ((mState == kWasResetEmailValid) && (evt == kYes)) return kShowAResetEmailHasBeenSent; else
	if ((mState == kWasVerifyPinValid) && (evt == kNo)) return kShowCouldNotResetPassword; else
	if ((mState == kWasVerifyPinValid) && (evt == kYes)) return kShowEnterNewPassword;

	return kInvalidState;
}

bool LoginScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPeerSetLoginName:
		case kSaveLoginName:
		case kSendLoginSucceededToVC:
		case kStart:
		case kStoreTokenInformation:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void LoginScreen::update(const LoginScreenMessage& msg)
{
    switch (msg.mEvent)
    {
        case kSignUpPressed:    GoogleAnalytics::getInstance()->trackButton(kScreenName, "kSignUpPressed"); break;
        case kSignInPressed:    GoogleAnalytics::getInstance()->trackButton(kScreenName, "kSignInPressed"); break;
        case kTroublePressed:   GoogleAnalytics::getInstance()->trackButton(kScreenName, "kTroublePressed"); break;
        default: break;
    }

    switch (msg.mEvent)
    {
        case kYes:
            switch (getState())
            {
                case kShowURLMissingSlash:
                    GoogleAnalytics::getInstance()->trackConfirmYes(kScreenName, "showURLMissingSlashEntry");
                    break;
                case kShowRetryLogin:
                    GoogleAnalytics::getInstance()->trackConfirmYes(kScreenName, "showRetryLoginEntry");
                    break;
                case kShowRetryRegister:
                    GoogleAnalytics::getInstance()->trackConfirmYes(kScreenName, "showRetryRegisterEntry");
                    break;

                default:
                    break;
            }
            break;
        case kNo:
            switch (getState())
            {
                case kShowURLMissingSlash:
                    GoogleAnalytics::getInstance()->trackConfirmNo(kScreenName, "showURLMissingSlashEntry");
                    break;
                case kShowRetryLogin:
                    GoogleAnalytics::getInstance()->trackConfirmNo(kScreenName, "showRetryLoginEntry");
                    break;
                case kShowRetryRegister:
                    GoogleAnalytics::getInstance()->trackConfirmNo(kScreenName, "showRetryRegisterEntry");
                    break;

                default:
                    break;
            }
            break;

        default:
            break;
    }

	process(msg.mEvent);
}

void LoginScreen::update(const URLLoaderEvent& msg)
{
    if (msg.mId == this)
    {
        [mPeer setBlockingViewVisible:false];

        switch (msg.mEvent)
        {
            case URLLoaderEvent::kLoadFail: update(kFail); break;
            case URLLoaderEvent::kLoadedString:
            {
                switch (getState())
                {
                    case kSendChangePasswordToServer:
                        mChangePasswordJSON = JSONUtil::extract(msg.mString);
                        break;

                    case kSendLoginToServer:
                        mLoginJSON = JSONUtil::extract(msg.mString);
                        break;

                    case kSendRegisterToServer:
                        mRegisterJSON = JSONUtil::extract(msg.mString);
                        break;

                    case kSendResetEmailToServer:
                        mResetEmailJSON = JSONUtil::extract(msg.mString);
                        break;

                    case kSendVerifyPinToServer:
                        mVerifyPinJSON = JSONUtil::extract(msg.mString);
                        break;

                    default:
                        break;
                }
                update(kSuccess);
            }
                break;

            case URLLoaderEvent::kLoadedFile: update(kSuccess); break;
                
            default:
                break;
        }
    }
}

void LoginScreen::update(const GCTEvent& msg)
{
    if (msg.mEvent == GCTEvent::kLanguageChanged)
    {
        [mPeer refreshLanguage];
    }

    if (msg.mEvent == GCTEvent::kOKYesAlertPressed)
    {
        switch (getState())
        {
            case kShowEnterResetCode:   mPin            = msg.mPromptResponse; break;
            case kShowEnterNewPassword: mNewPassword    = msg.mPromptResponse; break;
            default: break;
        }
    }

    switch (getState())
    {
        case kShowAResetEmailHasBeenSent:
        case kShowCouldNotLogin:
        case kShowCouldNotRegister:
        case kShowCouldNotResetPassword:
        case kShowEnterEmailFirst:
        case kShowEnterNewPassword:
        case kShowEnterResetCode:
        case kShowIncorrectFormat:
        case kShowLoginLocked:
        case kShowResetEmailLocked:
        case kShowRetryChangePassword:
        case kShowRetryLogin:
        case kShowRetryRegister:
        case kShowRetryResetEmail:
        case kShowRetryVerifyPin:
        case kShowSendResetEmail:
        case kShowSuccessChangedPassword:
        case kShowURLMissingSlash:
        case kShowUserRegistraionSuccessful:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  update(kYes); break;
                case GCTEvent::kNoAlertPressed:     update(kNo); break;

                default:
                    break;
            }
            break;

        default:
            break;
    }
}

