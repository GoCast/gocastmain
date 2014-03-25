#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "ChangePasswordVC.h"

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
    process(kSaveSelected);
}

#pragma mark Start / End / Invalid
void ChangePasswordScreen::startEntry()
{
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
void ChangePasswordScreen::wasLogoutSuccessfulEntry()
{
    bool result     = false;
    bool expired    = false;

    if (mChangePasswordJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    if (mChangePasswordJSON["status"].mString == std::string("expired"))
    {
        expired = true;
    }

    SetImmediateEvent(expired ? kExpired : (result ? kYes : kNo));
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
    char buf[512];

    sprintf(buf, "%s?action=changePassword&name=%s&oldpassword=%s&newpassword=%s&authToken=%s",
            kMemoAppServerURL,
            InboxScreen::mEmailAddress.c_str(),
            [mPeer getOldPassword].c_str(),
            [mPeer getNewPassword].c_str(),
            InboxScreen::mToken.c_str());

    URLLoader::getInstance()->loadString(this, buf);
}

#pragma mark UI
void ChangePasswordScreen::setWaitForChangePasswordEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void ChangePasswordScreen::showErrorWithChangePasswordEntry()
{
    tAlert("Cannot change password; old password is incorrect.");
}

void ChangePasswordScreen::showIncorrectFormatEntry()
{
    //"Password must be letters and numbers only."
    tAlert("Password must be letters and numbers only, and new password must be different from old password.");
}

void ChangePasswordScreen::showSuccessChangedPasswordEntry()
{
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
		case kShowErrorWithChangePassword: showErrorWithChangePasswordEntry(); break;
		case kShowIncorrectFormat: showIncorrectFormatEntry(); break;
		case kShowSuccessChangedPassword: showSuccessChangedPasswordEntry(); break;
		case kStart: startEntry(); break;
		case kWasLogoutSuccessful: wasLogoutSuccessfulEntry(); break;
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
	if ((mState == kSendChangePasswordToServer) && (evt == kSuccess)) return kWasLogoutSuccessful; else
	if ((mState == kSendForceLogoutToVC) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSetWaitForChangePassword) && (evt == kNext)) return kSendChangePasswordToServer; else
	if ((mState == kShowErrorWithChangePassword) && (evt == kYes)) return kIdle; else
	if ((mState == kShowIncorrectFormat) && (evt == kYes)) return kIdle; else
	if ((mState == kShowSuccessChangedPassword) && (evt == kYes)) return kPeerPopSelf; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kWasLogoutSuccessful) && (evt == kExpired)) return kSendForceLogoutToVC; else
	if ((mState == kWasLogoutSuccessful) && (evt == kNo)) return kShowErrorWithChangePassword; else
	if ((mState == kWasLogoutSuccessful) && (evt == kYes)) return kShowSuccessChangedPassword;

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
	process(msg.mEvent);
}

void ChangePasswordScreen::update(const URLLoaderEvent& msg)
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
                    case kSendChangePasswordToServer:
                        mChangePasswordJSON = JSONUtil::extract(msg.mString);
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

void ChangePasswordScreen::update(const GCTEvent& msg)
{
    switch (getState())
    {
        case kShowErrorWithChangePassword:
        case kShowIncorrectFormat:
        case kShowSuccessChangedPassword:
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
