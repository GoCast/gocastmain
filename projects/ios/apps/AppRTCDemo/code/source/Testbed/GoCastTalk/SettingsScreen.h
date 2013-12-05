#pragma once

#include <queue>

class SettingsScreenMessage;
class GCTEvent;

class SettingsScreen
:   public tMealy,
    public Screen,
    public tObserver<const SettingsScreenMessage&>,
    public tObserver<const GCTEvent&>
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

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
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


