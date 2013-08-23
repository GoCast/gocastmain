#include "Base/package.h"

#include "HUDDemo.h"
#include "HUDEvent.h"
#include "HUDEventManager.h"

#include "AppDelegate.h"

HUDDemo gHUDDemoApp;
extern AppDelegate* gAppDelegateInstance;

#pragma mark Constructor / Destructor
HUDDemo::HUDDemo()
{
	ConstructMachine();
}

HUDDemo::~HUDDemo()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void HUDDemo::startEntry()
{
    HUDEventManager::getInstance()->attach(this);
}

void HUDDemo::endEntry()
{
}

void HUDDemo::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Screens

void HUDDemo::loginScreenEntry()
{
    [gAppDelegateInstance setLoginScreenVisible:true];
}

void HUDDemo::loginScreenExit()
{
    [gAppDelegateInstance setLoginScreenVisible:false];
}

void HUDDemo::groupMemberScreenEntry()
{
    [gAppDelegateInstance setGroupMemberScreenVisible:true];
}

void HUDDemo::groupMemberScreenExit()
{
    [gAppDelegateInstance setGroupMemberScreenVisible:false];
}

void HUDDemo::inCallScreenEntry()
{
    [gAppDelegateInstance setInCallScreenVisible:true];
}

void HUDDemo::inCallScreenExit()
{
    [gAppDelegateInstance setInCallScreenVisible:false];
}

void HUDDemo::activeModeScreenEntry()
{
    [gAppDelegateInstance setActiveModeScreenVisible:true];
}

void HUDDemo::activeModeScreenExit()
{
    [gAppDelegateInstance setActiveModeScreenVisible:false];
}

void HUDDemo::addMemberScreenEntry()
{
    [gAppDelegateInstance setAddMemberScreenVisible:true];
}

void HUDDemo::addMemberScreenExit()
{
    [gAppDelegateInstance setAddMemberScreenVisible:false];
}

void HUDDemo::makeNewGroupScreenEntry()
{
    [gAppDelegateInstance setMakeNewGroupScreenVisible:true];
}

void HUDDemo::makeNewGroupScreenExit()
{
    [gAppDelegateInstance setMakeNewGroupScreenVisible:false];
}

void HUDDemo::editGroupScreenEntry()
{
    [gAppDelegateInstance setEditGroupScreenVisible:true];
}

void HUDDemo::editGroupScreenExit()
{
    [gAppDelegateInstance setEditGroupScreenVisible:false];
}

void HUDDemo::liveRecordScreenEntry()
{
    [gAppDelegateInstance setLiveRecordScreenVisible:true];
}

void HUDDemo::liveRecordScreenExit()
{
    [gAppDelegateInstance setLiveRecordScreenVisible:false];
}

void HUDDemo::playbackEmailScreenEntry()
{
    [gAppDelegateInstance setPlaybackEmailScreenVisible:true];
}

void HUDDemo::playbackEmailScreenExit()
{
    [gAppDelegateInstance setPlaybackEmailScreenVisible:false];
}

#pragma mark State wiring
void HUDDemo::CallEntry()
{
	switch(mState)
	{
		case kActiveModeScreen: activeModeScreenEntry(); break;
		case kAddMemberScreen: addMemberScreenEntry(); break;
		case kEditGroupScreen: editGroupScreenEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kGroupMemberScreen: groupMemberScreenEntry(); break;
		case kInCallScreen: inCallScreenEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kLiveRecordScreen: liveRecordScreenEntry(); break;
		case kLoginScreen: loginScreenEntry(); break;
		case kMakeNewGroupScreen: makeNewGroupScreenEntry(); break;
		case kPlaybackEmailScreen: playbackEmailScreenEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void HUDDemo::CallExit()
{
	switch(mState)
	{
		case kActiveModeScreen: activeModeScreenExit(); break;
		case kAddMemberScreen: addMemberScreenExit(); break;
		case kEditGroupScreen: editGroupScreenExit(); break;
		case kGroupMemberScreen: groupMemberScreenExit(); break;
		case kInCallScreen: inCallScreenExit(); break;
		case kLiveRecordScreen: liveRecordScreenExit(); break;
		case kLoginScreen: loginScreenExit(); break;
		case kMakeNewGroupScreen: makeNewGroupScreenExit(); break;
		case kPlaybackEmailScreen: playbackEmailScreenExit(); break;
		default: break;
	}
}

int  HUDDemo::StateTransitionFunction(const int evt) const
{
	if ((mState == kActiveModeScreen) && (evt == kActive)) return kGroupMemberScreen; else
	if ((mState == kActiveModeScreen) && (evt == kDecline)) return kGroupMemberScreen; else
	if ((mState == kActiveModeScreen) && (evt == kSilent)) return kGroupMemberScreen; else
	if ((mState == kEditGroupScreen) && (evt == kGo)) return kGroupMemberScreen; else
	if ((mState == kGroupMemberScreen) && (evt == kActiveMode)) return kActiveModeScreen; else
	if ((mState == kGroupMemberScreen) && (evt == kAddMember)) return kAddMemberScreen; else
	if ((mState == kGroupMemberScreen) && (evt == kCall)) return kInCallScreen; else
	if ((mState == kGroupMemberScreen) && (evt == kEditGroup)) return kEditGroupScreen; else
	if ((mState == kInCallScreen) && (evt == kLiveRecord)) return kLiveRecordScreen; else
	if ((mState == kLiveRecordScreen) && (evt == kHangup)) return kPlaybackEmailScreen; else
	if ((mState == kLoginScreen) && (evt == kSignIn)) return kGroupMemberScreen; else
	if ((mState == kMakeNewGroupScreen) && (evt == kNo)) return kGroupMemberScreen; else
	if ((mState == kMakeNewGroupScreen) && (evt == kYes)) return kGroupMemberScreen; else
	if ((mState == kPlaybackEmailScreen) && (evt == kGo)) return kMakeNewGroupScreen; else
	if ((mState == kStart) && (evt == kReady)) return kLoginScreen;

	return kInvalidState;
}

bool HUDDemo::HasEdgeNamedNext() const
{
	return false;
}

#pragma mark Messages
void HUDDemo::update(const HUDEvent& msg)
{
    switch (msg.mEvent)
    {
        case HUDEvent::kAppDelegateInit:    process(kReady); break;

        case HUDEvent::kSignInPressed:      process(kSignIn); break;

        case HUDEvent::kCallPressed:        process(kCall); break;
        case HUDEvent::kActiveModePressed:  process(kActiveMode); break;
        case HUDEvent::kAddMemberPressed:   process(kAddMember); break;
        case HUDEvent::kEditGroupPressed:   process(kEditGroup); break;

        case HUDEvent::kLiveRecordPressed:  process(kLiveRecord); break;
        case HUDEvent::kHangupPressed:      process(kHangup); break;

        case HUDEvent::kActivePressed:      process(kActive); break;
        case HUDEvent::kSilentPressed:      process(kSilent); break;
        case HUDEvent::kDeclinePressed:     process(kDecline); break;
        default:
            break;
    }
}

void HUDDemo::update(const HUDDemoMessage& msg)
{
	process(msg.mEvent);
}

