#pragma once

class VersionCheckScreenMessage;

class VersionCheckScreen
:   public tMealy,
    public tObserver<const VersionCheckScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public tObserver<const URLLoaderEvent&>,
    public Screen
{
protected:
    std::string mVersionRequiredJSON;

public:
	VersionCheckScreen();
	~VersionCheckScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void isThisClientCompatibleEntry();
	void sendFailToVCEntry();
	void sendSuccessToVCEntry();
	void sendVersionRequiredRequestEntry();
	void showRetryVersionEntry();

	void idleExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kNo,
		kRetry,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kIsThisClientCompatible,
		kSendFailToVC,
		kSendSuccessToVC,
		kSendVersionRequiredRequest,
		kShowRetryVersion,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const VersionCheckScreenMessage& msg);
	void update(const MemoEvent& msg);
	void update(const URLLoaderEvent& msg);
};

class VersionCheckScreenMessage
{
public:
	VersionCheckScreen::EventType				mEvent;
	tSubject<const VersionCheckScreenMessage&>*	mSource;

public:
	VersionCheckScreenMessage(VersionCheckScreen::EventType newEvent, tSubject<const VersionCheckScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


