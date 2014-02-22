#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#include "LoginVC.h"

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

void LoginScreen::troublePressed()
{
    update(LoginScreenMessage(LoginScreen::kTroublePressed));
}

#pragma mark Start / End / Invalid
void LoginScreen::startEntry()
{
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
void LoginScreen::wasLoginValidEntry()
{
    bool result = false;

    if (mLoginJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void LoginScreen::wasRegisterValidEntry()
{
    bool result = false;

    if (mRegisterJSON["status"].mString == std::string("success"))
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
        mBaseURL = "http://chat.gocast.it/memoappserver/";
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
    char buf[512];

    sprintf(buf, "%s?action=login&name=%s&password=%s",
            kMemoAppServerURL,
            mEmail.c_str(),
            mPassword.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

void LoginScreen::sendRegisterToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=register&name=%s&password=%s",
            kMemoAppServerURL,
            mEmail.c_str(),
            mPassword.c_str());

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
}

#pragma mark UI
void LoginScreen::setWaitForLoginEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void LoginScreen::setWaitForRegisterEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void LoginScreen::showCouldNotLoginEntry()
{
    tAlert("Could not sign in");
}

void LoginScreen::showCouldNotRegisterEntry()
{
    tAlert("Could not sign up");
}

void LoginScreen::showIncorrectFormatEntry()
{
    tAlert("User name must be email address format, and password must be letters and numbers only.");
}

void LoginScreen::showNotYetImplementedEntry()
{
    tAlert("Not yet implemented");
}

void LoginScreen::showRetryLoginEntry()
{
    tConfirm("Error contacting server. Retry sign in?");
}

void LoginScreen::showRetryRegisterEntry()
{
    tConfirm("Error contacting server. Retry sign up?");
}


#pragma mark Sending messages to other machines
void LoginScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void LoginScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kEnsureSigninInfo: ensureSigninInfoEntry(); break;
		case kEnsureSignupInfo: ensureSignupInfoEntry(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kLoadLoginName: loadLoginNameEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kPeerSetLoginName: peerSetLoginNameEntry(); break;
		case kSaveLoginName: saveLoginNameEntry(); break;
		case kSendLoginToServer: sendLoginToServerEntry(); break;
		case kSendRegisterToServer: sendRegisterToServerEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSetWaitForLogin: setWaitForLoginEntry(); break;
		case kSetWaitForRegister: setWaitForRegisterEntry(); break;
		case kShowCouldNotLogin: showCouldNotLoginEntry(); break;
		case kShowCouldNotRegister: showCouldNotRegisterEntry(); break;
		case kShowIncorrectFormat: showIncorrectFormatEntry(); break;
		case kShowNotYetImplemented: showNotYetImplementedEntry(); break;
		case kShowRetryLogin: showRetryLoginEntry(); break;
		case kShowRetryRegister: showRetryRegisterEntry(); break;
		case kStart: startEntry(); break;
		case kStoreTokenInformation: storeTokenInformationEntry(); break;
		case kWasLoginValid: wasLoginValidEntry(); break;
		case kWasRegisterValid: wasRegisterValidEntry(); break;
		default: break;
	}
}

void LoginScreen::CallExit()
{
}

int  LoginScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kEnsureSigninInfo) && (evt == kFail)) return kShowIncorrectFormat; else
	if ((mState == kEnsureSigninInfo) && (evt == kSuccess)) return kSetWaitForLogin; else
	if ((mState == kEnsureSignupInfo) && (evt == kFail)) return kShowIncorrectFormat; else
	if ((mState == kEnsureSignupInfo) && (evt == kSuccess)) return kSetWaitForRegister; else
	if ((mState == kIdle) && (evt == kSignInPressed)) return kEnsureSigninInfo; else
	if ((mState == kIdle) && (evt == kSignUpPressed)) return kEnsureSignupInfo; else
	if ((mState == kIdle) && (evt == kTroublePressed)) return kShowNotYetImplemented; else
	if ((mState == kLoadLoginName) && (evt == kFail)) return kIdle; else
	if ((mState == kLoadLoginName) && (evt == kSuccess)) return kPeerSetLoginName; else
	if ((mState == kPeerSetLoginName) && (evt == kNext)) return kIdle; else
	if ((mState == kSaveLoginName) && (evt == kNext)) return kSendReloadInboxToVC; else
	if ((mState == kSendLoginToServer) && (evt == kFail)) return kShowRetryLogin; else
	if ((mState == kSendLoginToServer) && (evt == kSuccess)) return kWasLoginValid; else
	if ((mState == kSendRegisterToServer) && (evt == kFail)) return kShowRetryRegister; else
	if ((mState == kSendRegisterToServer) && (evt == kSuccess)) return kWasRegisterValid; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSetWaitForLogin) && (evt == kNext)) return kSendLoginToServer; else
	if ((mState == kSetWaitForRegister) && (evt == kNext)) return kSendRegisterToServer; else
	if ((mState == kShowCouldNotLogin) && (evt == kYes)) return kIdle; else
	if ((mState == kShowCouldNotRegister) && (evt == kYes)) return kIdle; else
	if ((mState == kShowIncorrectFormat) && (evt == kYes)) return kIdle; else
	if ((mState == kShowNotYetImplemented) && (evt == kYes)) return kIdle; else
	if ((mState == kShowRetryLogin) && (evt == kNo)) return kShowCouldNotLogin; else
	if ((mState == kShowRetryLogin) && (evt == kYes)) return kSendLoginToServer; else
	if ((mState == kShowRetryRegister) && (evt == kNo)) return kShowCouldNotRegister; else
	if ((mState == kShowRetryRegister) && (evt == kYes)) return kSendRegisterToServer; else
	if ((mState == kStart) && (evt == kNext)) return kLoadLoginName; else
	if ((mState == kStoreTokenInformation) && (evt == kNext)) return kSaveLoginName; else
	if ((mState == kWasLoginValid) && (evt == kNo)) return kShowCouldNotLogin; else
	if ((mState == kWasLoginValid) && (evt == kYes)) return kStoreTokenInformation; else
	if ((mState == kWasRegisterValid) && (evt == kNo)) return kShowCouldNotRegister; else
	if ((mState == kWasRegisterValid) && (evt == kYes)) return kStoreTokenInformation;

	return kInvalidState;
}

bool LoginScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPeerSetLoginName:
		case kSaveLoginName:
		case kSendReloadInboxToVC:
		case kSetWaitForLogin:
		case kSetWaitForRegister:
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
	process(msg.mEvent);
}

void LoginScreen::update(const URLLoaderEvent& msg)
{
    if (msg.mId == this)
    {
        [mPeer setBlockingViewVisible:false];

        switch (msg.mEvent)
        {
            case URLLoaderEvent::kLoadFail: process(kFail); break;
            case URLLoaderEvent::kLoadedString:
            {
                switch (getState())
                {
                    case kSendLoginToServer:
                        mLoginJSON = JSONUtil::extract(msg.mString);
                        break;

                    case kSendRegisterToServer:
                        mRegisterJSON = JSONUtil::extract(msg.mString);
                        break;

                    default:
                        break;
                }
                process(kSuccess);
            }
                break;

            case URLLoaderEvent::kLoadedFile: process(kSuccess); break;
                
            default:
                break;
        }
    }
}

void LoginScreen::update(const GCTEvent& msg)
{
    switch (getState())
    {
        case kShowCouldNotLogin:
        case kShowIncorrectFormat:
        case kShowNotYetImplemented:
        case kShowRetryLogin:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
                case GCTEvent::kNoAlertPressed:     process(kNo); break;

                default:
                    break;
            }
            break;

        default:
            break;
    }
}

