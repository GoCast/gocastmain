#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "ChangePasswordVC.h"

#define kScreenName "ChangePassword"

#pragma mark Helper methods
bool ChangePasswordScreen::EnsurePassword(const std::string &password)
{
    bool result = !password.empty();

    for (size_t i = 0; i < password.size(); i++)
    {
        result &=   (password[i] >= '0' && password[i] <= '9') ||
        (password[i] >= 'a' && password[i] <= 'z') ||
        (password[i] >= 'A' && password[i] <= 'Z');
    }

    return result;
}

#pragma mark Constructor / Destructor
ChangePasswordScreen::ChangePasswordScreen(ChangePasswordVC* newVC)
: mPeer(newVC)
{
	ConstructMachine();
}

ChangePasswordScreen::~ChangePasswordScreen()
{
	DestructMachine();
}

#pragma mark Public methods
void ChangePasswordScreen::savePressed()
{
    update(kSaveSelected);
}

#pragma mark Start / End / Invalid
void ChangePasswordScreen::startEntry()
{
    GoogleAnalytics::getInstance()->trackScreenEntry(kScreenName);

    URLLoader::getInstance()->attach(this);
    GCTEventManager::getInstance()->attach(this);
}

void ChangePasswordScreen::endEntry()
{
}

void ChangePasswordScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void ChangePasswordScreen::idleEntry()
{
}

#pragma mark Peer communication
void ChangePasswordScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

#pragma mark Queries
void ChangePasswordScreen::wasChangePasswordSuccessfulEntry()
{
    bool result     = false;
    bool expired    = false;
    bool locked     = false;

    if (mChangePasswordJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    if (mChangePasswordJSON["status"].mString == std::string("expired"))
    {
        expired = true;
    }

    if (mChangePasswordJSON["status"].mString == std::string("locked"))
    {
        locked = true;
    }

    SetImmediateEvent(expired ? kExpired : (locked ? kLocked : (result ? kYes : kNo)));
}

#pragma mark Actions
void ChangePasswordScreen::ensurePasswordsEntry()
{
    bool result;

    result  = EnsurePassword([mPeer getOldPassword]);
    result &= EnsurePassword([mPeer getNewPassword]);
    result &= [mPeer getOldPassword] != [mPeer getNewPassword];

    SetImmediateEvent(result ? kSuccess : kFail);
}

void ChangePasswordScreen::sendChangePasswordToServerEntry()
{
    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "changePassword"));

    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress.c_str()));
    params.push_back(std::pair<std::string, std::string>("oldpassword", [mPeer getOldPassword].c_str()));
    params.push_back(std::pair<std::string, std::string>("newpassword", [mPeer getNewPassword].c_str()));
    params.push_back(std::pair<std::string, std::string>("authToken", InboxScreen::mToken.c_str()));

    URLLoader::getInstance()->postLoadString(this, kMemoAppServerURL, params);
}

#pragma mark UI
void ChangePasswordScreen::setWaitForChangePasswordEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void ChangePasswordScreen::showChangePasswordLockedEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showChangePasswordLockedEntry");
    tAlert("Five unsuccessful change password attempts occurred. Your account will be locked for a half hour.");
}

void ChangePasswordScreen::showErrorWithChangePasswordEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showErrorWithChangePasswordEntry");
    tAlert("Cannot change password; old password is incorrect.");
}

void ChangePasswordScreen::showIncorrectFormatEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showIncorrectFormatEntry");
    tAlert("Password must be letters and numbers only, and new password must be different from old password.");
}

void ChangePasswordScreen::showSuccessChangedPasswordEntry()
{
    GoogleAnalytics::getInstance()->trackAlert(kScreenName, "showSuccessChangedPasswordEntry");
    tAlert("Changed password successfully.");
}

#pragma mark Sending messages to other machines
void ChangePasswordScreen::sendForceLogoutToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kForceLogout));
}

#pragma mark State wiring
void ChangePasswordScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kEnsurePasswords: ensurePasswordsEntry(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kSendChangePasswordToServer: sendChangePasswordToServerEntry(); break;
		case kSendForceLogoutToVC: sendForceLogoutToVCEntry(); break;
		case kSetWaitForChangePassword: setWaitForChangePasswordEntry(); break;
		case kShowChangePasswordLocked: showChangePasswordLockedEntry(); break;
		case kShowErrorWithChangePassword: showErrorWithChangePasswordEntry(); break;
		case kShowIncorrectFormat: showIncorrectFormatEntry(); break;
		case kShowSuccessChangedPassword: showSuccessChangedPasswordEntry(); break;
		case kStart: startEntry(); break;
		case kWasChangePasswordSuccessful: wasChangePasswordSuccessfulEntry(); break;
		default: break;
	}
}

void ChangePasswordScreen::CallExit()
{
}

int  ChangePasswordScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kEnsurePasswords) && (evt == kFail)) return kShowIncorrectFormat; else
	if ((mState == kEnsurePasswords) && (evt == kSuccess)) return kSetWaitForChangePassword; else
	if ((mState == kIdle) && (evt == kSaveSelected)) return kEnsurePasswords; else
	if ((mState == kSendChangePasswordToServer) && (evt == kFail)) return kShowErrorWithChangePassword; else
	if ((mState == kSendChangePasswordToServer) && (evt == kSuccess)) return kWasChangePasswordSuccessful; else
	if ((mState == kSendForceLogoutToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSetWaitForChangePassword) && (evt == kNext)) return kSendChangePasswordToServer; else
	if ((mState == kShowChangePasswordLocked) && (evt == kYes)) return kIdle; else
	if ((mState == kShowErrorWithChangePassword) && (evt == kYes)) return kIdle; else
	if ((mState == kShowIncorrectFormat) && (evt == kYes)) return kIdle; else
	if ((mState == kShowSuccessChangedPassword) && (evt == kYes)) return kPeerPopSelf; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kWasChangePasswordSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasChangePasswordSuccessful) && (evt == kLocked)) return kShowChangePasswordLocked; else
	if ((mState == kWasChangePasswordSuccessful) && (evt == kNo)) return kShowErrorWithChangePassword; else
	if ((mState == kWasChangePasswordSuccessful) && (evt == kYes)) return kShowSuccessChangedPassword;

	return kInvalidState;
}

bool ChangePasswordScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kSendForceLogoutToVC:
		case kSetWaitForChangePassword:
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void ChangePasswordScreen::update(const ChangePasswordScreenMessage& msg)
{
    switch (msg.mEvent)
    {
        case kSaveSelected: GoogleAnalytics::getInstance()->trackButton(kScreenName, "kSaveSelected"); break;
        default: break;
    }

	process(msg.mEvent);
}

void ChangePasswordScreen::update(const URLLoaderEvent& msg)
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

void ChangePasswordScreen::update(const GCTEvent& msg)
{
    if (msg.mEvent == GCTEvent::kLanguageChanged)
    {
        [mPeer refreshLanguage];
    }

    switch (getState())
    {
        case kShowChangePasswordLocked:
        case kShowErrorWithChangePassword:
        case kShowIncorrectFormat:
        case kShowSuccessChangedPassword:
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
