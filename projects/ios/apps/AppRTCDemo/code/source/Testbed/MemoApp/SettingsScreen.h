#pragma once

class SettingsScreenMessage;
class MemoEvent;

class SettingsScreen
:   public tMealy,
    public tObserver<const SettingsScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public Screen
{
protected:

public:
	SettingsScreen();
	~SettingsScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void reallyChangePasswordEntry();
	void reallyLogOutEntry();
	void sendRestartToVCEntry();
	void setLoginNameEntry();
	void showPasswordChangedSuccessfullyEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kChangePassword,
		kLogOut,
		kNo,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kReallyChangePassword,
		kReallyLogOut,
		kSendRestartToVC,
		kSetLoginName,
		kShowPasswordChangedSuccessfully,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const SettingsScreenMessage& msg);
	void update(const MemoEvent& msg);
};

class SettingsScreenMessage
{
public:
	SettingsScreen::EventType				mEvent;
	tSubject<const SettingsScreenMessage&>*	mSource;

public:
	SettingsScreenMessage(SettingsScreen::EventType newEvent, tSubject<const SettingsScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


