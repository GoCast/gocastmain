#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
StartScreen::StartScreen()
{
	ConstructMachine();
}

StartScreen::~StartScreen()
{
	DestructMachine();
}

void StartScreen::ready()
{
    this->process(kReady);
}

#pragma mark Start / End / Invalid
void StartScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    [gAppDelegateInstance setStartScreenVisible:true];
}

void StartScreen::endEntry()
{
    [gAppDelegateInstance setStartScreenVisible:false];
}

void StartScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void StartScreen::idleEntry()
{
}

void StartScreen::serverErrorIdleEntry()
{
}

#pragma mark Queries

void StartScreen::isNameAndPasswordFormatCorrectEntry()
{
    std::string str = [gAppDelegateInstance getUsername];

    bool result = !str.empty();

    for (size_t i = 0; i < str.size(); i++)
    {
        result &=   (str[i] >= '0' && str[i] <= '9') ||
                    (str[i] >= 'a' && str[i] <= 'z') ||
                    (str[i] >= 'A' && str[i] <= 'Z');
    }

    str = [gAppDelegateInstance getPassword];

    result &= !str.empty();

    for (size_t i = 0; i < str.size(); i++)
    {
        result &=   (str[i] >= '0' && str[i] <= '9') ||
        (str[i] >= 'a' && str[i] <= 'z') ||
        (str[i] >= 'A' && str[i] <= 'Z');
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void StartScreen::wasLoginSuccessfulEntry()
{
    bool result = false;

    if (JSONUtil::extract(mLoginJSON)["status"] == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void StartScreen::wasRegisterSuccessfulEntry()
{
    bool result = false;

    if (JSONUtil::extract(mRegisterJSON)["status"] == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void StartScreen::doesLoginTokenExistEntry()
{
    bool result = tFile(tFile::kPreferencesDirectory, "logintoken.txt").exists();

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void StartScreen::sendLoginRequestEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=login&name=%s&password=%s",
            kMemoAppServerURL,
            [gAppDelegateInstance getUsername].c_str(),
            [gAppDelegateInstance getPassword].c_str());

    URLLoader::getInstance()->loadString(buf);
}

void StartScreen::sendRegisterRequestEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=register&name=%s&password=%s",
            kMemoAppServerURL,
            [gAppDelegateInstance getUsername].c_str(),
            [gAppDelegateInstance getPassword].c_str());

    URLLoader::getInstance()->loadString(buf);
}

void StartScreen::writeLoginTokenToDiskEntry()
{
    tFile(tFile::kPreferencesDirectory, "logintoken.txt").write([gAppDelegateInstance getUsername]);
}

#pragma mark User Interface
void StartScreen::showFormatProblemEntry()
{
    tAlert("Username and password can only contain English letters and numbers");
}

void StartScreen::showLoginFailedEntry()
{
    tAlert("Login failed.");
}

void StartScreen::showRegistrationFailedEntry()
{
    tAlert("Registration failed.");
}

void StartScreen::showRegistrationSuccessfulEntry()
{
    tAlert("Registration successful.");
}

void StartScreen::showRetryLoginEntry()
{
    tConfirm("Couldn't contact server, retry login?");
}

void StartScreen::showRetryRegisterEntry()
{
    tConfirm("Couldn't contact server, retry registration?");
}

void StartScreen::showServerErrorEntry()
{
    tAlert("There was an unrecoverable server error. Please restart application.");
}

#pragma mark Messages to other machines
void StartScreen::sendGoInboxToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoInbox));
}


#pragma mark State wiring
void StartScreen::CallEntry()
{
	switch(mState)
	{
		case kDoesLoginTokenExist: doesLoginTokenExistEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsNameAndPasswordFormatCorrect: isNameAndPasswordFormatCorrectEntry(); break;
		case kSendGoInboxToVC: sendGoInboxToVCEntry(); break;
		case kSendLoginRequest: sendLoginRequestEntry(); break;
		case kSendRegisterRequest: sendRegisterRequestEntry(); break;
		case kServerErrorIdle: serverErrorIdleEntry(); break;
		case kShowFormatProblem: showFormatProblemEntry(); break;
		case kShowLoginFailed: showLoginFailedEntry(); break;
		case kShowRegistrationFailed: showRegistrationFailedEntry(); break;
		case kShowRegistrationSuccessful: showRegistrationSuccessfulEntry(); break;
		case kShowRetryLogin: showRetryLoginEntry(); break;
		case kShowRetryRegister: showRetryRegisterEntry(); break;
		case kShowServerError: showServerErrorEntry(); break;
		case kStart: startEntry(); break;
		case kWasLoginSuccessful: wasLoginSuccessfulEntry(); break;
		case kWasRegisterSuccessful: wasRegisterSuccessfulEntry(); break;
		case kWriteLoginTokenToDisk: writeLoginTokenToDiskEntry(); break;
		default: break;
	}
}

void StartScreen::CallExit()
{
}

int  StartScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDoesLoginTokenExist) && (evt == kNo)) return kIdle; else
	if ((mState == kDoesLoginTokenExist) && (evt == kYes)) return kSendGoInboxToVC; else
	if ((mState == kIdle) && (evt == kLogin)) return kIsNameAndPasswordFormatCorrect; else
	if ((mState == kIdle) && (evt == kNewAccount)) return kSendRegisterRequest; else
	if ((mState == kIsNameAndPasswordFormatCorrect) && (evt == kNo)) return kShowFormatProblem; else
	if ((mState == kIsNameAndPasswordFormatCorrect) && (evt == kYes)) return kSendLoginRequest; else
	if ((mState == kSendLoginRequest) && (evt == kFail)) return kShowRetryLogin; else
	if ((mState == kSendLoginRequest) && (evt == kSuccess)) return kWasLoginSuccessful; else
	if ((mState == kSendRegisterRequest) && (evt == kFail)) return kShowRetryRegister; else
	if ((mState == kSendRegisterRequest) && (evt == kSuccess)) return kWasRegisterSuccessful; else
	if ((mState == kServerErrorIdle) && (evt == kLogin)) return kShowServerError; else
	if ((mState == kServerErrorIdle) && (evt == kNewAccount)) return kShowServerError; else
	if ((mState == kShowFormatProblem) && (evt == kYes)) return kIdle; else
	if ((mState == kShowLoginFailed) && (evt == kYes)) return kIdle; else
	if ((mState == kShowRegistrationFailed) && (evt == kYes)) return kIdle; else
	if ((mState == kShowRegistrationSuccessful) && (evt == kYes)) return kSendLoginRequest; else
	if ((mState == kShowRetryLogin) && (evt == kNo)) return kShowServerError; else
	if ((mState == kShowRetryLogin) && (evt == kYes)) return kSendLoginRequest; else
	if ((mState == kShowRetryRegister) && (evt == kNo)) return kShowServerError; else
	if ((mState == kShowRetryRegister) && (evt == kYes)) return kSendRegisterRequest; else
	if ((mState == kShowServerError) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kStart) && (evt == kReady)) return kDoesLoginTokenExist; else
	if ((mState == kWasLoginSuccessful) && (evt == kNo)) return kShowLoginFailed; else
	if ((mState == kWasLoginSuccessful) && (evt == kYes)) return kWriteLoginTokenToDisk; else
	if ((mState == kWasRegisterSuccessful) && (evt == kNo)) return kShowRegistrationFailed; else
	if ((mState == kWasRegisterSuccessful) && (evt == kYes)) return kShowRegistrationSuccessful; else
	if ((mState == kWriteLoginTokenToDisk) && (evt == kNext)) return kSendGoInboxToVC;

	return kInvalidState;
}

bool StartScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kWriteLoginTokenToDisk:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void StartScreen::update(const StartScreenMessage& msg)
{
	process(msg.mEvent);
}

void StartScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kSignInPressed:     process(kLogin); break;
        case MemoEvent::kNewAccountPressed: process(kNewAccount); break;

        case MemoEvent::kOKYesAlertPressed: process(kYes); break;
        case MemoEvent::kNoAlertPressed:    process(kNo); break;

        default:
            break;
    }
}

void StartScreen::update(const URLLoaderEvent& msg)
{
    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendLoginRequest:
                    mLoginJSON = msg.mString;
                    break;

                case kSendRegisterRequest:
                    mRegisterJSON = msg.mString;
                    break;

                default:
                    break;
            }
            process(kSuccess);
        }
            break;

        default:
            break;
    }
}
