#include "Base/package.h"

#include "HUDDemo.h"

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

}

void HUDDemo::loginScreenExit()
{

}

void HUDDemo::groupMemberScreenEntry()
{

}

void HUDDemo::groupMemberScreenExit()
{

}

void HUDDemo::inCallScreenEntry()
{

}

void HUDDemo::inCallScreenExit()
{

}

void HUDDemo::activeModeScreenEntry()
{

}

void HUDDemo::activeModeScreenExit()
{

}

void HUDDemo::addMemberScreenEntry()
{

}

void HUDDemo::addMemberScreenExit()
{

}

void HUDDemo::makeNewGroupScreenEntry()
{

}

void HUDDemo::makeNewGroupScreenExit()
{

}

void HUDDemo::editGroupScreenEntry()
{

}

void HUDDemo::editGroupScreenExit()
{

}

void HUDDemo::liveRecordScreenEntry()
{

}

void HUDDemo::liveRecordScreenExit()
{

}

void HUDDemo::playbackEmailScreenEntry()
{

}

void HUDDemo::playbackEmailScreenExit()
{

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
	if ((mState == kEditGroupScreen) && (evt == kGo)) return kGroupMemberScreen; else
	if ((mState == kGroupMemberScreen) && (evt == kPressedActive)) return kActiveModeScreen; else
	if ((mState == kGroupMemberScreen) && (evt == kPressedAddMember)) return kAddMemberScreen; else
	if ((mState == kGroupMemberScreen) && (evt == kPressedCall)) return kInCallScreen; else
	if ((mState == kGroupMemberScreen) && (evt == kPressedEditGroup)) return kEditGroupScreen; else
	if ((mState == kInCallScreen) && (evt == kPressedLiveRecord)) return kLiveRecordScreen; else
	if ((mState == kLiveRecordScreen) && (evt == kPressedHangup)) return kPlaybackEmailScreen; else
	if ((mState == kLoginScreen) && (evt == kGo)) return kGroupMemberScreen; else
	if ((mState == kMakeNewGroupScreen) && (evt == kNo)) return kGroupMemberScreen; else
	if ((mState == kMakeNewGroupScreen) && (evt == kYes)) return kGroupMemberScreen; else
	if ((mState == kPlaybackEmailScreen) && (evt == kGo)) return kMakeNewGroupScreen; else
	if ((mState == kStart) && (evt == kNext)) return kLoginScreen;

	return kInvalidState;
}

bool HUDDemo::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void HUDDemo::update(const HUDDemoMessage& msg)
{
	process(msg.mEvent);
}

