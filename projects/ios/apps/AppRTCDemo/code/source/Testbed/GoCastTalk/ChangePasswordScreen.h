#pragma once

@class ChangePasswordVC;

class ChangePasswordScreenMessage;

class ChangePasswordScreen
:   public tMealy,
    public tObserver<const ChangePasswordScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:
    ChangePasswordVC* mPeer;

public:
	ChangePasswordScreen(ChangePasswordVC* newVC);
	~ChangePasswordScreen();

    void savePressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void peerPopSelfEntry();
	void showNotYetImplementdEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kNo,
		kSaveSelected,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kPeerPopSelf,
		kShowNotYetImplementd,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const ChangePasswordScreenMessage& msg);
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


