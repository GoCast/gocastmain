#pragma once

class SettingsScreenMessage;
class MemoEvent;

class SettingsScreen
:   public tMealy,
    public tObserver<const SettingsScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public Screen
{
protected:
    std::string mChangePasswordJSON;

public:
	SettingsScreen();
	~SettingsScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void arePasswordFormatsCorrectEntry();
	void deleteLoginTokenFromDiskEntry();
	void idleEntry();
	void sendChangePasswordRequestEntry();
	void sendRestartToVCEntry();
	void setLoginNameEntry();
	void showChangePasswordFailedEntry();
	void showChangePasswordSuccessEntry();
	void showFormatProblemEntry();
	void showReallyChangePasswordEntry();
	void showReallyLogOutEntry();
	void showRetryChangePasswordEntry();
	void wasChangePasswordSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kChangePassword,
		kFail,
		kLogOut,
		kNo,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kArePasswordFormatsCorrect,
		kDeleteLoginTokenFromDisk,
		kEnd,
		kIdle,
		kSendChangePasswordRequest,
		kSendRestartToVC,
		kSetLoginName,
		kShowChangePasswordFailed,
		kShowChangePasswordSuccess,
		kShowFormatProblem,
		kShowReallyChangePassword,
		kShowReallyLogOut,
		kShowRetryChangePassword,
		kWasChangePasswordSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const SettingsScreenMessage& msg);
	void update(const MemoEvent& msg);
	void update(const URLLoaderEvent& msg);
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


