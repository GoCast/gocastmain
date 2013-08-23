#pragma once

#include <queue>

class HUDDemoMessage;

class HUDDemo
: public tMealy,
// public tSubject<const OtherHUDDemoMessage&>,
  public tObserver<const HUDDemoMessage&>
{
protected:

public:
	HUDDemo();
	~HUDDemo();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void activeModeScreenEntry();
	void addMemberScreenEntry();
	void editGroupScreenEntry();
	void groupMemberScreenEntry();
	void inCallScreenEntry();
	void liveRecordScreenEntry();
	void loginScreenEntry();
	void makeNewGroupScreenEntry();
	void playbackEmailScreenEntry();

	void activeModeScreenExit();
	void addMemberScreenExit();
	void editGroupScreenExit();
	void groupMemberScreenExit();
	void inCallScreenExit();
	void liveRecordScreenExit();
	void loginScreenExit();
	void makeNewGroupScreenExit();
	void playbackEmailScreenExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kGo,
		kNo,
		kPressedActive,
		kPressedAddMember,
		kPressedCall,
		kPressedEditGroup,
		kPressedHangup,
		kPressedLiveRecord,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kActiveModeScreen,
		kAddMemberScreen,
		kEditGroupScreen,
		kEnd,
		kGroupMemberScreen,
		kInCallScreen,
		kLiveRecordScreen,
		kLoginScreen,
		kMakeNewGroupScreen,
		kPlaybackEmailScreen,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const HUDDemoMessage& msg);
};

class HUDDemoMessage
{
public:
	HUDDemo::EventType				mEvent;
	tSubject<const HUDDemoMessage&>*	mSource;

public:
	HUDDemoMessage(HUDDemo::EventType newEvent, tSubject<const HUDDemoMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


