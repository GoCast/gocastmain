#pragma once

@class ChangePasswordVC;

class ChangePasswordScreenMessage;

class ChangePasswordScreen
:   public tMealy,
    public tObserver<const ChangePasswordScreenMessage&>,
    public tObserver<const URLLoaderEvent&>,
    public tObserver<const GCTEvent&>
{
protected:
    ChangePasswordVC*   mPeer;
    JSONObject          mChangePasswordJSON;

protected:
    bool EnsurePassword(const std::string& password);

public:
	ChangePasswordScreen(ChangePasswordVC* newVC);
	~ChangePasswordScreen();

    void savePressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void ensurePasswordsEntry();
	void idleEntry();
	void peerPopSelfEntry();
	void sendChangePasswordToServerEntry();
	void sendForceLogoutToVCEntry();
	void setWaitForChangePasswordEntry();
	void showErrorWithChangePasswordEntry();
	void showIncorrectFormatEntry();
	void showSuccessChangedPasswordEntry();
	void wasLogoutSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kExpired,
		kFail,
		kNo,
		kSaveSelected,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kEnsurePasswords,
		kIdle,
		kPeerPopSelf,
		kSendChangePasswordToServer,
		kSendForceLogoutToVC,
		kSetWaitForChangePassword,
		kShowErrorWithChangePassword,
		kShowIncorrectFormat,
		kShowSuccessChangedPassword,
		kWasLogoutSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const ChangePasswordScreenMessage& msg);
	void update(const URLLoaderEvent& msg);
	void update(const GCTEvent& msg);
};

class ChangePasswordScreenMessage
{
public:
	ChangePasswordScreen::EventType				mEvent;
	tSubject<const ChangePasswordScreenMessage&>*	mSource;

public:
	ChangePasswordScreenMessage(ChangePasswordScreen::EventType newEvent, tSubject<const ChangePasswordScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


