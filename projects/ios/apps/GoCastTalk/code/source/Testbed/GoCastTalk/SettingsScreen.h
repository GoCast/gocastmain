#pragma once

@class SettingsVC;

class SettingsScreenMessage;

class SettingsScreen
:   public tMealy,
    public tObserver<const SettingsScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    SettingsVC* mPeer;
    JSONObject  mLogoutJSON;

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

	void destroyStoredTokenEntry();
	void idleEntry();
	void peerPushAboutEntry();
	void peerPushChangePasswordEntry();
	void peerPushChangeRegisteredNameEntry();
	void sendForceLogoutToVCEntry();
	void sendLogoutToServerEntry();
	void setWaitForLogoutEntry();
	void showConfirmLogoutEntry();
	void showErrorWithLogoutEntry();
	void showSuccessWithLogoutEntry();
	void wasLogoutSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kAboutThisAppSelected,
		kChangePasswordSelected,
		kFail,
		kLogOutSelected,
		kNo,
		kRegisteredNameSelected,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kDestroyStoredToken,
		kEnd,
		kIdle,
		kPeerPushAbout,
		kPeerPushChangePassword,
		kPeerPushChangeRegisteredName,
		kSendForceLogoutToVC,
		kSendLogoutToServer,
		kSetWaitForLogout,
		kShowConfirmLogout,
		kShowErrorWithLogout,
		kShowSuccessWithLogout,
		kWasLogoutSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const SettingsScreenMessage& msg);
	void update(const URLLoaderEvent& msg);
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


