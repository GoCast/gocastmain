#include "Base/package.h"

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
    [gAppDelegateInstance setSettingsScreenVisible:true];
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

#pragma mark User Interface
void SettingsScreen::setLoginNameEntry()
{
    [gAppDelegateInstance setSettingsLoggedInName:"placeholder"];
}

#pragma mark Actions
void SettingsScreen::reallyChangePasswordEntry()
{
    tConfirm("Really change password?");
}

void SettingsScreen::reallyLogOutEntry()
{
    tConfirm("Really log out?");
}

void SettingsScreen::showPasswordChangedSuccessfullyEntry()
{
    tAlert("Password changed successfully");
}

#pragma mark Messages to other machines
void SettingsScreen::sendRestartToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kRestart));
}

#pragma mark State wiring
void SettingsScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kReallyChangePassword: reallyChangePasswordEntry(); break;
		case kReallyLogOut: reallyLogOutEntry(); break;
		case kSendRestartToVC: sendRestartToVCEntry(); break;
		case kSetLoginName: setLoginNameEntry(); break;
		case kShowPasswordChangedSuccessfully: showPasswordChangedSuccessfullyEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void SettingsScreen::CallExit()
{
}

int  SettingsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kChangePassword)) return kReallyChangePassword; else
	if ((mState == kIdle) && (evt == kLogOut)) return kReallyLogOut; else
	if ((mState == kReallyChangePassword) && (evt == kNo)) return kIdle; else
	if ((mState == kReallyChangePassword) && (evt == kYes)) return kShowPasswordChangedSuccessfully; else
	if ((mState == kReallyLogOut) && (evt == kNo)) return kIdle; else
	if ((mState == kReallyLogOut) && (evt == kYes)) return kSendRestartToVC; else
	if ((mState == kSetLoginName) && (evt == kNext)) return kIdle; else
	if ((mState == kShowPasswordChangedSuccessfully) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kSetLoginName;

	return kInvalidState;
}

bool SettingsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
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
        case MemoEvent::kChangePasswordPressed:
            process(kChangePassword);
            break;
        case MemoEvent::kLogOutPressed:
            process(kLogOut);
            break;
        case MemoEvent::kOKYesAlertPressed:
            process(kYes);
            break;
        case MemoEvent::kNoAlertPressed:
            process(kNo);
            break;
        default:
            break;
    }
}
