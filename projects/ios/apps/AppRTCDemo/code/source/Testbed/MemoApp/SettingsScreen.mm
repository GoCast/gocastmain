#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
SettingsScreen::SettingsScreen()
{
	ConstructMachine();
}

SettingsScreen::~SettingsScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void SettingsScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    [gAppDelegateInstance setSettingsScreenVisible:true];
    [gAppDelegateInstance setNavigationBarTitle:"Settings"];
}

void SettingsScreen::endEntry()
{
    [gAppDelegateInstance setSettingsScreenVisible:false];
}

void SettingsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void SettingsScreen::idleEntry()
{
}

#pragma mark Queries
void SettingsScreen::arePasswordFormatsCorrectEntry()
{
    std::string str = [gAppDelegateInstance getOldPassword];

    bool result = !str.empty();

    for (size_t i = 0; i < str.size(); i++)
    {
        result &=   (str[i] >= '0' && str[i] <= '9') ||
        (str[i] >= 'a' && str[i] <= 'z') ||
        (str[i] >= 'A' && str[i] <= 'Z');
    }

    str = [gAppDelegateInstance getNewPassword];

    result &= !str.empty();

    for (size_t i = 0; i < str.size(); i++)
    {
        result &=   (str[i] >= '0' && str[i] <= '9') ||
        (str[i] >= 'a' && str[i] <= 'z') ||
        (str[i] >= 'A' && str[i] <= 'Z');
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void SettingsScreen::wasChangePasswordSuccessfulEntry()
{
    bool result = false;

    if (mChangePasswordJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark User Interface
void SettingsScreen::setLoginNameEntry()
{
    [gAppDelegateInstance setSettingsLoggedInName:std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt"))];
}

#pragma mark Actions
void SettingsScreen::sendChangePasswordRequestEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=changePassword&name=%s&password=%s&newpassword=%s",
            kMemoAppServerURL,
            std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt")).c_str(),
            [gAppDelegateInstance getOldPassword].c_str(),
            [gAppDelegateInstance getNewPassword].c_str());

    URLLoader::getInstance()->loadString(buf);
}

void SettingsScreen::showFormatProblemEntry()
{
    tAlert("Passwords can only contain English letters and numbers");
}

void SettingsScreen::showReallyChangePasswordEntry()
{
    tConfirm("Really change password?");
}

void SettingsScreen::showReallyLogOutEntry()
{
    tConfirm("Really log out?");
}

void SettingsScreen::showRetryChangePasswordEntry()
{
    tConfirm("Couldn't contact server, retry password change?");
}

void SettingsScreen::showChangePasswordFailedEntry()
{
    tAlert("Password change failed");
}

void SettingsScreen::showChangePasswordSuccessEntry()
{
    tAlert("Password changed successfully");
}

void SettingsScreen::deleteLoginTokenFromDiskEntry()
{
    tFile(tFile::kPreferencesDirectory, "logintoken.txt").remove();
}

#pragma mark Messages to other machines
void SettingsScreen::sendRestartToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kRestart));
}

void SettingsScreen::sendGoEditProfileToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoEditProfile));
}

#pragma mark State wiring
void SettingsScreen::CallEntry()
{
	switch(mState)
	{
		case kArePasswordFormatsCorrect: arePasswordFormatsCorrectEntry(); break;
		case kDeleteLoginTokenFromDisk: deleteLoginTokenFromDiskEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kSendChangePasswordRequest: sendChangePasswordRequestEntry(); break;
		case kSendGoEditProfileToVC: sendGoEditProfileToVCEntry(); break;
		case kSendRestartToVC: sendRestartToVCEntry(); break;
		case kSetLoginName: setLoginNameEntry(); break;
		case kShowChangePasswordFailed: showChangePasswordFailedEntry(); break;
		case kShowChangePasswordSuccess: showChangePasswordSuccessEntry(); break;
		case kShowFormatProblem: showFormatProblemEntry(); break;
		case kShowReallyChangePassword: showReallyChangePasswordEntry(); break;
		case kShowReallyLogOut: showReallyLogOutEntry(); break;
		case kShowRetryChangePassword: showRetryChangePasswordEntry(); break;
		case kStart: startEntry(); break;
		case kWasChangePasswordSuccessful: wasChangePasswordSuccessfulEntry(); break;
		default: break;
	}
}

void SettingsScreen::CallExit()
{
}

int  SettingsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kArePasswordFormatsCorrect) && (evt == kNo)) return kShowFormatProblem; else
	if ((mState == kArePasswordFormatsCorrect) && (evt == kYes)) return kShowReallyChangePassword; else
	if ((mState == kDeleteLoginTokenFromDisk) && (evt == kNext)) return kSendRestartToVC; else
	if ((mState == kIdle) && (evt == kChangePassword)) return kArePasswordFormatsCorrect; else
	if ((mState == kIdle) && (evt == kEditProfile)) return kSendGoEditProfileToVC; else
	if ((mState == kIdle) && (evt == kLogOut)) return kShowReallyLogOut; else
	if ((mState == kSendChangePasswordRequest) && (evt == kFail)) return kShowRetryChangePassword; else
	if ((mState == kSendChangePasswordRequest) && (evt == kSuccess)) return kWasChangePasswordSuccessful; else
	if ((mState == kSetLoginName) && (evt == kNext)) return kIdle; else
	if ((mState == kShowChangePasswordFailed) && (evt == kYes)) return kIdle; else
	if ((mState == kShowChangePasswordSuccess) && (evt == kYes)) return kIdle; else
	if ((mState == kShowFormatProblem) && (evt == kYes)) return kIdle; else
	if ((mState == kShowReallyChangePassword) && (evt == kNo)) return kIdle; else
	if ((mState == kShowReallyChangePassword) && (evt == kYes)) return kSendChangePasswordRequest; else
	if ((mState == kShowReallyLogOut) && (evt == kNo)) return kIdle; else
	if ((mState == kShowReallyLogOut) && (evt == kYes)) return kDeleteLoginTokenFromDisk; else
	if ((mState == kShowRetryChangePassword) && (evt == kNo)) return kIdle; else
	if ((mState == kShowRetryChangePassword) && (evt == kYes)) return kSendChangePasswordRequest; else
	if ((mState == kStart) && (evt == kNext)) return kSetLoginName; else
	if ((mState == kWasChangePasswordSuccessful) && (evt == kNo)) return kShowChangePasswordFailed; else
	if ((mState == kWasChangePasswordSuccessful) && (evt == kYes)) return kShowChangePasswordSuccess;

	return kInvalidState;
}

bool SettingsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kDeleteLoginTokenFromDisk:
		case kSetLoginName:
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void SettingsScreen::update(const SettingsScreenMessage& msg)
{
	process(msg.mEvent);
}

void SettingsScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kChangePasswordPressed: process(kChangePassword); break;
        case MemoEvent::kLogOutPressed:         process(kLogOut); break;
        case MemoEvent::kOKYesAlertPressed:     process(kYes); break;
        case MemoEvent::kNoAlertPressed:        process(kNo); break;
        case MemoEvent::kEditProfilePressed:    process(kEditProfile); break;
        default:
            break;
    }
}

void SettingsScreen::update(const URLLoaderEvent& msg)
{
    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendChangePasswordRequest:
                    mChangePasswordJSON = JSONUtil::extract(msg.mString);
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
