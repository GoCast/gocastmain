#pragma once

@class SettingsVC;

class SettingsScreenMessage;

class SettingsScreen
:   public tMealy,
    public tObserver<const SettingsScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:
    SettingsVC* mPeer;

public:
	SettingsScreen(SettingsVC* newVC);
	~SettingsScreen();

    void registeredNamePressed();
    void changePasswordPressed();
    void logOutPressed();
    void aboutThisAppPressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void peerPushAboutEntry();
	void peerPushChangePasswordEntry();
	void peerPushChangeRegisteredNameEntry();
	void showNotYetImplementedEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kAboutThisAppSelected,
		kChangePasswordSelected,
		kLogOutSelected,
		kRegisteredNameSelected,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kPeerPushAbout,
		kPeerPushChangePassword,
		kPeerPushChangeRegisteredName,
		kShowNotYetImplemented,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const SettingsScreenMessage& msg);
	void update(const GCTEvent& msg);
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


